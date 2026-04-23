import React, { useEffect, useState } from "react";
import { getComprasPorProveedor, getDetallesCompra, fetchData } from "../components/utils/api";
import "../styles/modules/HistorialCompras.css";

const HistorialCompras = ({ proveedorId }) => {
  const [filas, setFilas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    // FIX: Aseguramos que si la API devuelve paginación, extraemos el array correcto
    fetchData("productos")
      .then((res) => setProductos(Array.isArray(res) ? res : res?.content ?? []))
      .catch((err) => console.error("Error cargando productos:", err));
  }, []);

  useEffect(() => {
    if (!proveedorId) return;

    const cargarHistorial = async () => {
      setCargando(true);
      try {
        const compras = await getComprasPorProveedor(proveedorId);

        const comprasOrdenadas = compras.sort(
          (a, b) => new Date(b.fecha) - new Date(a.fecha)
        );

        const filasExpandidas = [];

        for (const compra of comprasOrdenadas) {
          const detalles = await getDetallesCompra(compra.id);

          detalles.forEach((det) => {
            filasExpandidas.push({
              id: det.id,
              fecha: compra.fecha,
              metodoPago: compra.metodoPago,
              observaciones: compra.observaciones,
              idProducto: det.idProducto,
              cantidad: det.cantidad,
              importe: det.importe,
            });
          });
        }

        setFilas(filasExpandidas);
      } catch (error) {
        console.error("Error cargando historial de compras:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarHistorial();
  }, [proveedorId]);

  const obtenerDescripcion = (idProducto) => {
    // Verificamos tanto por id como por id_producto según cómo venga de tu base de datos
    const prod = productos.find((p) => p.id === idProducto || p.id_producto === idProducto);
    return prod ? prod.descripcion : `Prod ID #${idProducto}`;
  };

  if (!proveedorId) return null;

  return (
    <div className="historial-compras-container">
      <div className="historial-header">
        <h4>Historial de Compras del Proveedor</h4>
      </div>

      {cargando ? (
        <p className="texto-estado">Cargando historial de compras...</p>
      ) : filas.length === 0 ? (
        <p className="texto-estado">No hay compras registradas para este proveedor.</p>
      ) : (
        <div className="table-responsive-wrapper">
          <table className="compras-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th className="text-center">Cantidad</th>
                <th>Importe</th>
                <th>Método</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.id}>
                  <td>{f.fecha}</td>
                  <td>{obtenerDescripcion(f.idProducto)}</td>
                  <td className="text-center"><strong>{f.cantidad}</strong></td>
                  <td className="importe-celda">
                    ${parseFloat(f.importe).toLocaleString("es-AR")}
                  </td>
                  <td>
                    <span className="badge-metodo">{f.metodoPago || "N/D"}</span>
                  </td>
                  <td className="obs-celda">{f.observaciones || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistorialCompras;