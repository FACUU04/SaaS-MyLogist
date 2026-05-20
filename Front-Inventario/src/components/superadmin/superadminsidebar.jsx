export default function SuperAdminSidebar({ view, setView, menuOpen, closeMenu }) {
  const handleChangeView = (newView) => {
    setView(newView);
    if (closeMenu) closeMenu(); // cierra sidebar en mobile
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <aside className={`sa-sidebar ${menuOpen ? "open" : ""}`}>
      <h3 className="sa-logo">MyLogist.</h3>

      <div className="sa-nav">
        <button
          className={view === "dashboard" ? "active" : ""}
          onClick={() => handleChangeView("dashboard")}
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9"></rect>
            <rect x="14" y="3" width="7" height="5"></rect>
            <rect x="14" y="12" width="7" height="9"></rect>
            <rect x="3" y="16" width="7" height="5"></rect>
          </svg>
          Resumen
        </button>

        <button
          className={view === "list" ? "active" : ""}
          onClick={() => handleChangeView("list")}
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          Directorio
        </button>

        <button
          className={view === "create" ? "active" : ""}
          onClick={() => handleChangeView("create")}
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5c-2.2 0-4 1.8-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
          Nuevo Cliente
        </button>

        {/* NUEVO BOTÓN: NOTIFICACIONES */}
        <button
          className={view === "notificaciones" ? "active" : ""}
          onClick={() => handleChangeView("notificaciones")}
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          Notificaciones
        </button>
      </div>

      <button
        style={{ marginTop: "auto", color: "#fca5a5", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem 1rem", fontSize: "0.95rem", fontWeight: "500" }}
        onClick={handleLogout}
      >
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px" }}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        Cerrar Sesión
      </button>
    </aside>
  );
}