import { useState, useEffect } from "react";
import SuperAdminSidebar from "../components/superadmin/SuperAdminSidebar";
import SuperAdminTopbar from "../components/superadmin/SuperAdminTopBar";
import CrearNegocio from "../components/superadmin/views/CrearNegocioview";
import ListNegocio from "../components/superadmin/views/Negociosview";
import NotificacionesView from "../components/superadmin/views/NotificacionesView"; // <-- IMPORT NUEVO
import { getSADashboardStats, getSystemMetrics, getAvisosSA } from "../components/utils/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import "../styles/modules/DashboardSuperAdmin.css";

export default function DashboardSuperAdmin() {
  const [view, setView] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  
  const [stats, setStats] = useState({ totalActivos: 0, totalPrueba: 0, proximosVencimientos: [] });
  const [sysMetrics, setSysMetrics] = useState({ cpuUsagePercent: 0, ramUsagePercent: 0, totalRamGb: 0 });
  const [historialMetrics, setHistorialMetrics] = useState([]); 
  const [avisoGlobal, setAvisoGlobal] = useState(null); // <-- ESTADO PARA EL AVISO

  useEffect(() => {
    if (view !== "dashboard") return;

    const cargarStats = async () => {
      try {
        const [statsData, avisosData] = await Promise.all([
          getSADashboardStats(),
          getAvisosSA()
        ]);
        setStats(statsData);
        
        // Buscamos si hay algún aviso global (negocio = null) que esté activo
        const avisoActivo = avisosData.find(a => a.activa && !a.negocio);
        setAvisoGlobal(avisoActivo || null);

      } catch (err) {
        console.error("Error cargando stats:", err);
      }
    };

    const cargarSystemMetrics = async () => {
      try {
        const metricsData = await getSystemMetrics();
        setSysMetrics(metricsData);
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setHistorialMetrics(prev => {
          const nuevoRegistro = { time: timestamp, cpu: metricsData.cpuUsagePercent, ram: metricsData.ramUsagePercent };
          return [...prev, nuevoRegistro].slice(-10);
        });
      } catch (err) {
        console.error("Error leyendo sistema:", err);
      }
    };

    cargarStats();
    cargarSystemMetrics();

    const intervalId = setInterval(cargarSystemMetrics, 5000);
    return () => clearInterval(intervalId);

  }, [view]);

  const renderView = () => {
    switch(view) {
      case "create": return <CrearNegocio />;
      case "list": return <ListNegocio />;
      case "notificaciones": return <NotificacionesView />; // <-- RUTA NUEVA
      default: return (
        <div className="sa-view">
          <div className="sa-view-header">
            <h1>Resumen del Sistema</h1>
            <p>Monitoreo general de la plataforma MyLogist y salud del servidor.</p>
          </div>

          {/* RECUADRO DE AVISO GLOBAL ACTIVO */}
          {avisoGlobal && (
            <div style={{ background: '#fef3c7', borderLeft: '4px solid #f59e0b', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <div>
                <strong style={{ color: '#92400e', display: 'block', fontSize: '0.9rem' }}>Los clientes están viendo este aviso:</strong>
                <span style={{ color: '#b45309', fontSize: '0.95rem' }}>{avisoGlobal.mensaje}</span>
              </div>
              <button className="btn-sa" style={{ marginLeft: 'auto', background: '#fff', border: '1px solid #fcd34d', fontSize: '0.8rem' }} onClick={() => setView("notificaciones")}>
                Gestionar
              </button>
            </div>
          )}

          {/* PRIMERA FILA: KPIs COMERCIALES */}
          <div className="sa-metrics-grid">
            <div className="sa-metric-card" style={{ borderLeft: '4px solid #16a34a' }}>
              <span className="sa-metric-title">Clientes Activos</span>
              <span className="sa-metric-value">{stats.totalActivos}</span>
            </div>
            <div className="sa-metric-card" style={{ borderLeft: '4px solid #f59e0b' }}>
              <span className="sa-metric-title">En Período de Prueba</span>
              <span className="sa-metric-value">{stats.totalPrueba}</span>
            </div>
            <div className="sa-metric-card" style={{ borderLeft: '4px solid #2563eb' }}>
              <span className="sa-metric-title">Acceso Rápido</span>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <button className="btn-sa btn-primary" onClick={() => setView("list")} style={{ padding: '0.5rem', fontSize: '0.8rem', flex: '1 1 auto' }}>Directorio</button>
                <button className="btn-sa" onClick={() => setView("create")} style={{ padding: '0.5rem', fontSize: '0.8rem', flex: '1 1 auto', background: '#f1f5f9', color: '#1e293b' }}>Nuevo</button>
              </div>
            </div>
          </div>

          {/* SEGUNDA FILA: INFRAESTRUCTURA Y VENCIMIENTOS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1.5rem' }}>
            
            {/* GRÁFICO DEL SERVIDOR */}
            <div className="sa-card" style={{ padding: '1.5rem', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: '#1e293b' }}>Salud del Servidor (Tiempo Real)</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                <div><strong>CPU:</strong> <span style={{ color: sysMetrics.cpuUsagePercent > 80 ? '#dc2626' : '#2563eb' }}>{sysMetrics.cpuUsagePercent}%</span></div>
                <div><strong>RAM:</strong> <span style={{ color: sysMetrics.ramUsagePercent > 85 ? '#dc2626' : '#16a34a' }}>{sysMetrics.ramUsagePercent}%</span> (Total: {sysMetrics.totalRamGb} GB)</div>
              </div>
              
              <div style={{ width: '100%', height: 250, minHeight: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historialMetrics} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="cpu" stroke="#2563eb" strokeWidth={2} dot={false} name="CPU %" isAnimationActive={false} />
                    <Line type="monotone" dataKey="ram" stroke="#16a34a" strokeWidth={2} dot={false} name="RAM %" isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* TABLA DE VENCIMIENTOS */}
            <div className="sa-card" style={{ padding: '1.5rem', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: '#1e293b' }}>Próximos Vencimientos</h3>
              
              {stats.proximosVencimientos.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No hay cuentas en período de prueba actualmente.</p>
              ) : (
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '300px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                        <th style={{ padding: '0.5rem' }}>Negocio</th>
                        <th style={{ padding: '0.5rem' }}>Alta</th>
                        <th style={{ padding: '0.5rem' }}>Días</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.proximosVencimientos.slice(0, 5).map(n => (
                        <tr key={n.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '0.75rem 0.5rem', fontWeight: '500' }}>{n.nombre}</td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>{n.fechaAlta}</td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>{n.diasPrueba}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {stats.proximosVencimientos.length > 5 && (
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                      <button style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.85rem' }} onClick={() => setView("list")}>
                        Ver todos en el directorio
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      );
    }
  };

  return (
    <div className="sa-layout">
      <SuperAdminSidebar 
        view={view} 
        setView={setView} 
        menuOpen={menuOpen} 
        closeMenu={() => setMenuOpen(false)} 
      />
      <div className="sa-main">
        <SuperAdminTopbar toggleMenu={() => setMenuOpen(!menuOpen)} />
        {renderView()}
      </div>
    </div>
  );
}