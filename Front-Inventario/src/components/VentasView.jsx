import React, { useState, useEffect, useRef } from "react";
import { postData, getNegocio, getNotas, createNota, deleteNota } from "../components/utils/api"; 
import { getTurnoActivo, abrirTurno, cerrarTurno } from "../components/utils/api"; 
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import { useReactToPrint } from "react-to-print"; 
import { Barcode, AlertCircle, ShoppingCart, Trash2, CheckCircle2, MessageSquare, Camera } from "lucide-react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import "react-toastify/dist/ReactToastify.css";
import "../styles/modules/VentasModule.css";
import "../styles/ModalTurno.css"; 

// COMPONENTE DEL TICKET
const TicketToPrint = React.forwardRef(({ ventaFinal, productos, negocioConfig, clienteNombre }, ref) => {
  const total = ventaFinal.detalles.reduce((acc, d) => {
    const p = productos.find(prod => (prod.id_producto || prod.id) === d.productoId);
    return acc + ((p?.precio || p?.valor || 0) * d.cantidad);
  }, 0);

  return (
    <div ref={ref} style={{ padding: "30px", fontFamily: "Arial, sans-serif", width: "320px", margin: "0 auto", color: "#000" }}>
      <div style={{ textAlign: "center", marginBottom: "20px", borderBottom: "1px solid #000", paddingBottom: "10px" }}>
        <h2 style={{ margin: "0 0 5px 0", textTransform: "uppercase" }}>{negocioConfig?.nombre || "Comprobante"}</h2>
        <p style={{ margin: "0", fontSize: "12px" }}>{negocioConfig?.ticketCabecera}</p>
        <p style={{ margin: "10px 0 0 0", fontSize: "11px" }}>Fecha: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
        <p style={{ margin: "2px 0", fontSize: "11px" }}>Número de Operación: {ventaFinal.id}</p>
        {clienteNombre && <p style={{ margin: "2px 0", fontSize: "11px" }}>Cliente: {clienteNombre}</p>}
      </div>

      <table style={{ width: "100%", fontSize: "12px", marginBottom: "20px", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #eee" }}>
            <th style={{ textAlign: "left", padding: "5px 0" }}>Cant.</th>
            <th style={{ textAlign: "left", padding: "5px 0" }}>Descripción</th>
            <th style={{ textAlign: "right", padding: "5px 0" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {ventaFinal.detalles.map((d, i) => {
            const p = productos.find(prod => (prod.id_producto || prod.id) === d.productoId);
            const precio = p?.precio || p?.valor || 0;
            return (
              <tr key={i}>
                <td style={{ padding: "5px 0" }}>{d.cantidad}</td>
                <td style={{ padding: "5px 0" }}>{p ? p.descripcion : "Producto"}</td>
                <td style={{ textAlign: "right", padding: "5px 0" }}>${(precio * d.cantidad).toLocaleString("es-AR")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ borderTop: "2px solid #000", paddingTop: "10px", textAlign: "right" }}>
        <h3 style={{ margin: "0" }}>TOTAL: ${total.toLocaleString("es-AR")}</h3>
        <p style={{ fontSize: "11px", marginTop: "5px" }}>Método de Pago: {ventaFinal.metodoPago}</p>
      </div>

      <div style={{ textAlign: "center", marginTop: "30px", fontSize: "11px", fontStyle: "italic" }}>
        <p>{negocioConfig?.ticketPie}</p>
      </div>
    </div>
  );
});

const VentasView = ({ productos = [], setProductos, clientes = [], user, onLogout }) => {
  
  // ESTADOS DE TURNO Y CAJA
  const [turnoActivo, setTurnoActivo] = useState(null);
  const [loadingTurno, setLoadingTurno] = useState(true);
  const [montoInicial, setMontoInicial] = useState("");
  const [showCerrarModal, setShowCerrarModal] = useState(false);
  const [montoCierre, setMontoCierre] = useState("");
  const [observacionesCierre, setObservacionesCierre] = useState("");

  // ESTADOS SECUNDARIOS
  const [negocioConfig, setNegocioConfig] = useState({});
  const [nota, setNota] = useState("");
  const [notas, setNotas] = useState([]);

  // ESTADOS DE VENTAS Y ESCÁNER
  const [venta, setVenta] = useState({ clienteId: null, detalles: [] });
  const [metodoPago, setMetodoPago] = useState("EFECTIVO"); 
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState("1");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [ventaRegistrada, setVentaRegistrada] = useState(null); 
  
  const [codigoEscaneado, setCodigoEscaneado] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const scannerRef = useRef(null);

  // ESTADOS PARA ALTA RÁPIDA (Producto no encontrado)
  const [showAltaRapidaModal, setShowAltaRapidaModal] = useState(false);
  const [codigoDesconocido, setCodigoDesconocido] = useState("");
  const [nuevoProductoRapido, setNuevoProductoRapido] = useState({ descripcion: "", precio: "", stock: "1" });

  const componentRef = useRef();
  
  // Ref para mantener siempre la versión más reciente de la función de escaneo
  const procesarCodigoRef = useRef();

  useEffect(() => {
    cargarTurno();
    cargarDatosSecundarios();
  }, []);

  useEffect(() => {
    if (turnoActivo && scannerRef.current && !showAltaRapidaModal && !showConfirmModal && !showCerrarModal && !showCamera) {
      scannerRef.current.focus();
    }
  }, [turnoActivo, showAltaRapidaModal, showConfirmModal, showCerrarModal, showCamera]);

  // Actualizar ref en cada render para no perder el estado más reciente de "productos" y "venta"
  useEffect(() => {
    procesarCodigoRef.current = procesarCodigoEscaneado;
  });

  // CÁMARA ESCÁNER EFECTO CORREGIDO CON CATCH Y SÓLO CÁMARA
  useEffect(() => {
    let scanner = null;
    let tiempoUltimoError = 0; // Control para no espamear el Toast

    if (showCamera) {
      // Pequeño timeout para asegurar que el modal y #reader estén dibujados en el DOM
      setTimeout(() => {
        scanner = new Html5QrcodeScanner(
          "reader", 
          { 
            qrbox: { width: 250, height: 200 }, 
            fps: 10,
            // Bloqueamos la subida de fotos, forzamos uso de cámara en vivo
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA] 
          }, 
          false
        );
        
        scanner.render((textoEscaneado) => {
          if (scanner) {
            scanner.clear().then(() => {
              setShowCamera(false);
              if (procesarCodigoRef.current) {
                procesarCodigoRef.current(textoEscaneado);
              }
            }).catch(err => console.error("Error al detener cámara:", err));
          }
        }, (err) => {
          // EL CATCH: Interceptamos si al escáner le cuesta leer el código
          if (typeof err === "string" && err.includes("No MultiFormat Readers")) {
            const ahora = Date.now();
            // Lanzamos el toast solo si pasaron más de 3 segundos del último aviso para no molestar visualmente
            if (ahora - tiempoUltimoError > 3000) {
              toast.warn("Intentando enfocar... Acerque la cámara o mejore la iluminación del código.", {
                position: "bottom-center",
                autoClose: 2000,
                hideProgressBar: true,
              });
              tiempoUltimoError = ahora;
            }
          }
        });
      }, 150);
    }
    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.error("Error al desmontar escáner:", e));
      }
    };
  }, [showCamera]);

  const cargarTurno = async () => {
    try {
      const turno = await getTurnoActivo();
      setTurnoActivo(turno || null);
    } catch (error) {
      console.error("Error al verificar la caja:", error);
    } finally {
      setLoadingTurno(false);
    }
  };

  const cargarDatosSecundarios = async () => {
    try {
      const dataNeg = await getNegocio();
      setNegocioConfig(Array.isArray(dataNeg) ? dataNeg[0] : dataNeg);
      const dataNotas = await getNotas();
      setNotas(Array.isArray(dataNotas) ? dataNotas : []);
    } catch (err) {
      console.error("Error cargando datos secundarios", err);
    }
  };

  const agregarNota = async () => {
    if (nota.trim()) {
      try {
        const nuevaNota = await createNota(nota.trim());
        setNotas([nuevaNota, ...notas]);
        setNota("");
        toast.success("Mensaje publicado");
      } catch (err) {
        toast.error("Error al publicar mensaje");
      }
    }
  };

  const eliminarNota = async (id) => {
    try {
      await deleteNota(id);
      setNotas(notas.filter((n) => n.id !== id));
      toast.info("Mensaje eliminado");
    } catch (err) {
      toast.error("Error al eliminar mensaje");
    }
  };

  const handleAbrirCaja = async (e) => {
    e.preventDefault();
    try {
      const monto = parseFloat(montoInicial) || 0;
      const nuevoTurno = await abrirTurno(monto);
      setTurnoActivo(nuevoTurno);
      toast.success("Apertura de caja exitosa");
    } catch (error) {
      toast.error(error.message || "Error al abrir caja");
    }
  };

  const handleCerrarCaja = async (e) => {
    e.preventDefault();
    try {
      const monto = parseFloat(montoCierre) || 0;
      await cerrarTurno(monto, observacionesCierre);
      setTurnoActivo(null);
      setShowCerrarModal(false);
      setMontoCierre("");
      setObservacionesCierre("");
      toast.success("Turno cerrado exitosamente");
    } catch (error) {
      toast.error(error.message || "Error al cerrar turno");
    }
  };

  // LÓGICA CENTRALIZADA DE CÓDIGOS DE BARRAS
  const procesarCodigoEscaneado = (codigoStr) => {
    if (!codigoStr.trim()) return;
    const codigoLimpio = codigoStr.trim();
    const productoEncontrado = productos.find(p => p.codigo_barras === codigoLimpio || p.codigo === codigoLimpio);

    if (productoEncontrado) {
      const idProd = productoEncontrado.id_producto || productoEncontrado.id;
      
      setVenta(prevVenta => {
        const existente = prevVenta.detalles.find((d) => d.productoId === idProd);
        let nuevosDetalles;
        if (existente) {
          nuevosDetalles = prevVenta.detalles.map((d) =>
            d.productoId === idProd ? { ...d, cantidad: d.cantidad + 1 } : d
          );
        } else {
          nuevosDetalles = [...prevVenta.detalles, { productoId: idProd, cantidad: 1 }];
        }
        return { ...prevVenta, detalles: nuevosDetalles };
      });

      toast.success(`Agregado: ${productoEncontrado.descripcion}`, { autoClose: 500, hideProgressBar: true });
    } else {
      setCodigoDesconocido(codigoLimpio);
      setShowAltaRapidaModal(true);
    }
  };

  const manejarEscaneoTeclado = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      procesarCodigoEscaneado(codigoEscaneado);
      setCodigoEscaneado(""); // Limpiar input después de leer
    }
  };

  const opcionesClientes = clientes.map((c) => ({
    value: c.id,
    label: `${c.nombre} ${c.apellido}`,
  }));

  const opcionesProductos = productos.map((p) => ({
    value: p.id_producto || p.id,
    label: `${p.descripcion} (${p.marca || "S/M"})`,
  }));

  const productoActual = productos.find((p) => (p.id_producto || p.id) === productoSeleccionado);
  const stockDisponible = productoActual?.cantidad_stock ?? null;

  const agregarProducto = () => {
    if (!productoSeleccionado) return toast.warn("Seleccione un producto");
    const cantidadNumerica = parseFloat(cantidad.replace(",", "."));
    if (isNaN(cantidadNumerica) || cantidadNumerica <= 0) return toast.error("Cantidad no válida");
    
    if (stockDisponible !== null && cantidadNumerica > parseFloat(stockDisponible)) {
      return toast.error("Stock insuficiente");
    }

    setVenta(prev => {
      const existente = prev.detalles.find((d) => d.productoId === productoSeleccionado);
      let nuevosDetalles;
      if (existente) {
        nuevosDetalles = prev.detalles.map((d) =>
          d.productoId === productoSeleccionado ? { ...d, cantidad: d.cantidad + cantidadNumerica } : d
        );
      } else {
        nuevosDetalles = [...prev.detalles, { productoId: productoSeleccionado, cantidad: cantidadNumerica }];
      }
      return { ...prev, detalles: nuevosDetalles };
    });

    setCantidad("1");
    setProductoSeleccionado(null);
    toast.success("Producto añadido", { autoClose: 500, hideProgressBar: true });
    
    if (scannerRef.current) scannerRef.current.focus();
  };

  const manejarAltaRapida = async (e) => {
    e.preventDefault();
    try {
      const payloadNuevo = {
        codigo_barras: codigoDesconocido,
        descripcion: nuevoProductoRapido.descripcion,
        precio: parseFloat(nuevoProductoRapido.precio),
        cantidad_stock: parseInt(nuevoProductoRapido.stock)
      };

      const productoCreado = await postData("productos/rapido", payloadNuevo); 
      
      if(setProductos) setProductos([...productos, productoCreado]);
      
      const idNuevo = productoCreado.id_producto || productoCreado.id;
      setVenta(prev => ({ ...prev, detalles: [...prev.detalles, { productoId: idNuevo, cantidad: 1 }] }));
      
      toast.success("Producto creado y agregado al carrito");
      setShowAltaRapidaModal(false);
      setNuevoProductoRapido({ descripcion: "", precio: "", stock: "1" });
      
    } catch (error) {
      toast.error("Error al crear el producto. Revise los datos ingresados.");
    }
  };

  const eliminarProducto = (id) => {
    const nuevosDetalles = venta.detalles.filter((d) => d.productoId !== id);
    setVenta({ ...venta, detalles: nuevosDetalles });
  };

  const registrarVenta = async () => {
    try {
      const payloadVenta = { ...venta, metodoPago };
      const respuesta = await postData("ventas", payloadVenta);
      
      const idVenta = respuesta?.id || respuesta?.nroVenta || "Operación Exitosa";
      toast.success(`Venta registrada: Nro ${idVenta}`);
      
      setVentaRegistrada({ ...payloadVenta, id: idVenta });
      setVenta({ clienteId: null, detalles: [] });
      setCantidad("1");
      setProductoSeleccionado(null);
      setMetodoPago("EFECTIVO"); 
      setShowConfirmModal(false);

    } catch (err) {
      console.error(err);
      toast.error("Error de conexión al registrar la venta");
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    onAfterPrint: () => setVentaRegistrada(null), 
  });

  const abrirModalCierre = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCerrarModal(true);
  };

  if (loadingTurno) return <div className="cargando-modulo">Cargando sistema de facturación...</div>;

  // MODAL DE APERTURA (BLOQUEANTE)
  if (!turnoActivo) {
    return (
      <div className="modal-overlay">
        <div className="modal-caja">
          <h2>Apertura de Turno</h2>
          <p>Declare el saldo inicial en caja para comenzar las operaciones.</p>
          <form onSubmit={handleAbrirCaja}>
            <div className="form-group">
              <label>Efectivo inicial (Fondo de caja):</label>
              <div className="input-dinero">
                <span>$</span>
                <input type="number" step="0.01" required value={montoInicial} onChange={(e) => setMontoInicial(e.target.value)} placeholder="0.00" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="btn-primario" style={{ flex: 2 }}>Iniciar Turno</button>
              <button type="button" className="btn-peligro" onClick={onLogout} style={{ flex: 1 }}>Cerrar Sesión</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="ventas-module" style={{ position: 'relative' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div style={{ display: "none" }}>
        {ventaRegistrada && (
          <TicketToPrint 
            ref={componentRef} 
            ventaFinal={ventaRegistrada} 
            productos={productos} 
            negocioConfig={negocioConfig}
            clienteNombre={ventaRegistrada.clienteId ? opcionesClientes.find(c => c.value === ventaRegistrada.clienteId)?.label : null}
          />
        )}
      </div>

      {/* MODAL DE ÉXITO POST-VENTA */}
      {ventaRegistrada && !showConfirmModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content modal-ticket" style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px', color: '#16a34a' }}>
              <CheckCircle2 size={48} />
            </div>
            <h2 style={{ color: '#16a34a', marginTop: 0 }}>Venta Finalizada</h2>
            <p>El registro se ha procesado con éxito.</p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
              <button className="btn-secundario" onClick={() => setVentaRegistrada(null)}>Finalizar</button>
              <button className="btn-primario" onClick={handlePrint}>Imprimir Comprobante</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ALTA RÁPIDA DE PRODUCTO */}
      {showAltaRapidaModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f59e0b', marginBottom: '15px' }}>
              <AlertCircle size={28} />
              <h2 style={{ margin: 0, color: 'inherit' }}>Producto No Reconocido</h2>
            </div>
            <p>El código <strong>{codigoDesconocido}</strong> no existe en los registros. ¿Desea darlo de alta rápidamente para continuar con la operación?</p>
            
            <form onSubmit={manejarAltaRapida} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label>Descripción del Producto:</label>
                <input type="text" required autoFocus value={nuevoProductoRapido.descripcion} onChange={e => setNuevoProductoRapido({...nuevoProductoRapido, descripcion: e.target.value})} placeholder="Ej: Producto Estándar" style={{ width: '100%', padding: '10px' }} />
              </div>
              <div className="form-group" style={{ marginTop: '10px' }}>
                <label>Precio de Venta ($):</label>
                <input type="number" step="0.01" required value={nuevoProductoRapido.precio} onChange={e => setNuevoProductoRapido({...nuevoProductoRapido, precio: e.target.value})} style={{ width: '100%', padding: '10px' }} />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                <button type="button" className="btn-secundario" onClick={() => setShowAltaRapidaModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primario">Guardar y Vender</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE ESCÁNER DE CÁMARA */}
      {showCamera && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ textAlign: 'center', width: '90%', maxWidth: '450px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Camera size={24} /> Escanear Código
              </h2>
              <button 
                className="btn-secundario" 
                style={{ padding: '5px 10px' }} 
                onClick={() => setShowCamera(false)}
              >
                X
              </button>
            </div>
            
            <p style={{ color: '#475569', marginBottom: '20px' }}>
              Dele permisos a su navegador si lo solicita y apunte la cámara al código de barras.
            </p>
            
            <div id="reader" style={{ width: '100%', margin: '0 auto', border: '2px solid #3b82f6', borderRadius: '8px', overflow: 'hidden' }}></div>
            
            <div style={{ marginTop: '20px' }}>
              <button className="btn-cancelar" onClick={() => setShowCamera(false)} style={{ width: '100%' }}>
                Cancelar Operación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER DE VENTAS */}
      <div className="ventas-header" style={{ position: 'relative', zIndex: 10 }}>
        <div>
          <h2>Módulo de Ventas</h2>
          <span className="turno-info">Estado: Turno Activo</span>
        </div>
        <button 
          onClick={abrirModalCierre} 
          className="btn-peligro"
          style={{ position: 'relative', zIndex: 50, cursor: 'pointer' }}
        >
          Cerrar Caja
        </button>
      </div>

      <div className="form-panel">
        
        {/* INPUT DEL ESCÁNER Y CÁMARA */}
        <div className="escaner-container" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, position: 'relative', minWidth: '250px' }}>
            <Barcode size={20} className="text-slate-700" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              className="escaner-input"
              style={{ paddingLeft: '40px', width: '100%' }}
              type="text" 
              ref={scannerRef}
              value={codigoEscaneado} 
              onChange={(e) => setCodigoEscaneado(e.target.value)}
              onKeyDown={manejarEscaneoTeclado}
              placeholder="Pistola láser o teclado..." 
            />
          </div>
          
          <button 
            className="btn-secundario" 
            onClick={() => setShowCamera(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
            title="Escanear con cámara del celular"
          >
            <Camera size={20} /> Escanear con Cámara
          </button>
        </div>

        <div className="form-row-ventas" style={{ marginTop: '15px' }}>
          <div className="input-group-ventas">
            <label>Cliente</label>
            <Select
              className="react-select-container" classNamePrefix="react-select"
              options={opcionesClientes} value={opcionesClientes.find((o) => o.value === venta.clienteId)}
              onChange={(op) => setVenta({ ...venta, clienteId: op?.value ?? null })}
              placeholder="Consumidor Final" isClearable
            />
          </div>
        </div>

        <div className="form-row-ventas buscador-producto-row">
          <div className="input-group-ventas flex-2">
            <label>Búsqueda Manual</label>
            <Select
              className="react-select-container" classNamePrefix="react-select"
              options={opcionesProductos} value={opcionesProductos.find((o) => o.value === productoSeleccionado)}
              onChange={(op) => setProductoSeleccionado(op?.value ?? null)}
              placeholder="Buscar por descripción o marca..." isClearable isSearchable
            />
            {productoSeleccionado && (
              <span className="stock-hint">Disponibilidad actual: <strong>{stockDisponible ?? "Sin información"}</strong></span>
            )}
          </div>

          <div className="input-group-ventas flex-1">
            <label>Cantidad</label>
            <div className="cantidad-input-wrapper">
              <input 
                id="cantidad" 
                type="text" 
                inputMode="decimal" 
                value={cantidad} 
                onChange={(e) => setCantidad(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && agregarProducto()} 
              />
              <button className="btn-agregar-producto" onClick={agregarProducto} disabled={!productoSeleccionado}>Añadir</button>
            </div>
          </div>
        </div>
      </div>

      <div className="ticket-panel">
        <h3 className="ticket-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingCart size={18} /> Resumen de Operación
        </h3>
        <div className="table-responsive-wrapper">
          <table className="ventas-table ticket-table">
            <thead>
              <tr>
                <th>Detalle</th>
                <th className="text-center">Cant.</th>
                <th className="text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {venta.detalles.length === 0 ? (
                <tr><td colSpan="3" className="celda-vacia">No hay productos en la lista.</td></tr>
              ) : (
                venta.detalles.map((d, i) => {
                  const infoP = productos.find(p => (p.id_producto || p.id) === d.productoId);
                  return (
                    <tr key={i}>
                      <td>{infoP ? `${infoP.descripcion} (${infoP.marca || "S/M"})` : `Prod #${d.productoId}`}</td>
                      <td className="text-center">{d.cantidad}</td>
                      <td className="text-right">
                        <button className="btn-accion btn-eliminar" onClick={() => eliminarProducto(d.productoId)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Trash2 size={14} /> Quitar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="ticket-footer">
          <button className="btn-primario btn-lg" onClick={() => setShowConfirmModal(true)} disabled={venta.detalles.length === 0}>
            Registrar Operación
          </button>
        </div>
      </div>

      {/* MODAL CONFIRMACIÓN VENTA */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-ticket">
            <div className="modal-header"><h3 style={{ marginTop: 0 }}>Resumen de Cobro</h3></div>
            <div className="modal-body ticket-body">
              <div className="ticket-cliente-info">
                <span>Cliente:</span>
                <strong>{venta.clienteId ? opcionesClientes.find(c => c.value === venta.clienteId)?.label : "Consumidor Final"}</strong>
              </div>
              <ul className="ticket-lista-final">
                {venta.detalles.map((d, i) => {
                  const infoP = productos.find(p => (p.id_producto || p.id) === d.productoId);
                  const precio = infoP?.precio || infoP?.valor || 0; 
                  return (
                    <li key={i} className="ticket-item">
                      <div className="ticket-item-desc">
                        <span>{infoP ? infoP.descripcion : "Producto"}</span>
                        <small>{d.cantidad} x ${precio}</small>
                      </div>
                      <strong className="ticket-item-subtotal">${(precio * d.cantidad).toLocaleString("es-AR")}</strong>
                    </li>
                  );
                })}
              </ul>
              
              <div className="ticket-total-final">
                <span>Importe Total</span>
                <h2>
                  ${venta.detalles.reduce((acc, d) => {
                    const p = productos.find(prod => (prod.id_producto || prod.id) === d.productoId);
                    return acc + ((p?.precio || p?.valor || 0) * d.cantidad);
                  }, 0).toLocaleString("es-AR")}
                </h2>
              </div>

              <div className="metodo-pago-selector" style={{ marginTop: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Método de Pago:</label>
                <select 
                  value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia / Billetera Digital</option>
                  <option value="DEBITO">Tarjeta de Débito</option>
                  <option value="CREDITO">Tarjeta de Crédito</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setShowConfirmModal(false)}>Regresar</button>
              <button className="btn-primario" onClick={registrarVenta}>Confirmar Operación</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CERRAR CAJA / TURNO */}
      {showCerrarModal && (
        <div className="modal-overlay" style={{ zIndex: 2147483647 }}>
          <div className="modal-content modal-caja" style={{ padding: '2rem' }}>
            <h2 style={{ marginTop: 0, color: '#0f172a' }}>Cierre de Turno</h2>
            <p style={{ color: '#475569', marginBottom: '1.5rem' }}>Declare el saldo final físico en la caja registradora.</p>
            
            <form onSubmit={handleCerrarCaja}>
              <div className="form-group">
                <label>Efectivo final en caja:</label>
                <div className="input-dinero">
                  <span>$</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    value={montoCierre} 
                    onChange={(e) => setMontoCierre(e.target.value)} 
                    placeholder="0.00" 
                  />
                </div>
              </div>
              
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Observaciones (Opcional):</label>
                <textarea 
                  rows="3"
                  value={observacionesCierre} 
                  onChange={(e) => setObservacionesCierre(e.target.value)} 
                  placeholder="Ej: Faltan $100, retiro de dueño..." 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                />
              </div>
              
              <div className="modal-footer" style={{ marginTop: '2rem', borderTop: 'none', padding: 0, display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn-cancelar" onClick={() => setShowCerrarModal(false)} style={{ flex: 1, backgroundColor: 'transparent' }}>Cancelar</button>
                <button type="submit" className="btn-peligro" style={{ flex: 1 }}>Confirmar Cierre</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VentasView;