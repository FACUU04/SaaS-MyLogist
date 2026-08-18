import React, { useState, useEffect, useRef } from "react";
import { createOrdenCompra, fetchData, escanearFacturaIA, postData } from "../components/utils/api";
import { toast } from "react-toastify";
import { Camera, Sparkles, Loader2 } from "lucide-react";
import "../styles/modules/ComprasModule.css";

const CompraModal = ({ proveedor, productos, onClose, onCompraRegistrada }) => {
  const [item, setItem] = useState({
    idProducto: "",
    descripcion: "",
    cantidad: "",
    importe: "",
    observaciones: "",
  });

  const [items, setItems] = useState([]);

  const [compraInfo, setCompraInfo] = useState({
    idProveedor: proveedor.id,
    metodoPago: "",
    fecha: new Date().toISOString().slice(0, 10),
    observaciones: "",
  });

  // Estados para el Dropdown
  const [busqueda, setBusqueda] = useState("");
  const [productosDropdown, setProductosDropdown] = useState([]);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [pagina, setPagina] = useState(0);
  const [tieneMas, setTieneMas] = useState(true);
  
  // Estado para la IA
  const [escaneando, setEscaneando] = useState(false);

  const autocompleteRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setDropdownAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!dropdownAbierto) return;

    const cargarProductosDropdown = async () => {
      try {
        const url = `productos?buscar=${encodeURIComponent(busqueda)}&size=10&page=${pagina}`;
        const res = await fetchData(url);
        
        const dataContent = res && res.content ? res.content : (Array.isArray(res) ? res : []);

        if (pagina === 0) {
          setProductosDropdown(dataContent);
        } else {
          setProductosDropdown((prev) => [...prev, ...dataContent]);
        }
        
        setTieneMas(dataContent.length === 10);
      } catch (err) {
        console.error("Error cargando productos en el dropdown:", err);
      } finally {
        setCargando(false);
      }
    };

    setCargando(true);
    const delayDebounce = setTimeout(() => {
      cargarProductosDropdown();
    }, pagina === 0 ? 250 : 0);

    return () => clearTimeout(delayDebounce);
  }, [busqueda, pagina, dropdownAbierto]);

  const handleScrollDropdown = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 15 && tieneMas && !cargando) {
      setPagina((prevPagina) => prevPagina + 1);
    }
  };

  const handleItemChange = (campo, valor) => {
    setItem((prev) => ({ ...prev, [campo]: valor }));
  };

  const updateItemAgregado = (index, campo, valor) => {
    setItems((prev) => {
      const nuevosItems = [...prev];
      nuevosItems[index][campo] = valor;
      return nuevosItems;
    });
  };

  const handleCompraInfo = (campo, valor) => {
    setCompraInfo((prev) => ({ ...prev, [campo]: valor }));
  };

  const seleccionarProducto = (prod) => {
    setItem((prev) => ({
      ...prev,
      idProducto: prod.id,
      descripcion: prod.descripcion
    }));
    setBusqueda(prod.descripcion);
    setDropdownAbierto(false);
  };

  const agregarItem = () => {
    if (!item.idProducto || !item.cantidad || !item.importe) {
      toast.error("Completa producto, cantidad e importe");
      return;
    }

    setItems((prev) => [...prev, { ...item, esNuevo: false }]);
    setItem({
      idProducto: "",
      descripcion: "",
      cantidad: "",
      importe: "",
      observaciones: "",
    });
    setBusqueda("");
  };

  const eliminarItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // --- LÓGICA DE ESCANEO IA ---
  const handleEscanearFactura = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setEscaneando(true);
    try {
      const data = await escanearFacturaIA(file);
      
      toast.success("¡Factura procesada con éxito por la IA!");

      if (data.fecha) {
        handleCompraInfo("fecha", data.fecha);
      }

      // Mapeamos lo que devolvió Groq al formato de la tabla
      const nuevosItems = data.productos.map((p) => ({
        idProducto: p.idProductoExistente || "", // Vacío si es nuevo
        descripcion: p.descripcion,
        cantidad: p.cantidad || 1,
        importe: p.precioCosto || 0,
        precioVenta: p.precioVenta || "", // Trae el actual si existe, o "" si es nuevo
        esNuevo: p.esNuevo,
        observaciones: "Extraído vía IA"
      }));

      setItems((prev) => [...prev, ...nuevosItems]);

    } catch (error) {
      toast.error(error.message || "No se pudo leer la factura. Revisa la imagen e intenta de nuevo.");
    } finally {
      setEscaneando(false);
      e.target.value = null; // Resetea el input para poder escanear la misma foto si hace falta
    }
  };

  // --- GUARDADO FINAL ORQUESTADO ---
  const guardarCompra = async () => {
    if (items.length === 0) {
      toast.error("Agrega al menos un producto a la compra");
      return;
    }

    // Validación estricta: Si hay productos nuevos, DEBEN tener precio de venta
    const faltanPrecios = items.some(it => it.esNuevo && (!it.precioVenta || parseFloat(it.precioVenta) <= 0));
    if (faltanPrecios) {
      toast.warn("Por favor, define el Precio de Venta para los productos nuevos antes de guardar.");
      return;
    }

    try {
      // 1. Dar de alta los productos que no existían
      const itemsProcesados = await Promise.all(items.map(async (it) => {
        if (it.esNuevo) {
          const payloadNuevo = {
            codigo_barras: `IA-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Generamos un código temporal
            descripcion: it.descripcion,
            precio: parseFloat(it.precioVenta),
            cantidad_stock: 0 // Inicia en 0. La Orden de Compra sumará el stock al recibirla.
          };
          const prodCreado = await postData("productos/rapido", payloadNuevo);
          
          return { 
            ...it, 
            idProducto: prodCreado.id_producto || prodCreado.id, 
            esNuevo: false 
          };
        }
        return it;
      }));

      // 2. Armar el payload de la orden con todos los IDs correctos
      const payloadOrden = {
        proveedorId: proveedor.id,
        fechaRecepcionEsperada: compraInfo.fecha || null, 
        metodoPago: compraInfo.metodoPago, 
        observaciones: compraInfo.observaciones, 
        detalles: itemsProcesados.map(it => ({
          productoId: parseInt(it.idProducto),
          cantidad: parseFloat(it.cantidad),
          precioUnitario: parseFloat(it.importe), 
          observaciones: it.observaciones 
        }))
      };

      // 3. Generar la orden final
      await createOrdenCompra(payloadOrden);
      toast.success("Orden y productos registrados correctamente");
      onCompraRegistrada();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error al registrar la orden");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-compra" style={{ position: 'relative' }}>
        
        {/* OVERLAY DE CARGA IA */}
        {escaneando && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.85)', zIndex: 100, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: '1rem' }}>
            <Loader2 className="spin-animation text-orange" size={48} style={{ animation: 'spin 1.5s linear infinite', color: '#f97316' }} />
            <h3 style={{ marginTop: '1rem', color: '#0f172a' }}>Analizando Factura...</h3>
            <p style={{ color: '#475569' }}>Groq Vision IA está leyendo los productos y precios.</p>
          </div>
        )}

        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Registrar orden para {proveedor.nombre}</h3>
          
          {/* BOTÓN CÁMARA IA */}
          <div>
            <input
              type="file"
              accept="image/*"
              capture="environment" // Abre cámara trasera en móviles
              id="scan-factura"
              style={{ display: "none" }}
              onChange={handleEscanearFactura}
            />
            <label htmlFor="scan-factura" className="btn-primario" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", backgroundColor: '#8b5cf6', margin: 0 }}>
              <Sparkles size={16} /> Escanear Factura
            </label>
          </div>
        </div>

        <div className="modal-body">
          <section className="form-section">
            <h4 style={{ marginTop: 0 }}>Carga Manual</h4>
            
            <div className="input-group" ref={autocompleteRef} style={{ position: "relative" }}>
              <label>Producto</label>
              <input
                type="text"
                placeholder="Haz clic para ver productos o escribe para buscar..."
                value={busqueda}
                onFocus={() => setDropdownAbierto(true)}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setDropdownAbierto(true);
                  setPagina(0);
                  setProductosDropdown([]); 
                  setTieneMas(true);
                  if (item.idProducto) {
                    handleItemChange("idProducto", "");
                    handleItemChange("descripcion", "");
                  }
                }}
                autoComplete="off"
              />
              
              {dropdownAbierto && (
                <ul className="autocomplete-dropdown" onScroll={handleScrollDropdown} style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "0.375rem", maxHeight: "180px", overflowY: "auto", zIndex: 1000, listStyle: "none", padding: 0, margin: "4px 0 0 0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
                  {productosDropdown.map((prod) => (
                    <li
                      key={prod.id}
                      onClick={() => seleccionarProducto(prod)}
                      style={{ padding: "0.6rem 1rem", cursor: "pointer", borderBottom: "1px solid #f1f5f9", fontSize: "0.9rem", color: "#0f172a" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <strong>{prod.descripcion}</strong>
                      {prod.codigo && <span style={{ color: "#64748b", fontSize: "0.8rem", marginLeft: "8px" }}>({prod.codigo})</span>}
                    </li>
                  ))}

                  {cargando && <li style={{ padding: "0.6rem 1rem", color: "#0284c7", fontSize: "0.85rem", textAlign: "center", backgroundColor: "#f0f9ff" }}>Cargando productos...</li>}
                  {!cargando && productosDropdown.length === 0 && <li style={{ padding: "0.6rem 1rem", color: "#64748b", fontSize: "0.85rem", textAlign: "center" }}>No se encontraron resultados</li>}
                  {!tieneMas && productosDropdown.length > 0 && <li style={{ padding: "0.4rem 1rem", color: "#94a3b8", fontSize: "0.8rem", textAlign: "center", backgroundColor: "#f8fafc" }}>Fin del inventario</li>}
                </ul>
              )}
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Cantidad</label>
                <input
                  type="number"
                  placeholder="0"
                  value={item.cantidad}
                  onChange={(e) => handleItemChange("cantidad", e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Importe Costo Unit.</label>
                <input
                  type="number"
                  placeholder="$ 0.00"
                  value={item.importe}
                  onChange={(e) => handleItemChange("importe", e.target.value)}
                />
              </div>
            </div>

            <button className="btn-secundario btn-full" onClick={agregarItem} style={{ marginTop: '1rem' }}>
              Agregar a la lista
            </button>
          </section>

          {items.length > 0 && (
            <section className="form-section items-agregados">
              <h4>Productos en la Orden</h4>
              <div className="items-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {items.map((it, index) => {
                  return (
                    <div key={index} className="item-card" style={{ borderLeft: it.esNuevo ? '4px solid #f97316' : '4px solid #cbd5e1', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                      <div className="item-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{it.descripcion || `Producto #${it.idProducto}`}</strong>
                          
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', color: '#475569', fontSize: '0.9rem' }}>
                            <span><strong>Cant:</strong> {it.cantidad}</span>
                            <span><strong>Costo:</strong> ${parseFloat(it.importe).toLocaleString("es-AR")}</span>
                            <span><strong>Total:</strong> ${(it.cantidad * parseFloat(it.importe)).toLocaleString("es-AR")}</span>
                          </div>

                          {/* INPUT DE PRECIO VENTA PARA PRODUCTOS NUEVOS DETECTADOS POR IA */}
                          {it.esNuevo && (
                            <div style={{ marginTop: '1rem', backgroundColor: '#fff7ed', padding: '0.75rem', borderRadius: '6px', border: '1px solid #fed7aa' }}>
                              <label style={{ display: 'block', color: '#c2410c', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                                ¡Producto Nuevo! Define su Precio de Venta al público:
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: '#9a3412', fontWeight: 'bold' }}>$</span>
                                <input 
                                  type="number" 
                                  placeholder="Ej: 2500" 
                                  value={it.precioVenta} 
                                  onChange={(e) => updateItemAgregado(index, 'precioVenta', e.target.value)} 
                                  style={{ padding: '0.4rem 0.75rem', borderRadius: '4px', border: '1px solid #fdba74', width: '120px' }}
                                />
                              </div>
                            </div>
                          )}

                        </div>
                        
                        <button className="btn-eliminar-item" onClick={() => eliminarItem(index)} style={{ color: '#ef4444', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                          X Quitar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className="form-section">
            <h4>Datos de la Factura / Orden</h4>
            <div className="form-row">
              <div className="input-group">
                <label>Método de Pago</label>
                <input
                  type="text"
                  placeholder="Ej. Transferencia"
                  value={compraInfo.metodoPago}
                  onChange={(e) => handleCompraInfo("metodoPago", e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Fecha del Comprobante</label>
                <input
                  type="date"
                  value={compraInfo.fecha}
                  onChange={(e) => handleCompraInfo("fecha", e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Observaciones de la Compra</label>
              <textarea
                placeholder="Notas generales..."
                value={compraInfo.observaciones}
                onChange={(e) => handleCompraInfo("observaciones", e.target.value)}
              />
            </div>
          </section>
        </div>

        <div className="modal-footer">
          <button className="btn-cancelar" onClick={onClose} disabled={escaneando}>
            Cancelar
          </button>
          <button className="btn-primario" onClick={guardarCompra} disabled={escaneando}>
            Confirmar e Ingresar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompraModal;