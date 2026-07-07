import "../styles/Dashboard.css";

export default function Topbar({ user }) {
  if (!user) return null; 

  return (
    <div className="topbar">
      <div className="user-info">
        Hola, <strong>{user.username}</strong>
      </div>

      <button
        className="topbar-logout-btn"
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }}
      >
        Cerrar Sesión
      </button>
    </div>
  );
}