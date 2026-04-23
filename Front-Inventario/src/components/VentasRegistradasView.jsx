import React, { useState, useEffect } from "react";
import { deleteData, fetchData } from "../components/utils/api.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/modules/VentasModule.css";

const VentasRegistradasView = ({ clientes = [], productos = [] }) => {
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalConfirm, setModalConfirm] = useState({ isOpen: false, id: null });

  const normalizar = (data) =>
    Array.isArray(data) ? data : data?.content ?? [];

  const cargarVentas = async () => {
    setCargando(true);
    try {
      const data = await fetchData("ventas");
      setVentas(normalizar(data));
    } catch (err) {
      console.error("Error al cargar ventas:", err);
      toast.error("Error al cargar el registro de ventas");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarVentas();
  }, []);

  const confirmarEliminacion = (id) => {
    setModalConfirm({ isOpen: true, id });
  };

  const ejecutarEliminacion = async () => {
    try {
      await deleteData(`ventas/${modalConfirm.id}`);
      toast.info("Venta eliminada correctamente");
      cargarVentas();
    } catch (err) {
      console.error("Error al eliminar venta:", err);
      toast.error("No se pudo eliminar la venta");
    } finally {
      setModalConfirm({ isOpen: false, id: null });
    }
  };

  return (
    <div className="ventas-module">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="ventas-header">
        <h2>Registro de Ventas</h2>
      </div>

      <div className="table-responsive-wrapper">
        <table className="ventas-table">
          <thead>
            <tr>
              <th>ID Venta</th>
              <th>Cliente</th>
              <th>Detalle de Productos</th>
              <th>Total</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan="6" className="celda-vacia">Cargando registro de ventas...</td>
              </tr>
            ) : ventas.length === 0 ? (
              <tr>
                <td colSpan="6" className="celda-vacia">No hay ventas registradas en el sistema.</td>
              </tr>
            ) : (
              ventas.map((v) => (
                <tr key={v.id}>
                  <td><strong>#{v.id}</strong></td>
                  <td>
                    {v.cliente
                      ? `${v.cliente.nombre} ${v.cliente.apellido}`
                      : <span className="texto-muted">Consumidor Final</span>}
                  </td>
                  <td className="celda-detalles">
                    <ul className="lista-detalles-mini">
                      {v.detalleVentas?.map((d, i) => {
                        const prod = productos.find((p) => p.id === d.idProducto || p.id_producto === d.idProducto);
                        return (
                          <li key={i}>
                            <span className="cant-mini">x{d.cantidad}</span>
                            {prod?.descripcion || prod?.nombre || `Prod #${d.idProducto}`}
                          </li>
                        );
                      })}
                    </ul>
                  </td>
                  <td className="celda-importe">${parseFloat(v.importe).toLocaleString("es-AR")}</td>
                  <td>{new Date(v.fecha).toLocaleDateString("es-AR")}</td>
                  <td className="acciones-celda">
                    <button className="btn-accion btn-eliminar" onClick={() => confirmarEliminacion(v.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Confirmación */}
      {modalConfirm.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-confirm">
            <h3>Eliminar Registro de Venta</h3>
            <p>¿Estás seguro de que deseas eliminar la venta <strong>#{modalConfirm.id}</strong>? Esta acción actualizará los registros pero no revertirá el stock automáticamente.</p>
            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setModalConfirm({ isOpen: false, id: null })}>
                Cancelar
              </button>
              <button className="btn-peligro" onClick={ejecutarEliminacion}>
                Confirmar Eliminación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VentasRegistradasView;