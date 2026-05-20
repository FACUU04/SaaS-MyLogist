import React, { useEffect, useState } from "react";
import { fetchData, postData, putData, deleteData, getNegocio } from "../components/utils/api";
import { ToastContainer, toast } from "react-toastify";
import ImportarExcelModal from "./ImportarExcelModal"; 
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

  // Estado para controlar el modal del Excel
  const [mostrarImportar, setMostrarImportar] = useState(false);

  // Estados para modales de confirmación
  const [modalConfirm, setModalConfirm] = useState({ isOpen: false, id: null });
  const [modalRestaurar, setModalRestaurar] = useState({ isOpen: false, id: null });

  // Estados de la paginación
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);

  // EFECTO DE CARGA Y BÚSQUEDA (Debounce)
  // Reemplaza al useEffect vacío. Reacciona cuando cambia la búsqueda o la vista.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      cargarDatosIniciales(verEliminados, 0, busqueda);
    }, 500); // Espera 500ms al dejar de escribir

    return () => clearTimeout(timeoutId);
  }, [busqueda, verEliminados]);

  const cargarDatosIniciales = async (mostrarEliminados = verEliminados, pagina = 0, terminoBusqueda = busqueda) => {
    try {
      // Armamos la URL agregando el parámetro de búsqueda si existe
      const queryBusqueda = terminoBusqueda ? `&buscar=${encodeURIComponent(terminoBusqueda)}` : "";
      const endpoint = mostrarEliminados 
        ? `productos/eliminados?page=${pagina}&size=10${queryBusqueda}` 
        : `productos?page=${pagina}&size=10${queryBusqueda}`;

      const [productosData, negocioData] = await Promise.all([
        fetchData(endpoint, false), // false para que api.js no borre la paginación
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
    const nuevoEstado = !verEliminados;
    setVerEliminados(nuevoEstado);
    setBusqueda(""); // Limpiamos el buscador al cambiar de pestaña
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
    setSelectedProducto((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        const id = selectedProducto.id_producto;
        await putData(`productos/${id}`, payload);
        toast.success("Producto actualizado correctamente");
      } else {
        await postData("productos", payload);
        toast.success("Producto creado correctamente");
      }
      cerrarModal();
      cargarDatosIniciales(verEliminados, paginaActual, busqueda);
    } catch (err) {
      console.error("Error en la operación:", err);
      toast.error("Error al guardar el producto");
    }
  };

  const confirmarEliminacion = (id) => {
    setModalConfirm({ isOpen: true, id });
  };

  const ejecutarEliminacion = async () => {
    try {
      await deleteData(`productos/${modalConfirm.id}`);
      toast.info("Producto deshabilitado del inventario");
      cargarDatosIniciales(verEliminados, paginaActual, busqueda);
    } catch (err) {
      console.error("Error al eliminar:", err);
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
      console.error("Error al restaurar:", err);
      toast.error("No se pudo restaurar el producto");
    } finally {
      setModalRestaurar({ isOpen: false, id: null });
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
              <button 
                className="btn-secundario" 
                onClick={() => setMostrarImportar(true)}
              >
                Importar Excel
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
                        <button className="btn-accion btn-editar" onClick={() => abrirEditar(p)}>
                          Editar
                        </button>
                        <button className="btn-accion btn-eliminar" onClick={() => confirmarEliminacion(p.id_producto || p.id)}>
                          Eliminar
                        </button>
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

        {/* CONTROLES DE PAGINACIÓN */}
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

      {/* Modal de Creación/Edición */}
      {showModal && selectedProducto && (
        <div className="modal-overlay">
          <div className="modal-content form-modal">
            <div className="modal-header">
              <h3>{isEditing ? "Editar Producto" : "Nuevo Producto"}</h3>
            </div>

            <form onSubmit={guardarProducto}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Marca</label>
                  <input
                    type="text"
                    name="marca"
                    value={selectedProducto.marca || ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    name="descripcion"
                    value={selectedProducto.descripcion || ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Precio Unitario</label>
                    <input
                      type="number"
                      step="0.01"
                      name="precio"
                      value={selectedProducto.precio || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Stock Inicial</label>
                    <input
                      type="number"
                      step="0.001"
                      name="cantidad_stock"
                      value={selectedProducto.cantidad_stock || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Unidad de Medida</label>
                  <select
                    name="unidad_medida"
                    value={selectedProducto.unidad_medida || "UNIDAD"}
                    onChange={handleChange}
                    required
                  >
                    {UNIDADES.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancelar" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primario">
                  {isEditing ? "Actualizar Producto" : "Guardar Producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Importación de Excel */}
      {mostrarImportar && (
        <ImportarExcelModal
          onClose={() => setMostrarImportar(false)}
          onImportacionExitosa={() => cargarDatosIniciales(verEliminados, 0, "")}
        />
      )}

      {/* Modal Oscuro de Confirmación de Eliminación */}
      {modalConfirm.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-confirm">
            <h3>Deshabilitar Producto</h3>
            <p>El producto dejará de estar visible en el inventario activo, pero su historial de ventas se mantendrá intacto.</p>
            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setModalConfirm({ isOpen: false, id: null })}>
                Cancelar
              </button>
              <button className="btn-peligro" onClick={ejecutarEliminacion}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Restauración */}
      {modalRestaurar.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-confirm">
            <h3>Restaurar Producto</h3>
            <p>El producto volverá a estar disponible en tu inventario activo para la venta.</p>
            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setModalRestaurar({ isOpen: false, id: null })}>
                Cancelar
              </button>
              <button className="btn-primario" onClick={ejecutarRestauracion}>
                Restaurar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventarioView;