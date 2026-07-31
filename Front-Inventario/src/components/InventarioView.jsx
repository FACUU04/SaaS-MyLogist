import React, { useEffect, useState } from "react";
import { fetchData, postData, putData, deleteData, getNegocio } from "../components/utils/api";
import { ToastContainer, toast } from "react-toastify";
import ImportarExcelModal from "./ImportarExcelModal"; 
import { Sparkles, Package, AlertTriangle, ArrowUpRight, X, Loader2, Star } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import "../styles/modules/InventarioModule.css";

const UNIDADES = [
  { value: "UNIDAD", label: "Unidad" },
  { value: "METRO", label: "Metro" },
  { value: "KILOGRAMO", label: "Kilogramo" },
  { value: "GRAMO", label: "Gramo" },
  { value: "LITRO", label: "Litro" },
];

const PRODUCTO_INICIAL = {
  marca: "",
  descripcion: "",
  precio: "",
  cantidad_stock: "",
  codigo_fabricante: "",
  unidad_medida: "UNIDAD",
  categoria_id: null,
};

const InventarioView = () => {
  const [productos, setProductos] = useState([]);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [negocio, setNegocio] = useState(null);
  
  const [verEliminados, setVerEliminados] = useState(false);

  // Modal del Excel
  const [mostrarImportar, setMostrarImportar] = useState(false);

  // Estados para modales de confirmación
  const [modalConfirm, setModalConfirm] = useState({ isOpen: false, id: null });
  const [modalRestaurar, setModalRestaurar] = useState({ isOpen: false, id: null });

  // --- ESTADOS PARA IA ---
  const [showModalIA, setShowModalIA] = useState(false);
  const [respuestaIA, setRespuestaIA] = useState("");
  const [cargandoIA, setCargandoIA] = useState(false);

  // Estados de la paginación
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);

  // EFECTO DE CARGA Y BÚSQUEDA (Debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      cargarDatosIniciales(verEliminados, 0, busqueda);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [busqueda, verEliminados]);

  const cargarDatosIniciales = async (mostrarEliminados = verEliminados, pagina = 0, terminoBusqueda = busqueda) => {
    try {
      const queryBusqueda = terminoBusqueda ? `&buscar=${encodeURIComponent(terminoBusqueda)}` : "";
      const endpoint = mostrarEliminados 
        ? `productos/eliminados?page=${pagina}&size=10${queryBusqueda}` 
        : `productos?page=${pagina}&size=10${queryBusqueda}`;

      const [productosData, negocioData] = await Promise.all([
        fetchData(endpoint, false),
        getNegocio(),
      ]);

      let lista = [];
      let totalP = 1;
      let totalE = 0;
      let pagAct = 0;

      const rootData = productosData?.data || productosData;

      if (rootData && Array.isArray(rootData.content)) {
        lista = rootData.content;
        totalP = rootData.totalPages !== undefined ? rootData.totalPages : 1;
        totalE = rootData.totalElements !== undefined ? rootData.totalElements : lista.length;
        pagAct = rootData.page !== undefined ? rootData.page : 0;
      } else if (Array.isArray(rootData)) {
        lista = rootData;
        totalE = rootData.length;
      }

      setProductos(lista);
      setTotalPaginas(totalP);
      setTotalElementos(totalE);
      setPaginaActual(pagAct);
      
      setNegocio(Array.isArray(negocioData) ? negocioData[0] : negocioData);
    } catch (err) {
      console.error("Error cargando datos:", err);
      toast.error("Error al cargar el inventario");
    }
  };

  const toggleVistaEliminados = () => {
    setVerEliminados(!verEliminados);
    setBusqueda(""); 
  };

  const abrirNuevo = () => {
    setSelectedProducto({ ...PRODUCTO_INICIAL });
    setIsEditing(false);
    setShowModal(true);
  };

  const abrirEditar = (producto) => {
    setSelectedProducto({
      marca: producto.marca ?? "",
      descripcion: producto.descripcion ?? "",
      precio: producto.precio ?? "",
      cantidad_stock: producto.cantidad_stock ?? "",
      codigo_fabricante: producto.codigo_fabricante ?? "",
      unidad_medida: producto.unidad_medida ?? "UNIDAD",
      categoria_id: producto.categoria_id ?? null,
      id_producto: producto.id_producto ?? producto.id,
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setSelectedProducto(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedProducto((prev) => ({ ...prev, [name]: value }));
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    const payload = {
      marca: selectedProducto.marca,
      descripcion: selectedProducto.descripcion,
      precio: parseFloat(selectedProducto.precio) || 0,
      cantidad_stock: parseFloat(selectedProducto.cantidad_stock) || 0,
      codigo_fabricante: selectedProducto.codigo_fabricante || "",
      unidad_medida: selectedProducto.unidad_medida,
      categoria_id: selectedProducto.categoria_id || null,
    };

    try {
      if (isEditing) {
        await putData(`productos/${selectedProducto.id_producto}`, payload);
        toast.success("Producto actualizado correctamente");
      } else {
        await postData("productos", payload);
        toast.success("Producto creado correctamente");
      }
      cerrarModal();
      cargarDatosIniciales(verEliminados, paginaActual, busqueda);
    } catch (err) {
      toast.error("Error al guardar el producto");
    }
  };

  const confirmarEliminacion = (id) => setModalConfirm({ isOpen: true, id });

  const ejecutarEliminacion = async () => {
    try {
      await deleteData(`productos/${modalConfirm.id}`);
      toast.info("Producto deshabilitado del inventario");
      cargarDatosIniciales(verEliminados, paginaActual, busqueda);
    } catch (err) {
      toast.error("No se pudo deshabilitar el producto");
    } finally {
      setModalConfirm({ isOpen: false, id: null });
    }
  };

  const ejecutarRestauracion = async () => {
    try {
      await putData(`productos/${modalRestaurar.id}/restaurar`, {});
      toast.success("Producto restaurado y activo nuevamente");
      cargarDatosIniciales(verEliminados, paginaActual, busqueda);
    } catch (err) {
      toast.error("No se pudo restaurar el producto");
    } finally {
      setModalRestaurar({ isOpen: false, id: null });
    }
  };

  // --- LÓGICA DE LA IA ---
  const consultarIA = async (tipoConsulta) => {
    setCargandoIA(true);
    setRespuestaIA("");
    try {
      const payload = { tipo: tipoConsulta };
      const respuesta = await postData("ia/analizar-inventario", payload);
      setRespuestaIA(respuesta.mensaje || respuesta.respuesta || "Análisis completado.");
    } catch (error) {
      toast.error("Error al conectar con el Asistente de IA.");
      setRespuestaIA("Lo siento, no pude procesar el inventario en este momento. Intenta de nuevo.");
    } finally {
      setCargandoIA(false);
    }
  };

  const umbralStock = negocio?.umbralStock ?? negocio?.umbral_stock ?? null;

  return (
    <div className="inventario-container">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <header className="inventario-header">
        <h2>{verEliminados ? "Productos Deshabilitados" : "Gestión de Inventario"}</h2>
        <div className="header-acciones">
          <button 
            className={`btn-secundario ${verEliminados ? "btn-activo" : ""}`} 
            onClick={toggleVistaEliminados}
          >
            {verEliminados ? "Ver Inventario Activo" : "Ver Eliminados"}
          </button>
          
          {!verEliminados && (
            <>
              <button className="btn-secundario" onClick={() => setMostrarImportar(true)}>
                Importar Excel
              </button>
              
              <button 
                className="btn-primario btn-ia-premium" 
                onClick={() => setShowModalIA(true)}
              >
                <Sparkles size={16} /> Analista IA
              </button>

              <button className="btn-primario" onClick={abrirNuevo}>
                Añadir Producto
              </button>
            </>
          )}
        </div>
      </header>

      <div className="inventario-tools">
        <input
          type="text"
          placeholder="Buscar por marca o descripción..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="barra-busqueda"
        />
      </div>

      <div className="table-responsive-wrapper">
        <table className="tabla-inventario">
          <thead>
            <tr>
              <th>Marca</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Unidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => {
              const estaBajoStock = umbralStock !== null && p.cantidad_stock < umbralStock && !verEliminados;
              return (
                <tr key={p.id_producto || p.id} className={estaBajoStock ? "bajo-stock-row" : ""}>
                  <td style={{ opacity: verEliminados ? 0.6 : 1 }}>{p.marca}</td>
                  <td style={{ opacity: verEliminados ? 0.6 : 1 }}>{p.descripcion}</td>
                  <td style={{ opacity: verEliminados ? 0.6 : 1 }}>${parseFloat(p.precio).toLocaleString("es-AR")}</td>
                  <td>
                    <span className={estaBajoStock ? "texto-alerta" : ""} style={{ opacity: verEliminados ? 0.6 : 1 }}>
                      {p.cantidad_stock}
                    </span>
                  </td>
                  <td style={{ opacity: verEliminados ? 0.6 : 1 }}>{p.unidad_medida}</td>
                  <td className="acciones-celda">
                    {verEliminados ? (
                      <button 
                        className="btn-accion btn-primario" 
                        onClick={() => setModalRestaurar({ isOpen: true, id: p.id_producto || p.id })}
                      >
                        Restaurar
                      </button>
                    ) : (
                      <>
                        <button className="btn-accion btn-editar" onClick={() => abrirEditar(p)}>Editar</button>
                        <button className="btn-accion btn-eliminar" onClick={() => confirmarEliminacion(p.id_producto || p.id)}>Eliminar</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {productos.length === 0 && (
              <tr>
                <td colSpan="6" className="sin-datos">
                  {verEliminados 
                    ? (busqueda ? "No hay productos eliminados que coincidan con la búsqueda." : "No hay productos eliminados.") 
                    : (busqueda ? "No se encontraron productos con esa búsqueda." : "No se encontraron productos.")}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalElementos > 0 && (
          <div className="paginacion-container">
            <button 
              className="btn-paginacion"
              disabled={paginaActual === 0} 
              onClick={() => cargarDatosIniciales(verEliminados, paginaActual - 1, busqueda)}
            >
              Anterior
            </button>
            <span className="paginacion-info">
              Página <strong>{paginaActual + 1}</strong> de {totalPaginas} ({totalElementos} resultados)
            </span>
            <button 
              className="btn-paginacion"
              disabled={paginaActual >= totalPaginas - 1} 
              onClick={() => cargarDatosIniciales(verEliminados, paginaActual + 1, busqueda)}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* --- MODAL: ANALISTA IA --- */}
      {showModalIA && (
        <div className="modal-overlay">
          <div className="modal-content modal-ia-container">
            <div className="modal-header header-ia">
              <h3><Sparkles size={22} className="ia-icon-spin" /> Asistente de Inventario IA</h3>
              <button className="btn-cerrar-ia" onClick={() => setShowModalIA(false)}><X size={20} /></button>
            </div>
            
            <div className="modal-body body-ia">
              <p className="ia-descripcion">Seleccioná qué tipo de análisis querés realizar sobre tu stock actual. El Asistente de IA procesará los datos en tiempo real.</p>
              
              <div className="ia-opciones-grid">
                <button 
                  className="ia-opcion-btn" 
                  onClick={() => consultarIA("REPOSICION")} 
                  disabled={cargandoIA}
                  style={{ opacity: cargandoIA ? 0.6 : 1, cursor: cargandoIA ? "not-allowed" : "pointer" }}
                >
                  <Package size={24} color="#f97316" />
                  <strong>Sugerencia de Compras</strong>
                  <span>Detecta stock crítico y sugiere reposición.</span>
                </button>
                <button 
                  className="ia-opcion-btn" 
                  onClick={() => consultarIA("ESTANCADOS")}
                  disabled={cargandoIA}
                  style={{ opacity: cargandoIA ? 0.6 : 1, cursor: cargandoIA ? "not-allowed" : "pointer" }}
                >
                  <AlertTriangle size={24} color="#ef4444" />
                  <strong>Productos Estancados</strong>
                  <span>Identifica capital inmovilizado.</span>
                </button>
                <button 
                  className="ia-opcion-btn" 
                  onClick={() => consultarIA("VALORIZACION")}
                  disabled={cargandoIA}
                  style={{ opacity: cargandoIA ? 0.6 : 1, cursor: cargandoIA ? "not-allowed" : "pointer" }}
                >
                  <ArrowUpRight size={24} color="#22c55e" />
                  <strong>Valorización Total</strong>
                  <span>Calcula el valor de venta del stock actual.</span>
                </button>
                <button 
                  className="ia-opcion-btn" 
                  onClick={() => consultarIA("ESTRELLAS")}
                  disabled={cargandoIA}
                  style={{ opacity: cargandoIA ? 0.6 : 1, cursor: cargandoIA ? "not-allowed" : "pointer" }}
                >
                  <Star size={24} color="#eab308" />
                  <strong>Productos Estrella</strong>
                  <span>Descubre los artículos más vendidos.</span>
                </button>
              </div>

              {cargandoIA && (
                <div className="ia-cargando" style={{ textAlign: "center", padding: "2rem 0", color: "#64748b" }}>
                  <Loader2 className="animate-spin" size={36} color="#3b82f6" style={{ margin: "0 auto", animation: "spin 1s linear infinite" }} />
                  <h4 style={{ marginTop: "15px", color: "#0f172a" }}>Procesando inventario...</h4>
                  <p style={{ fontSize: "0.9rem" }}>El Asistente de IA está analizando tu base de datos, esto tomará unos segundos.</p>
                </div>
              )}

              {respuestaIA && !cargandoIA && (
                <div className="ia-respuesta">
                  <h4>Resumen Gerencial</h4>
                  <div className="ia-respuesta-texto">{respuestaIA}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resto de modales (Creación, Edición, Importar, Confirmaciones) */}
      {showModal && selectedProducto && (
        <div className="modal-overlay">
          <div className="modal-content form-modal">
            <div className="modal-header"><h3>{isEditing ? "Editar Producto" : "Nuevo Producto"}</h3></div>
            <form onSubmit={guardarProducto}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Marca</label>
                  <input type="text" name="marca" value={selectedProducto.marca || ""} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea name="descripcion" value={selectedProducto.descripcion || ""} onChange={handleChange} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Precio Unitario</label>
                    <input type="number" step="0.01" name="precio" value={selectedProducto.precio || ""} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Stock Inicial</label>
                    <input type="number" step="0.001" name="cantidad_stock" value={selectedProducto.cantidad_stock || ""} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Unidad de Medida</label>
                  <select name="unidad_medida" value={selectedProducto.unidad_medida || "UNIDAD"} onChange={handleChange} required>
                    {UNIDADES.map((u) => (<option key={u.value} value={u.value}>{u.label}</option>))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancelar" onClick={cerrarModal}>Cancelar</button>
                <button type="submit" className="btn-primario">{isEditing ? "Actualizar Producto" : "Guardar Producto"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mostrarImportar && (
        <ImportarExcelModal
          onClose={() => setMostrarImportar(false)}
          onImportacionExitosa={() => cargarDatosIniciales(verEliminados, 0, "")}
        />
      )}

      {modalConfirm.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-confirm">
            <h3>Deshabilitar Producto</h3>
            <p>El producto dejará de estar visible en el inventario activo, pero su historial de ventas se mantendrá intacto.</p>
            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setModalConfirm({ isOpen: false, id: null })}>Cancelar</button>
              <button className="btn-peligro" onClick={ejecutarEliminacion}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {modalRestaurar.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-confirm">
            <h3>Restaurar Producto</h3>
            <p>El producto volverá a estar disponible en tu inventario activo para la venta.</p>
            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setModalRestaurar({ isOpen: false, id: null })}>Cancelar</button>
              <button className="btn-primario" onClick={ejecutarRestauracion}>Restaurar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventarioView;