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
    if (view === "create") return <CrearNegocio />;
    if (view === "list") return <ListNegocio />;

    // DASHBOARD
    return (
      <div className="sa-dashboard">
        <h1>SuperAdmin</h1>
        <p>Gestión de negocios</p>

        <div className="sa-actions">
          <button
            className="sa-primary"
            onClick={() => setView("create")}
          >
            ➕ Crear negocio
          </button>

          <button
            className="sa-secondary"
            onClick={() => setView("list")}
          >
            📋 Ver negocios
          </button>
        </div>
      </div>
    );
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
