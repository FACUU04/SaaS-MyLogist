import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./Topbar";
import DashboardContent from "./DashboardContent";
import { hasRole, hasPermission } from "./utils/auth"; 
import { getMisAvisos } from "../components/utils/api"; // Importamos la nueva función
import "../styles/Dashboard.css";
import "../styles/modules/HomeModule.css";

// --- NUEVO COMPONENTE: BANNER DE AVISOS ---
const BannerNotificaciones = () => {
  const [avisos, setAvisos] = useState([]);

  useEffect(() => {
    const cargarAvisos = async () => {
      try {
        const data = await getMisAvisos();
        if (Array.isArray(data)) {
          setAvisos(data);
        }
      } catch (err) {
        console.error("Error al cargar avisos del cliente:", err);
      }
    };
    cargarAvisos();
  }, []);

  if (avisos.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
      {avisos.map((aviso) => {
        // Asignamos colores según el nivel de alerta
        let bgColor, textColor, borderColor, iconPath;
        
        switch (aviso.nivelAlerta) {
          case 'DANGER':
            bgColor = '#fef2f2'; textColor = '#991b1b'; borderColor = '#f87171';
            iconPath = "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z";
            break;
          case 'WARNING':
            bgColor = '#fefce8'; textColor = '#854d0e'; borderColor = '#facc15';
            iconPath = "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"; // Mismo icono de alerta
            break;
          default: // INFO
            bgColor = '#eff6ff'; textColor = '#1e40af'; borderColor = '#60a5fa';
            iconPath = "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
            break;
        }

        return (
          <div key={aviso.id} style={{ 
            background: bgColor, color: textColor, border: `1px solid ${borderColor}`,
            padding: '0.75rem 1rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.75rem',
            fontSize: '0.95rem', fontWeight: '500', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <svg style={{ flexShrink: 0 }} width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d={iconPath}></path>
            </svg>
            <span style={{ flex: 1, lineHeight: '1.4' }}>{aviso.mensaje}</span>
          </div>
        );
      })}
    </div>
  );
};
// --- FIN NUEVO COMPONENTE ---


export default function Dashboard({ user, onLogout }) {
  
  const getVistaInicial = () => {
    if (hasRole(user, "ROLE_ADMIN")) return "dashboard";
    if (hasPermission(user, "permisoVentas")) return "ventas";
    if (hasPermission(user, "permisoInventario")) return "inventario";
    if (hasPermission(user, "permisoProveedores")) return "proveedores";
    return ""; 
  };

  const [selected, setSelected] = useState(getVistaInicial());

  if (!user) return null; 

  return (
    <div className="dashboard-container">
      <Sidebar selected={selected} setSelected={setSelected} />

      <div className="main-content">
        <TopBar user={user} onLogout={onLogout} />
        
        {/* Contenedor extra para agregar padding y el banner arriba de las vistas */}
        <div style={{ padding: '20px' }}>
          
          {/* El Banner se renderiza acá arriba, visible en cualquier vista que elija el cliente */}
          <BannerNotificaciones />
          
          <DashboardContent selected={selected} user={user} onLogout={onLogout} />
        </div>
      </div>
    </div>
  );
}