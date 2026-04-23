export default function SuperAdminSidebar({
  view,
  setView,
  menuOpen,
  closeMenu,
}) {
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
      <h3 className="sa-logo">MyLogist</h3>

      <button
        className={view === "dashboard" ? "active" : ""}
        onClick={() => handleChangeView("dashboard")}
      >
        🏠 Dashboard
      </button>

      <button
        className={view === "create" ? "active" : ""}
        onClick={() => handleChangeView("create")}
      >
        ➕ Crear negocio
      </button>

      <button
        className={view === "list" ? "active" : ""}
        onClick={() => handleChangeView("list")}
      >
        📋 Ver negocios
      </button>

      {/* LOGOUT */}
      <button
        style={{ marginTop: "auto", color: "#fca5a5" }}
        onClick={handleLogout}
      >
        🚪 Cerrar sesión
      </button>
    </aside>
  );
}
