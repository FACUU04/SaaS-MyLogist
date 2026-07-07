import React, { useState, useEffect, useRef } from "react";
import { createOrdenCompra, fetchData } from "../components/utils/api";
import { toast } from "react-toastify";
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

  // Estados para el Dropdown Unificado con Scroll Infinito
  const [busqueda, setBusqueda] = useState("");
  const [productosDropdown, setProductosDropdown] = useState([]);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [pagina, setPagina] = useState(0);
  const [tieneMas, setTieneMas] = useState(true);

  const autocompleteRef = useRef(null);

  // Detectar clics externos para cerrar el desplegable
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setDropdownAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Petición dinámica a Spring Boot
  useEffect(() => {
    if (!dropdownAbierto) return;

    const cargarProductosDropdown = async () => {
      try {
        const url = `productos?buscar=${encodeURIComponent(busqueda)}&size=10&page=${pagina}`;
        const res = await fetchData(url);
        
        const dataContent = res && res.content ? res.content : (Array.isArray(res) ? res : []);

        if (pagina === 0) {
          // Si es la página 0 (nueva búsqueda o primer clic), sobreescribimos la lista limpia
          setProductosDropdown(dataContent);
        } else {
          // Si es scroll hacia abajo, anexamos al contenido actual
          setProductosDropdown((prev) => [...prev, ...dataContent]);
        }
        
        // Si vinieron menos de 10 elementos, significa que no hay más páginas en el backend
        setTieneMas(dataContent.length === 10);

      } catch (err) {
        console.error("Error cargando productos en el dropdown:", err);
      } finally {
        setCargando(false);
      }
    };

    setCargando(true);
    
    // Si el usuario está escribiendo (página 0), metemos un pequeño debounce para no saturar la API
    const delayDebounce = setTimeout(() => {
      cargarProductosDropdown();
    }, pagina === 0 ? 250 : 0);

    return () => clearTimeout(delayDebounce);
  }, [busqueda, pagina, dropdownAbierto]);

  const handleScrollDropdown = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    // Tolerancia de 15px antes de tocar el fondo del contenedor
    if (scrollHeight - scrollTop <= clientHeight + 15 && tieneMas && !cargando) {
      setPagina((prevPagina) => prevPagina + 1);
    }
  };

  const handleItemChange = (campo, valor) => {
    setItem((prev) => ({ ...prev, [campo]: valor }));
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

    setItems((prev) => [...prev, item]);
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

  const guardarCompra = async () => {
    if (items.length === 0) {
      toast.error("Agrega al menos un producto a la compra");
      return;
    }

    try {
      const payload = {
        proveedorId: proveedor.id,
        fechaRecepcionEsperada: compraInfo.fecha || null, 
        metodoPago: compraInfo.metodoPago, 
        observaciones: compraInfo.observaciones, 
        detalles: items.map(it => ({
          productoId: parseInt(it.idProducto),
          cantidad: parseFloat(it.cantidad),
          precioUnitario: parseFloat(it.importe), 
          observaciones: it.observaciones 
        }))
      };

      await createOrdenCompra(payload);
      toast.success("Orden registrada correctamente");
      onCompraRegistrada();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error al registrar la orden");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-compra">
        <div className="modal-header">
          <h3>Registrar orden para {proveedor.nombre}</h3>
        </div>

        <div className="modal-body">
          <section className="form-section">
            <h4>Agregar Producto</h4>
            
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
                  
                  // ¡CAMBIO CRUCIAL AQUÍ! 
                  // Al escribir, reseteamos instantáneamente los estados para cortar la carrera asincrónica
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
                <ul 
                  className="autocomplete-dropdown" 
                  onScroll={handleScrollDropdown}
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    backgroundColor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "0.375rem",
                    maxHeight: "180px",
                    overflowY: "auto",
                    zIndex: 1000,
                    listStyle: "none",
                    padding: 0,
                    margin: "4px 0 0 0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                  }}
                >
                  {productosDropdown.map((prod) => (
                    <li
                      key={prod.id}
                      onClick={() => seleccionarProducto(prod)}
                      style={{
                        padding: "0.6rem 1rem",
                        cursor: "pointer",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: "0.9rem",
                        color: "#0f172a"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <strong>{prod.descripcion}</strong>
                      {prod.codigo && <span style={{ color: "#64748b", fontSize: "0.8rem", marginLeft: "8px" }}>({prod.codigo})</span>}
                    </li>
                  ))}

                  {cargando && (
                    <li style={{ padding: "0.6rem 1rem", color: "#0284c7", fontSize: "0.85rem", textAlign: "center", backgroundColor: "#f0f9ff" }}>
                      Cargando productos...
                    </li>
                  )}

                  {!cargando && productosDropdown.length === 0 && (
                    <li style={{ padding: "0.6rem 1rem", color: "#64748b", fontSize: "0.85rem", textAlign: "center" }}>
                      No se encontraron resultados
                    </li>
                  )}

                  {!tieneMas && productosDropdown.length > 0 && (
                    <li style={{ padding: "0.4rem 1rem", color: "#94a3b8", fontSize: "0.8rem", textAlign: "center", backgroundColor: "#f8fafc" }}>
                      Fin del inventario
                    </li>
                  )}
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
                <label>Importe Unitario</label>
                <input
                  type="number"
                  placeholder="$ 0.00"
                  value={item.importe}
                  onChange={(e) => handleItemChange("importe", e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Observaciones del producto (Opcional)</label>
              <textarea
                placeholder="Detalles sobre este producto..."
                value={item.observaciones}
                onChange={(e) => handleItemChange("observaciones", e.target.value)}
              />
            </div>

            <button className="btn-secundario btn-full" onClick={agregarItem}>
              Agregar a la lista
            </button>
          </section>

          {items.length > 0 && (
            <section className="form-section items-agregados">
              <h4>Productos Agregados</h4>
              <div className="items-list">
                {items.map((it, index) => {
                  const prod = productos.find((p) => p.id == it.idProducto) 
                               || productosDropdown.find((p) => p.id == it.idProducto);
                  
                  return (
                    <div key={index} className="item-card">
                      <div className="item-info">
                        <strong>{prod?.descripcion || it.descripcion || `Producto #${it.idProducto}`}</strong>
                        <span className="item-details">
                          Cant: {it.cantidad} | Importe: ${parseFloat(it.importe).toLocaleString("es-AR")}
                        </span>
                        {it.observaciones && <span className="item-obs">Obs: {it.observaciones}</span>}
                      </div>
                      <button className="btn-eliminar-item" onClick={() => eliminarItem(index)}>
                        Eliminar
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className="form-section">
            <h4>Datos Generales</h4>
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
                <label>Fecha de Recepción Esperada</label>
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
                placeholder="Notas generales de la compra..."
                value={compraInfo.observaciones}
                onChange={(e) => handleCompraInfo("observaciones", e.target.value)}
              />
            </div>
          </section>
        </div>

        <div className="modal-footer">
          <button className="btn-cancelar" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primario" onClick={guardarCompra}>
            Generar Orden
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompraModal;