import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./Topbar";
import DashboardContent from "./DashboardContent";
import { hasRole, hasPermission } from "./utils/auth"; 
import "../styles/Dashboard.css";
import "../styles/modules/HomeModule.css";

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
        
       
        <DashboardContent selected={selected} user={user} onLogout={onLogout} />
      </div>
    </div>
  );
}