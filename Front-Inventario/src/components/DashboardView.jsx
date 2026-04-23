import React, { useEffect, useState } from "react";
import { getNegocio, updateNegocio, getNotas, createNota, deleteNota, getDashboardResumen } from "../components/utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HistorialVentas from "../components/UI/HistorialVentas"; 
import "../styles/Dashboard.css";
import "../styles/Modal.css";

const DashboardView = () => {
  const [negocio, setNegocio] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  // NUEVO ESTADO: El resumen optimizado del backend
  const [resumen, setResumen] = useState(null);

  // ESTADOS DE NOTAS EN BASE DE DATOS
  const [nota, setNota] = useState("");
  const [notas, setNotas] = useState([]);

  // --- FIX MULTIPLATAFORMA: BLOQUEAR SCROLL DE FONDO AL ABRIR MODAL ---
  useEffect(() => {
    if (mostrarModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [mostrarModal]);

  // CARGA INICIAL DE DATOS
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        // 1. Cargamos Negocio
        const dataNegocio = await getNegocio();
        const negocioData = Array.isArray(dataNegocio) ? dataNegocio[0] : dataNegocio;
        const negocioTransformado = {
          ...negocioData,
          umbralStock: negocioData?.umbral_stock ?? null,
          ticketCabecera: negocioData?.ticket_cabecera ?? "",
          ticketPie: negocioData?.ticket_pie ?? ""            
        };
        setNegocio(negocioTransformado);

        // 2. Cargamos Notas
        const dataNotas = await getNotas();
        setNotas(Array.isArray(dataNotas) ? dataNotas : []);

        // 3. CARGAMOS EL RESUMEN OPTIMIZADO Y LO IMPRIMIMOS EN CONSOLA
        const dataResumen = await getDashboardResumen();
        console.log("👉 ESTO MANDA EL BACKEND:", dataResumen);
        setResumen(dataResumen);

      } catch (err) {
        console.error("Error al cargar datos iniciales:", err);
        toast.error("Error de conexión con el servidor");
      }
    };
    cargarDatosIniciales();
  }, []);

  // Función auxiliar de fecha para la auditoría
  const parseFecha = (fecha) => {
    if (!fecha) return new Date(0);
    if (Array.isArray(fecha)) {
      return new Date(fecha[0], fecha[1] - 1, fecha[2], fecha[3] || 0, fecha[4] || 0);
    }
    return new Date(fecha);
  };

  // LÓGICA DE NOTAS
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
      toast.error("Error al eliminar la nota");
    }
  };

  const guardarCambiosNegocio = async (datosActualizados) => {
    try {
      if (!datosActualizados.nombre || !datosActualizados.rubro) {
        toast.warn("Completá los campos obligatorios.");
        return;
      }
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
      setNegocio({
        ...actualizado,
        umbralStock: actualizado?.umbral_stock ?? null,
        ticketCabecera: actualizado?.ticket_cabecera ?? "",
        ticketPie: actualizado?.ticket_pie ?? ""
      });
      setMostrarModal(false);
      toast.success("Negocio actualizado correctamente.");
    } catch (err) {
      toast.error("Error al actualizar el negocio.");
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

  if (!resumen) {
    return <div className="dashboard-content"><h2>Cargando panel...</h2></div>;
  }

  return (
    <div className="dashboard-content">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2>Panel General</h2>

      {/* 1. CARDS */}
      <div className="cards-container">
        <div className="card"><h3>Total Productos</h3><p>{resumen.totalProductos}</p></div>
        <div className="card"><h3>Clientes</h3><p>{resumen.totalClientes}</p></div>
        <div className="card"><h3>Empleados</h3><p>{resumen.totalEmpleados}</p></div>
        <div className="card"><h3>Ventas Totales</h3><p>{resumen.ventasTotales}</p></div>
        <div className="card"><h3>Ventas último mes</h3><p>{resumen.ventasUltimoMes}</p></div>
      </div>

      <div className="historial-seccion" style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>Evolución de Ventas</h3>
        <HistorialVentas />
      </div>

      {/* 2. TOP PRODUCTOS */}
      <div className="top-productos-container">
        <h3>Top Productos Vendidos (último mes)</h3>
        {resumen.topProductos && resumen.topProductos.length > 0 ? (
          <ul className="lista-simple">
            {resumen.topProductos.map((p, i) => (
              <li key={i}>
                <strong>{p.nombre}</strong>: {p.cantidad} unidades
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
          {negocio?.umbralStock !== null && <span className="umbral-info">(Umbral: {negocio.umbralStock})</span>}
        </h3>
        {negocio?.umbralStock === null ? (
          <p className="texto-vacio">No hay umbral configurado en los ajustes.</p>
        ) : resumen.bajoStock && resumen.bajoStock.length > 0 ? (
          <div className="bajo-stock-list">
            {resumen.bajoStock.map((p) => (
              <div key={p.id} className="bajo-stock-card">
                <h4>{p.nombre}</h4>
                <p><strong>Marca:</strong> {p.marca}</p>
                <p><strong>Descripción:</strong> {p.descripcion}</p>
                <p className="stock-alerta"><strong>Stock Actual:</strong> {p.cantidadStock}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="texto-vacio">Todos los productos tienen stock suficiente.</p>
        )}
      </div>

      {/* 4. AUDITORIA */}
      <div className="auditoria-container" style={{ marginTop: '30px' }}>
        <h3>Historial de Movimientos</h3>
        {resumen.auditoria && resumen.auditoria.length > 0 ? (
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
                {resumen.auditoria.map((registro) => {
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

      {/* 5. NOTAS */}
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

      {/* 6. NEGOCIO INFO Y MODAL */}
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