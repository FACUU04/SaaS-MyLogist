export default function SuperAdminTopbar({ toggleMenu }) {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <header className="sa-topbar">
      <button className="sa-menu-btn" onClick={toggleMenu}>
        ☰
      </button>

      <span className="sa-topbar-title">SuperAdmin</span>

      <button
        onClick={handleLogout}
        style={{
          marginLeft: "auto",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#dc2626",
          fontSize: "0.9rem",
        }}
      >
        Cerrar sesión
      </button>
    </header>
  );
}
