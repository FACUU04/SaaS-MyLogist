import React, { useEffect, useState } from "react";
import { getNegocio, updateNegocio, getNotas, createNota, deleteNota } from "../components/utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HistorialVentas from "../components/UI/HistorialVentas"; 
import "../styles/Dashboard.css";
import "../styles/Modal.css";

const DashboardView = ({
  productos = [],
  clientes = [],
  empleados = [],
  ventas = [],
  auditoria = [] 
}) => {

  const safeArray = (data) => (Array.isArray(data) ? data : data?.content ?? []);

  const productosSafe = safeArray(productos);
  const clientesSafe = safeArray(clientes);
  const empleadosSafe = safeArray(empleados);
  const ventasSafe = safeArray(ventas);
  const auditoriaSafe = safeArray(auditoria); 

  const [negocio, setNegocio] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  // ESTADOS DE NOTAS EN BASE DE DATOS
  const [nota, setNota] = useState("");
  const [notas, setNotas] = useState([]);

  // CARGAR NEGOCIO Y NOTAS
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        const dataNegocio = await getNegocio();
        const negocioData = Array.isArray(dataNegocio) ? dataNegocio[0] : dataNegocio;

        const negocioTransformado = {
          ...negocioData,
          umbralStock: negocioData?.umbral_stock ?? null,
          ticketCabecera: negocioData?.ticket_cabecera ?? "",
          ticketPie: negocioData?.ticket_pie ?? ""            
        };
        setNegocio(negocioTransformado);

        const dataNotas = await getNotas();
        setNotas(Array.isArray(dataNotas) ? dataNotas : []);

      } catch (err) {
        console.error("Error al cargar datos iniciales:", err);
      }
    };
    cargarDatosIniciales();
  }, []);

  // VENTAS ÚLTIMO MES Y TOP PRODUCTOS
  const hoy = new Date();
  const haceUnMes = new Date();
  haceUnMes.setMonth(hoy.getMonth() - 1);

  const parseFecha = (fecha) => {
    if (!fecha) return new Date(0);
    if (Array.isArray(fecha)) {
      return new Date(fecha[0], fecha[1] - 1, fecha[2], fecha[3] || 0, fecha[4] || 0);
    }
    return new Date(fecha);
  };

  const ventasUltimoMes = ventasSafe.filter((v) => {
    const fechaVenta = parseFecha(v.fecha);
    return v.fecha && fechaVenta >= haceUnMes && fechaVenta <= hoy;
  });

  const ventasPorProducto = {};
  ventasUltimoMes.forEach((venta) => {
    const detalles = venta.detalleVentas || venta.detalles || [];
    detalles.forEach((detalle) => {
      const marca = detalle.marcaProducto || detalle.producto?.marca || "Marca desconocida";
      const descripcion = detalle.descripcionProducto || detalle.producto?.descripcion || "Sin descripción";
      const etiqueta = `${marca} — ${descripcion}`;
      const cantidad = Number(detalle.cantidad || 1);
      ventasPorProducto[etiqueta] = (ventasPorProducto[etiqueta] || 0) + cantidad;
    });
  });

  const topProductos = Object.entries(ventasPorProducto)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const umbralStock = negocio?.umbralStock ?? null;
  const productosLista = Array.isArray(productos) ? productos : productos?.content ?? [];
  const bajoStock = umbralStock !== null
    ? productosLista.filter((p) => {
        const stockActual = Number(p?.cantidad_stock ?? 0);
        return !isNaN(stockActual) && stockActual < umbralStock;
      })
    : [];

  // LÓGICA DE NOTAS (BASE DE DATOS)
  const agregarNota = async () => {
    if (nota.trim()) {
      try {
        const nuevaNota = await createNota(nota.trim());
        setNotas([nuevaNota, ...notas]);
        setNota("");
        toast.success("Nota guardada");
      } catch (err) {
        toast.error("Error al guardar la nota");
      }
    }
  };

  const eliminarNota = async (id) => {
    try {
      await deleteNota(id);
      setNotas(notas.filter((n) => n.id !== id));
      toast.info("Nota eliminada");
    } catch (err) {
      toast.error("Error al eliminar la nota (¿Permisos?)");
    }
  };

  const validarDatos = (datos) => {
    if (!datos.nombre || !datos.rubro) {
      toast.warn("Completá los campos obligatorios.");
      return false;
    }
    return true;
  };

  const guardarCambiosNegocio = async (datosActualizados) => {
    try {
      if (!validarDatos(datosActualizados)) return;

      const payload = {
        id: negocio.id,
        nombre: datosActualizados.nombre,
        rubro: datosActualizados.rubro,
        ubicacion: datosActualizados.ubicacion,
        umbral_stock: datosActualizados.umbralStock === "" ? null : Number(datosActualizados.umbralStock),
        ticket_cabecera: datosActualizados.ticketCabecera, 
        ticket_pie: datosActualizados.ticketPie            
      };

      const actualizado = await updateNegocio(payload);

      const actualizadoTransformado = {
        ...actualizado,
        umbralStock: actualizado?.umbral_stock ?? null,
        ticketCabecera: actualizado?.ticket_cabecera ?? "",
        ticketPie: actualizado?.ticket_pie ?? ""
      };

      setNegocio(actualizadoTransformado);
      setMostrarModal(false);
      toast.success("Negocio actualizado correctamente.");
    } catch (err) {
      toast.error("Error al actualizar el negocio.");
      console.error("Error al actualizar negocio:", err);
    }
  };

  const getBadgeClass = (accion) => {
    switch (accion) {
      case "CREACION": return "badge-creacion";
      case "ACTUALIZACION": return "badge-actualizacion";
      case "ELIMINACION": return "badge-eliminacion";
      case "RESTAURACION": return "badge-restauracion";
      default: return "badge-default";
    }
  };

  return (
    <div className="dashboard-content">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2>Panel General</h2>

      {/* 1. CARDS */}
      <div className="cards-container">
        <div className="card"><h3>Total Productos</h3><p>{productosSafe.length}</p></div>
        <div className="card"><h3>Clientes</h3><p>{clientesSafe.length}</p></div>
        <div className="card"><h3>Empleados</h3><p>{empleadosSafe.length}</p></div>
        <div className="card"><h3>Ventas Totales</h3><p>{ventasSafe.length}</p></div>
        <div className="card"><h3>Ventas último mes</h3><p>{ventasUltimoMes.length}</p></div>
      </div>

      <div className="historial-seccion" style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>Evolución de Ventas</h3>
        <HistorialVentas />
      </div>

      {/* 2. TOP PRODUCTOS */}
      <div className="top-productos-container">
        <h3>Top Productos Vendidos (último mes)</h3>
        {topProductos.length > 0 ? (
          <ul className="lista-simple">
            {topProductos.map(([nombre, cantidad], i) => (
              <li key={i}>
                <strong>{nombre}</strong>: {cantidad} unidades vendidas
              </li>
            ))}
          </ul>
        ) : (
          <p className="texto-vacio">No hay ventas registradas este mes.</p>
        )}
      </div>

      {/* 3. BAJO STOCK */}
      <div className="bajo-stock-container">
        <h3>
          Productos con Bajo Stock{" "}
          {umbralStock !== null && <span className="umbral-info">(Umbral: {umbralStock})</span>}
        </h3>
        {umbralStock === null ? (
          <p className="texto-vacio">No hay umbral configurado en los ajustes del negocio.</p>
        ) : bajoStock.length > 0 ? (
          <div className="bajo-stock-list">
            {bajoStock.map((p) => (
              <div key={p.id} className="bajo-stock-card">
                <h4>{p.nombre}</h4>
                <p><strong>Marca:</strong> {p.marca}</p>
                <p><strong>Descripción:</strong> {p.descripcion}</p>
                <p className="stock-alerta"><strong>Stock Actual:</strong> {p.cantidad_stock ?? p.stock}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="texto-vacio">Todos los productos tienen stock suficiente.</p>
        )}
      </div>

      {/* 4. AUDITORIA */}
      <div className="auditoria-container" style={{ marginTop: '30px' }}>
        <h3>Historial de Movimientos (Auditoría)</h3>
        {auditoriaSafe.length > 0 ? (
          <div className="table-responsive">
            <table className="table-compras" style={{ width: '100%', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th>Fecha y Hora</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Entidad</th>
                  <th>Detalles</th>
                </tr>
              </thead>
              <tbody>
                {auditoriaSafe.map((registro) => {
                  const fechaFormat = parseFecha(registro.fechaHora).toLocaleString();
                  return (
                    <tr key={registro.id}>
                      <td>{fechaFormat}</td>
                      <td>{registro.usuario}</td>
                      <td>
                        <span className={`badge ${getBadgeClass(registro.accion)}`} style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                          {registro.accion}
                        </span>
                      </td>
                      <td>{registro.entidad} (ID: {registro.entidadId})</td>
                      <td>{registro.detalles}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="texto-vacio">No hay registros de auditoría aún.</p>
        )}
      </div>

      {/* 5. NOTAS (MURO COMPARTIDO DB) */}
      <div className="notas-container" style={{ marginTop: '30px' }}>
        <h3>Muro de Anotaciones</h3>
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
                  <small style={{ color: '#64748b', fontWeight: 'bold' }}>{n.usuario} • {fechaFormato}</small>
                  <button className="btn-eliminar-nota" onClick={() => eliminarNota(n.id)}>Eliminar</button>
                </div>
                <span>{n.contenido}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 6. NEGOCIO INFO */}
      {negocio && (
        <div className="negocio-info" style={{ marginTop: '30px' }}>
          <div className="negocio-header">
            <h3>{negocio.nombre}</h3>
            <button className="btn-secundario" onClick={() => setMostrarModal(true)}>
              Editar Información
            </button>
          </div>
          <div className="negocio-detalles">
            <p><strong>Rubro:</strong> {negocio.rubro}</p>
            <p><strong>Ubicación:</strong> {negocio.ubicacion}</p>
            <p><strong>Umbral de Stock:</strong> {negocio.umbralStock ?? "No configurado"}</p>
          </div>
        </div>
      )}

      {/* MODAL EDITAR NEGOCIO */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-negocio">
            <div className="modal-header">
              <h3>Editar Información del Negocio</h3>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const datos = Object.fromEntries(new FormData(e.target));
                guardarCambiosNegocio(datos);
              }}
            >
              <div className="modal-body">
                {["nombre", "rubro", "ubicacion", "umbralStock"].map((campo) => (
                  <div key={campo} className="form-group">
                    <label>
                      {campo === "umbralStock" ? "Umbral de Stock Bajo" : campo.charAt(0).toUpperCase() + campo.slice(1)}
                    </label>
                    <input
                      name={campo}
                      type={campo === "umbralStock" ? "number" : "text"}
                      defaultValue={negocio[campo] ?? ""}
                      placeholder={campo === "umbralStock" ? "Ej: 10" : ""}
                    />
                  </div>
                ))}

                <hr style={{ margin: '20px 0', borderColor: '#eee' }} />
                <h4 style={{ marginBottom: '15px' }}>Configuración del Ticket PDF</h4>

                <div className="form-group">
                  <label>Mensaje de Cabecera</label>
                  <input
                    name="ticketCabecera"
                    type="text"
                    defaultValue={negocio.ticketCabecera ?? "¡Gracias por su compra!"}
                    placeholder="Ej: Ferretería El Sol - Tel: 555-1234"
                  />
                </div>
                
                <div className="form-group">
                  <label>Mensaje de Pie de página</label>
                  <input
                    name="ticketPie"
                    type="text"
                    defaultValue={negocio.ticketPie ?? "Vuelva pronto"}
                    placeholder="Ej: ¡Los esperamos la próxima!"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancelar" onClick={() => setMostrarModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primario">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;