import React, { useEffect, useState } from "react";
import { getOrdenesPorProveedor, recibirOrdenCompra, fetchData } from "../components/utils/api";
import { toast } from "react-toastify";
import "../styles/modules/HistorialCompras.css";

const HistorialCompras = ({ proveedorId }) => {
  const [filas, setFilas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    fetchData("productos")
      .then((res) => setProductos(Array.isArray(res) ? res : res?.content ?? []))
      .catch((err) => console.error("Error cargando productos:", err));
  }, []);

  const cargarHistorial = async () => {
    if (!proveedorId) return;
    setCargando(true);

    try {
      const response = await getOrdenesPorProveedor(proveedorId);
      
      const listaLimpia = Array.isArray(response) ? response : (response?.content || []);

      const ordenesOrdenadas = [...listaLimpia].sort(
        (a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
      );

      const filasExpandidas = [];

      ordenesOrdenadas.forEach((orden) => {
        if (!orden.detalles || orden.detalles.length === 0) return;

        orden.detalles.forEach((det, index) => {
          filasExpandidas.push({
            idOrden: orden.id,
            idDetalle: det.id,
            fecha: orden.fechaCreacion ? orden.fechaCreacion.split("T")[0] : "",
            estado: orden.estado, 
            metodoPago: orden.metodoPago,
            obsGeneral: orden.observaciones, // Capturamos la nota general de la compra
            obsProducto: det.observaciones,  // Capturamos la nota específica del producto
            idProducto: det.producto?.id,
            cantidad: det.cantidad,
            importe: det.precioUnitario,
            subtotal: det.cantidad * det.precioUnitario,
            esPrimeraFila: index === 0 
          });
        });
      });

      setFilas(filasExpandidas);
    } catch (error) {
      console.error("Error cargando historial de compras:", error);
      toast.error("No se pudo cargar el historial de órdenes");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, [proveedorId]);

  const obtenerDescripcion = (idProducto) => {
    const prod = productos.find((p) => p.id === idProducto || p.id_producto === idProducto);
    return prod ? prod.descripcion : `Prod ID #${idProducto}`;
  };

  const handleMarcarRecibida = async (idOrden) => {
    try {
      await recibirOrdenCompra(idOrden);
      toast.success("¡Orden recibida! El stock ha sido actualizado correctamente.");
      cargarHistorial(); 
    } catch (error) {
      console.error(error);
      toast.error("Error al confirmar la recepción de la orden");
    }
  };

  if (!proveedorId) return null;

  return (
    <div className="historial-compras-container">
      <div className="historial-header">
        <h4>Historial de Órdenes del Proveedor</h4>
      </div>

      {cargando ? (
        <p className="texto-estado">Cargando historial de compras...</p>
      ) : filas.length === 0 ? (
        <p className="texto-estado">No hay órdenes registradas para este proveedor.</p>
      ) : (
        <div className="table-responsive-wrapper">
          <table className="compras-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Producto</th>
                <th className="text-center">Cantidad</th>
                <th>Costo Unit.</th>
                <th>Subtotal</th>
                <th>Método</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => {
                // Lógica para mostrar la observación más relevante y armar el tooltip (title)
                const textoMostrar = f.obsProducto ? f.obsProducto : (f.esPrimeraFila ? f.obsGeneral : "-");
                const tooltipCompleto = `General: ${f.obsGeneral || 'Ninguna'}\nProducto: ${f.obsProducto || 'Ninguna'}`;

                return (
                  <tr 
                    key={f.idDetalle} 
                    className={f.estado === 'RECIBIDA' ? 'fila-recibida' : ''}
                  >
                    <td>{f.fecha}</td>
                    <td>
                      <span 
                        className={`badge-estado ${f.estado === 'PENDIENTE' ? 'badge-pendiente' : 'badge-recibida'}`}
                      >
                        {f.estado}
                      </span>
                    </td>
                    <td>{obtenerDescripcion(f.idProducto)}</td>
                    <td className="text-center"><strong>{f.cantidad}</strong></td>
                    <td className="importe-celda">
                      ${parseFloat(f.importe).toLocaleString("es-AR")}
                    </td>
                    <td className="importe-celda" style={{ fontWeight: '600' }}>
                      ${parseFloat(f.subtotal).toLocaleString("es-AR")}
                    </td>
                    <td>
                      <span className="badge-metodo">{f.metodoPago || "N/D"}</span>
                    </td>
                    
                    {/* NUEVA COLUMNA OBSERVACIONES CON TU CLASE .obs-celda */}
                    <td className="obs-celda" title={tooltipCompleto} style={{ cursor: 'help' }}>
                      {textoMostrar || "-"}
                    </td>

                    <td>
                      {f.esPrimeraFila && f.estado === 'PENDIENTE' && (
                        <button 
                          className="btn-primario btn-recibir" 
                          onClick={() => handleMarcarRecibida(f.idOrden)}
                        >
                          Recibir
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistorialCompras;