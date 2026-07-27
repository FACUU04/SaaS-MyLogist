import React, { useEffect, useState } from "react";
import { getNegocio, updateNegocio, getNotas, createNota, deleteNota, getDashboardResumen } from "../components/utils/api";
import { ToastContainer, toast } from "react-toastify";
import HistorialVentas from "../components/UI/HistorialVentas"; 
import BalanceGrafico from "../components/UI/BalanceGrafico"; 
import { 
  Sparkles, Package, Users, Briefcase, BadgeDollarSign, TrendingUp, 
  AlertTriangle, Activity, Settings, MessageSquare, CheckCircle, Store, ShieldAlert
} from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Dashboard.css";
import "../styles/Modal.css";

const DashboardView = () => {
  const [negocio, setNegocio] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [resumen, setResumen] = useState(null);
  const [nota, setNota] = useState("");
  const [notas, setNotas] = useState([]);

  useEffect(() => {
    if (mostrarModal) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [mostrarModal]);

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        const dataNegocio = await getNegocio();
        const negocioData = Array.isArray(dataNegocio) ? dataNegocio[0] : dataNegocio;
        setNegocio({
          ...negocioData,
          umbralStock: negocioData?.umbral_stock ?? null,
          ticketCabecera: negocioData?.ticket_cabecera ?? "",
          ticketPie: negocioData?.ticket_pie ?? ""            
        });

        const dataNotas = await getNotas();
        setNotas(Array.isArray(dataNotas) ? dataNotas : []);

        const dataResumen = await getDashboardResumen();
        setResumen(dataResumen);
      } catch (err) {
        toast.error("Error de conexión con el servidor");
      }
    };
    cargarDatosIniciales();
  }, []);

  const parseFecha = (fecha) => {
    if (!fecha) return new Date(0);
    if (Array.isArray(fecha)) return new Date(fecha[0], fecha[1] - 1, fecha[2], fecha[3] || 0, fecha[4] || 0);
    return new Date(fecha);
  };

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
        return toast.warn("Completá los campos obligatorios.");
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
    return <div className="dashboard-content"><div className="loader-clean">Sincronizando panel...</div></div>;
  }

  return (
    <div className="dashboard-content">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* 1. RINCÓN INTELIGENTE (GEMINI IA) */}
      <div className="ai-insight-card">
        <div className="ai-header">
          <Sparkles className="ai-icon" size={24} />
          <h3>Análisis Inteligente</h3>
        </div>
        <p className="ai-text">
          {resumen.consejoIA || "Tus métricas están estables. Basado en el volumen de operaciones, te sugerimos revisar el inventario de los 3 productos más vendidos para evitar quiebres de stock este fin de semana."}
        </p>
      </div>

      {/* 2. TARJETAS DE MÉTRICAS (KPIs) */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper blue"><BadgeDollarSign size={24} /></div>
          <div className="kpi-info">
            <span className="kpi-label">Ventas Totales</span>
            <h3 className="kpi-value">{resumen.ventasTotales}</h3>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-wrapper orange"><TrendingUp size={24} /></div>
          <div className="kpi-info">
            <span className="kpi-label">Ventas (Último mes)</span>
            <h3 className="kpi-value">{resumen.ventasUltimoMes}</h3>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-wrapper slate"><Package size={24} /></div>
          <div className="kpi-info">
            <span className="kpi-label">Productos Activos</span>
            <h3 className="kpi-value">{resumen.totalProductos}</h3>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-wrapper green"><Users size={24} /></div>
          <div className="kpi-info">
            <span className="kpi-label">Clientes Registrados</span>
            <h3 className="kpi-value">{resumen.totalClientes}</h3>
          </div>
        </div>
      </div>

      {/* 3. GRÁFICOS */}
      <div className="graficos-grid">
        <div className="card grafico-card">
          <div className="card-header"><Activity size={20} /> <h3>Evolución de Ventas</h3></div>
          <HistorialVentas />
        </div>
        <div className="card grafico-card">
          <div className="card-header"><BadgeDollarSign size={20} /> <h3>Balance Mensual</h3></div>
          <BalanceGrafico data={resumen.balanceMensual || []} />
        </div>
      </div>

      {/* 4. LISTAS (3 COLUMNAS) */}
      <div className="listas-grid">
        {/* TOP PRODUCTOS */}
        <div className="card list-card">
          <div className="card-header"><TrendingUp size={20} /> <h3>Top Ventas (Mes)</h3></div>
          {resumen.topProductos && resumen.topProductos.length > 0 ? (
            <ul className="lista-simple">
              {resumen.topProductos.map((p, i) => (
                <li key={i}>
                  <div className="producto-top-info">
                    <strong>{p.nombre}</strong>
                    <span className="producto-top-cant">{p.cantidad} un.</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="texto-vacio">Sin registros este mes.</p>
          )}
        </div>

        {/* BAJO STOCK */}
        <div className="card list-card">
          <div className="card-header"><AlertTriangle size={20} className="text-orange" /> <h3>Bajo Stock</h3></div>
          {negocio?.umbralStock === null ? (
            <p className="texto-vacio">No hay umbral configurado.</p>
          ) : resumen.bajoStock && resumen.bajoStock.length > 0 ? (
            <ul className="lista-simple">
              {resumen.bajoStock.map((p) => (
                <li key={p.id} className="stock-alert-item">
                  <div className="stock-info">
                    <strong>{p.nombre}</strong>
                    <small>{p.marca}</small>
                  </div>
                  <span className="stock-badge">{p.cantidadStock} en stock</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state-success">
              <CheckCircle size={32} />
              <p>Inventario saludable</p>
            </div>
          )}
        </div>

        {/* MURO DE NOTAS */}
        <div className="card list-card">
          <div className="card-header"><MessageSquare size={20} /> <h3>Muro de Equipo</h3></div>
          <div className="nota-input compact">
            <input
              type="text"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Escribir mensaje..."
              onKeyDown={(e) => e.key === 'Enter' && agregarNota()}
            />
            <button className="btn-primario" onClick={agregarNota}>Enviar</button>
          </div>
          <ul className="lista-notas compact-notas">
            {notas.slice(0, 4).map((n) => (
              <li key={n.id}>
                <div className="nota-header">
                  <small><strong>{n.usuario}</strong></small>
                  <button className="btn-eliminar-nota" onClick={() => eliminarNota(n.id)}>✕</button>
                </div>
                <span>{n.contenido}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 5. AUDITORÍA Y AJUSTES */}
      <div className="bottom-grid">
        <div className="card auditoria-card">
          <div className="card-header"><ShieldAlert size={20} /> <h3>Auditoría Reciente</h3></div>
          {resumen.auditoria && resumen.auditoria.length > 0 ? (
            <div className="table-responsive">
              <table className="table-compras clean-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Usuario</th>
                    <th>Acción</th>
                    <th>Detalles</th>
                  </tr>
                </thead>
                <tbody>
                  {resumen.auditoria.slice(0, 5).map((registro) => (
                    <tr key={registro.id}>
                      <td className="text-muted">{parseFecha(registro.fechaHora).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                      <td>{registro.usuario}</td>
                      <td><span className={`badge ${getBadgeClass(registro.accion)}`}>{registro.accion}</span></td>
                      <td className="text-muted">{registro.detalles}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="texto-vacio">No hay registros de auditoría.</p>
          )}
        </div>

        {negocio && (
          <div className="card negocio-card">
            <div className="card-header"><Store size={20} /> <h3>Mi Negocio</h3></div>
            <div className="negocio-detalles-clean">
              <div className="detalle-row"><span>Nombre:</span> <strong>{negocio.nombre}</strong></div>
              <div className="detalle-row"><span>Rubro:</span> <strong>{negocio.rubro}</strong></div>
              <div className="detalle-row"><span>Ubicación:</span> <strong>{negocio.ubicacion}</strong></div>
              <div className="detalle-row"><span>Alerta Stock:</span> <strong>{negocio.umbralStock ?? "Inactivo"}</strong></div>
            </div>
            <button className="btn-secundario w-100 mt-15" onClick={() => setMostrarModal(true)}>
              <Settings size={16} /> Configurar Parámetros
            </button>
          </div>
        )}
      </div>

      {/* MODAL EDITAR NEGOCIO (Igual que antes) */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-negocio">
            <div className="modal-header"><h3>Configuración del Negocio</h3></div>
            <form onSubmit={(e) => { e.preventDefault(); guardarCambiosNegocio(Object.fromEntries(new FormData(e.target))); }}>
              <div className="modal-body">
                {["nombre", "rubro", "ubicacion", "umbralStock"].map((campo) => (
                  <div key={campo} className="form-group">
                    <label>{campo === "umbralStock" ? "Notificar cuando el stock baje de:" : campo.charAt(0).toUpperCase() + campo.slice(1)}</label>
                    <input name={campo} type={campo === "umbralStock" ? "number" : "text"} defaultValue={negocio[campo] ?? ""} placeholder={campo === "umbralStock" ? "Ej: 10" : ""} />
                  </div>
                ))}
                <hr style={{ margin: '15px 0', borderColor: '#e2e8f0' }} />
                <h4 style={{ marginBottom: '15px', color: '#0f172a' }}>Comprobantes de Venta</h4>
                <div className="form-group">
                  <label>Mensaje de Cabecera</label>
                  <input name="ticketCabecera" type="text" defaultValue={negocio.ticketCabecera ?? "¡Gracias por su compra!"} placeholder="Ej: Ferretería El Sol" />
                </div>
                <div className="form-group">
                  <label>Mensaje de Pie de página</label>
                  <input name="ticketPie" type="text" defaultValue={negocio.ticketPie ?? "Vuelva pronto"} placeholder="Ej: ¡Los esperamos la próxima!" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancelar" onClick={() => setMostrarModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primario">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;