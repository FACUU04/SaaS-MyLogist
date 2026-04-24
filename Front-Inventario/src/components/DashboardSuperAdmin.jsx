import { useState } from "react";
import SuperAdminSidebar from "../components/superadmin/SuperAdminSidebar";
import SuperAdminTopbar from "../components/superadmin/SuperAdminTopBar";
import CrearNegocio from "../components/superadmin/views/CrearNegocioview";
import ListNegocio from "../components/superadmin/views/Negociosview";
import "../styles/modules/DashboardSuperAdmin.css";

export default function DashboardSuperAdmin() {
  const [view, setView] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  const renderView = () => {
    switch(view) {
      case "create": return <CrearNegocio />;
      case "list": return <ListNegocio />;
      default: return (
        <div className="sa-view">
          <h1>Resumen General</h1>
          <p>Bienvenido al centro de control de MyLogist.</p>
          <div className="sa-dashboard-grid">
            <div className="sa-action-card">
              <h3>Clientes Activos</h3>
              <p>Gestiona los negocios registrados actualmente.</p>
              <button className="btn-sa btn-primary" onClick={() => setView("list")}>Ver Listado</button>
            </div>
            <div className="sa-action-card">
              <h3>Nuevo Registro</h3>
              <p>Dar de alta un nuevo negocio y su administrador.</p>
              <button className="btn-sa btn-primary" onClick={() => setView("create")}>Crear Negocio</button>
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