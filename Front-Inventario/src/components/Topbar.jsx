import "../styles/Dashboard.css";

export default function Topbar({ user }) {
  if (!user) return null; 

  return (
    <div className="topbar">
      <div className="user-info">
        Bienvenido, <strong>{user.username}</strong>
      </div>

      <button
        style={{
          marginLeft: "1rem",
          backgroundColor: "#f97316",
          color: "white",
          border: "none",
          borderRadius: "0.375rem",
          padding: "0.5rem 1rem",
          cursor: "pointer",
        }}
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

