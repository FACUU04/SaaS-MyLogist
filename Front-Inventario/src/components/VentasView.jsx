import React, { useState, useEffect, useRef } from "react";
import { postData, getNegocio, getNotas, createNota, deleteNota } from "../components/utils/api"; 
import { getTurnoActivo, abrirTurno, cerrarTurno } from "../components/utils/api"; 
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import { useReactToPrint } from "react-to-print"; 
import "react-toastify/dist/ReactToastify.css";
import "../styles/modules/VentasModule.css";
import "../styles/ModalTurno.css"; 

// COMPONENTE DEL TICKET (Diseño profesional para impresión)
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


const VentasView = ({ productos = [], clientes = [], user, onLogout }) => {
  
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

  // ESTADOS DE VENTAS
  const [venta, setVenta] = useState({ clienteId: null, detalles: [] });
  const [metodoPago, setMetodoPago] = useState("EFECTIVO"); 
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [ventaRegistrada, setVentaRegistrada] = useState(null); 
  
  const componentRef = useRef();

  // CARGA DE DATOS
  useEffect(() => {
    cargarTurno();
    cargarDatosSecundarios();
  }, []);

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

  // LÓGICA DE MURO DE ANOTACIONES
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

  // LÓGICA DE CAJA
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

  // LÓGICA DE VENTA
  const opcionesClientes = clientes.map((c) => ({
    value: c.id,
    label: `${c.nombre} ${c.apellido}`,
  }));

  const opcionesProductos = productos.map((p) => ({
    value: p.id_producto || p.id,
    label: `${p.descripcion} (${p.marca})`,
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

    const existente = venta.detalles.find((d) => d.productoId === productoSeleccionado);
    let nuevosDetalles;
    if (existente) {
      nuevosDetalles = venta.detalles.map((d) =>
        d.productoId === productoSeleccionado ? { ...d, cantidad: d.cantidad + cantidadNumerica } : d
      );
    } else {
      nuevosDetalles = [...venta.detalles, { productoId: productoSeleccionado, cantidad: cantidadNumerica }];
    }

    setVenta({ ...venta, detalles: nuevosDetalles });
    setCantidad("");
    setProductoSeleccionado(null);
    toast.success("Producto añadido");
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
      setCantidad("");
      setProductoSeleccionado(null);
      setMetodoPago("EFECTIVO"); 
      setShowConfirmModal(false);

    } catch (err) {
      console.error(err);
      toast.error("Error de conexión al registrar venta");
    }
  };

  // LÓGICA DE IMPRESIÓN (Sintaxis actualizada)
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    onAfterPrint: () => setVentaRegistrada(null), 
  });

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
    <div className="ventas-module">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* COMPONENTE DE IMPRESIÓN OCULTO */}
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
            <h2 style={{ color: '#16a34a' }}>Venta Finalizada</h2>
            <p>El registro se ha procesado con éxito.</p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
              <button className="btn-secundario" onClick={() => setVentaRegistrada(null)}>Finalizar</button>
              <button className="btn-primario" onClick={handlePrint}>Imprimir Comprobante</button>
            </div>
          </div>
        </div>
      )}

      <div className="ventas-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Módulo de Ventas</h2>
          <span className="turno-info" style={{ color: '#16a34a', fontSize: '0.85rem', fontWeight: 'bold' }}>
            Estado: Turno Activo
          </span>
        </div>
        <button onClick={() => setShowCerrarModal(true)} className="btn-peligro">Cerrar Caja</button>
      </div>

      <div className="form-panel">
        <div className="form-row-ventas">
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
            <label>Producto</label>
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
              <input id="cantidad" type="text" inputMode="decimal" placeholder="0" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
              <button className="btn-agregar-producto" onClick={agregarProducto} disabled={!productoSeleccionado}>Agregar</button>
            </div>
          </div>
        </div>
      </div>

      <div className="ticket-panel">
        <h3 className="ticket-title">Resumen de Operación</h3>
        <div className="table-responsive-wrapper">
          <table className="ventas-table ticket-table">
            <thead>
              <tr>
                <th>Detalle</th>
                <th className="text-center">Cant.</th>
                <th className="text-right">Remover</th>
              </tr>
            </thead>
            <tbody>
              {venta.detalles.length === 0 ? (
                <tr><td colSpan="3" className="celda-vacia">Pendiente de productos.</td></tr>
              ) : (
                venta.detalles.map((d, i) => {
                  const infoP = productos.find(p => (p.id_producto || p.id) === d.productoId);
                  return (
                    <tr key={i}>
                      <td>{infoP ? `${infoP.descripcion} (${infoP.marca})` : `Prod #${d.productoId}`}</td>
                      <td className="text-center">{d.cantidad}</td>
                      <td className="text-right">
                        <button className="btn-accion btn-eliminar" onClick={() => eliminarProducto(d.productoId)}>Quitar</button>
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

      {/* MURO DE MENSAJES */}
      <div className="notas-container" style={{ marginTop: '30px' }}>
        <h3>Muro de Comunicaciones</h3>
        <div className="nota-input">
          <input
            type="text"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Escribir un mensaje para el equipo..."
            onKeyDown={(e) => e.key === 'Enter' && agregarNota()}
          />
          <button className="btn-primario" onClick={agregarNota}>Publicar</button>
        </div>
        <ul className="lista-notas">
          {notas.map((n) => {
            const fechaFormato = new Date(n.fechaCreacion).toLocaleDateString();
            return (
              <li key={n.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <small style={{ color: '#64748b', fontWeight: 'bold' }}>{n.usuario} - {fechaFormato}</small>
                  <button className="btn-eliminar-nota" onClick={() => eliminarNota(n.id)}>Eliminar</button>
                </div>
                <span>{n.contenido}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* MODAL CONFIRMACIÓN VENTA */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-ticket">
            <div className="modal-header"><h3>Resumen de Cobro</h3></div>
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
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Método de Pago:</label>
                <select 
                  value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
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

      {/* MODAL CIERRE CAJA */}
      {showCerrarModal && (
        <div className="modal-overlay">
          <div className="modal-caja">
            <h2>Cierre de Caja</h2>
            <p>Ingrese el total de dinero físico contado en caja.</p>
            <form onSubmit={handleCerrarCaja}>
              <div className="form-group">
                <label>Efectivo real en caja:</label>
                <div className="input-dinero">
                  <span>$</span>
                  <input type="number" step="0.01" required value={montoCierre} onChange={(e) => setMontoCierre(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Observaciones de cierre:</label>
                <textarea value={observacionesCierre} onChange={(e) => setObservacionesCierre(e.target.value)} placeholder="Detalle cualquier novedad aquí..." />
              </div>
              <div className="modal-acciones">
                <button type="button" onClick={() => setShowCerrarModal(false)} className="btn-secundario">Cancelar</button>
                <button type="submit" className="btn-primario">Cerrar Turno</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VentasView;