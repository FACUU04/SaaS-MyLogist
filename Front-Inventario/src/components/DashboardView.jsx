import React, { useEffect, useState } from "react";
import { getNegocio, updateNegocio, getNotas, createNota, deleteNota, getDashboardResumen } from "../components/utils/api";
import { ToastContainer, toast } from "react-toastify";
import HistorialVentas from "../components/UI/HistorialVentas"; 
import BalanceGrafico from "../components/UI/BalanceGrafico"; 
import { 
  Sparkles, Package, Users, Briefcase, BadgeDollarSign, TrendingUp, 
  AlertTriangle, Activity, Settings, MessageSquare, CheckCircle, Store, ShieldAlert, X,
  Bot, Mail, Smartphone, Calendar, Power
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

  // Estado local para manejar el formulario del modal de forma dinámica
  const [formNegocio, setFormNegocio] = useState({});

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
          ticketPie: negocioData?.ticket_pie ?? "",
          // Mapeamos los nuevos campos de la IA (desde snake_case)
          reporteIaActivo: negocioData?.reporte_ia_activo ?? false,
          reporteIaFrecuencia: negocioData?.reporte_ia_frecuencia ?? "SEMANAL",
          reporteIaCanal: negocioData?.reporte_ia_canal ?? "EMAIL",
          reporteIaDestino: negocioData?.reporte_ia_destino ?? ""
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

  // Función para abrir el modal y cargar los datos actuales al formulario temporal
  const abrirModal = () => {
    setFormNegocio({
      nombre: negocio.nombre || "",
      rubro: negocio.rubro || "",
      ubicacion: negocio.ubicacion || "",
      umbralStock: negocio.umbralStock || "",
      ticketCabecera: negocio.ticketCabecera || "",
      ticketPie: negocio.ticketPie || "",
      reporteIaActivo: negocio.reporteIaActivo || false,
      reporteIaFrecuencia: negocio.reporteIaFrecuencia || "SEMANAL",
      reporteIaCanal: negocio.reporteIaCanal || "EMAIL",
      reporteIaDestino: negocio.reporteIaDestino || ""
    });
    setMostrarModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormNegocio(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const guardarCambiosNegocio = async (e) => {
    e.preventDefault();
    try {
      if (!formNegocio.nombre || !formNegocio.rubro) {
        return toast.warn("Completá los campos obligatorios.");
      }
      
      // Armamos el payload con los nombres de columnas que espera Java
      const payload = {
        id: negocio.id,
        nombre: formNegocio.nombre,
        rubro: formNegocio.rubro,
        ubicacion: formNegocio.ubicacion,
        umbral_stock: formNegocio.umbralStock === "" ? null : Number(formNegocio.umbralStock),
        ticket_cabecera: formNegocio.ticketCabecera, 
        ticket_pie: formNegocio.ticketPie,
        // Agregamos los campos IA
        reporte_ia_activo: formNegocio.reporteIaActivo,
        reporte_ia_frecuencia: formNegocio.reporteIaFrecuencia,
        reporte_ia_canal: formNegocio.reporteIaCanal,
        reporte_ia_destino: formNegocio.reporteIaDestino
      };

      const actualizado = await updateNegocio(payload);
      
      // Actualizamos el estado principal del negocio
      setNegocio({
        ...actualizado,
        umbralStock: actualizado?.umbral_stock ?? null,
        ticketCabecera: actualizado?.ticket_cabecera ?? "",
        ticketPie: actualizado?.ticket_pie ?? "",
        reporteIaActivo: actualizado?.reporte_ia_activo ?? false,
        reporteIaFrecuencia: actualizado?.reporte_ia_frecuencia ?? "SEMANAL",
        reporteIaCanal: actualizado?.reporte_ia_canal ?? "EMAIL",
        reporteIaDestino: actualizado?.reporte_ia_destino ?? ""
      });
      
      setMostrarModal(false);
      toast.success("Configuración actualizada correctamente.");
    } catch (err) {
      toast.error("Error al actualizar la configuración.");
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
                  <button className="btn-eliminar-nota" onClick={() => eliminarNota(n.id)}>
                    <X size={16} />
                  </button>
                </div>
                <span className="nota-contenido">{n.contenido}</span>
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
              <div className="detalle-row">
                <span>IA Automática:</span> 
                <strong style={{ color: negocio.reporteIaActivo ? '#16a34a' : '#ef4444' }}>
                  {negocio.reporteIaActivo ? `Activa (${negocio.reporteIaFrecuencia})` : "Apagada"}
                </strong>
              </div>
            </div>
            <button className="btn-secundario w-100 mt-15" onClick={abrirModal}>
              <Settings size={16} /> Configurar Parámetros
            </button>
          </div>
        )}
      </div>

      {/* MODAL CONFIGURACIÓN GENERAL E IA */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-negocio" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header" style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10, paddingBottom: '1rem' }}>
              <h3>Configuración del Negocio</h3>
              <button className="btn-eliminar-nota" onClick={() => setMostrarModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={guardarCambiosNegocio}>
              <div className="modal-body" style={{ paddingTop: '1rem' }}>
                
                {/* 1. Datos del Negocio */}
                <h4 style={{ marginBottom: '15px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Store size={18} className="text-slate-500" /> Información General
                </h4>
                {["nombre", "rubro", "ubicacion"].map((campo) => (
                  <div key={campo} className="form-group">
                    <label>{campo.charAt(0).toUpperCase() + campo.slice(1)}</label>
                    <input name={campo} type="text" value={formNegocio[campo]} onChange={handleFormChange} required={campo !== "ubicacion"} />
                  </div>
                ))}
                
                <div className="form-group">
                  <label>Notificar cuando el stock baje de: (Opcional)</label>
                  <input name="umbralStock" type="number" value={formNegocio.umbralStock} onChange={handleFormChange} placeholder="Ej: 10" />
                </div>

                <hr style={{ margin: '25px 0', borderColor: '#e2e8f0' }} />

                {/* 2. Tickets */}
                <h4 style={{ marginBottom: '15px', color: '#0f172a' }}>Comprobantes de Venta</h4>
                <div className="form-group">
                  <label>Mensaje de Cabecera</label>
                  <input name="ticketCabecera" type="text" value={formNegocio.ticketCabecera} onChange={handleFormChange} placeholder="Ej: Ferretería El Sol" />
                </div>
                <div className="form-group">
                  <label>Mensaje de Pie de página</label>
                  <input name="ticketPie" type="text" value={formNegocio.ticketPie} onChange={handleFormChange} placeholder="Ej: ¡Los esperamos la próxima!" />
                </div>

                <hr style={{ margin: '25px 0', borderColor: '#e2e8f0' }} />

                {/* 3. Configuración de Inteligencia Artificial */}
                <div className="seccion-header" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bot size={20} color="#0284c7" />
                  <h4 style={{ color: '#0f172a', margin: 0 }}>Reportes Inteligentes (IA)</h4>
                </div>

                <div className="form-group">
                  <label className="checkbox-label-premium" style={{ border: formNegocio.reporteIaActivo ? '1px solid #3b82f6' : '1px solid #cbd5e1', backgroundColor: formNegocio.reporteIaActivo ? '#eff6ff' : '#ffffff', padding: '1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <input 
                      type="checkbox" 
                      name="reporteIaActivo" 
                      checked={formNegocio.reporteIaActivo} 
                      onChange={handleFormChange} 
                      style={{ width: '1.2rem', height: '1.2rem', marginTop: '0.2rem' }}
                    />
                    <div className="checkbox-content" style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ color: formNegocio.reporteIaActivo ? '#1d4ed8' : '#475569', fontSize: '0.95rem' }}>
                        {formNegocio.reporteIaActivo ? "Asistente IA Activado" : "Asistente IA Desactivado"}
                      </strong>
                      <span style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        Genera resúmenes gerenciales automáticos sobre tus ventas e inventario.
                      </span>
                    </div>
                  </label>
                </div>

                {formNegocio.reporteIaActivo && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', animation: 'fadeIn 0.3s ease-out', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.85rem' }}>Frecuencia del Reporte</label>
                      <div className="input-icon-wrapper" style={{ position: 'relative' }}>
                        <Calendar size={16} className="text-slate-500" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                        <select 
                          name="reporteIaFrecuencia" 
                          value={formNegocio.reporteIaFrecuencia} 
                          onChange={handleFormChange}
                          style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.2rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        >
                          <option value="DIARIO">Diario (Al cierre de caja)</option>
                          <option value="SEMANAL">Semanal (Lunes a las 08:00 AM)</option>
                          <option value="QUINCENAL">Quincenal (Días 1 y 15)</option>
                          <option value="MENSUAL">Mensual (Día 1 del mes)</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.85rem' }}>Canal de Envío</label>
                      <div className="input-icon-wrapper" style={{ position: 'relative' }}>
                        <Power size={16} className="text-slate-500" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                        <select 
                          name="reporteIaCanal" 
                          value={formNegocio.reporteIaCanal} 
                          onChange={handleFormChange}
                          style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.2rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        >
                          <option value="EMAIL">Correo Electrónico</option>
                          <option value="SISTEMA">Solo Notificaciones en el Sistema</option>
                        </select>
                      </div>
                    </div>

                    {formNegocio.reporteIaCanal !== "SISTEMA" && (
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.85rem' }}>Email de Destino</label>
                        <div className="input-icon-wrapper" style={{ position: 'relative' }}>
                          <Mail size={16} className="text-slate-500" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                          <input 
                            type="email" 
                            name="reporteIaDestino" 
                            placeholder="correo@ejemplo.com" 
                            value={formNegocio.reporteIaDestino} 
                            onChange={handleFormChange}
                            required
                            style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.2rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="modal-footer" style={{ position: 'sticky', bottom: 0, backgroundColor: 'white', borderTop: '1px solid #e2e8f0', padding: '1rem 0' }}>
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