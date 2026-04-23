import { useEffect, useState } from "react";
import {
  getNegociosSuperAdmin,
  toggleNegocio,
  deleteNegocioSuperAdmin,
} from "../../../components/utils/api";
import "../../../styles/modules/DashboardSuperAdmin.css";

export default function ListNegocio() {
  const [negocios, setNegocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNegocios = async () => {
    try {
      setLoading(true);
      const data = await getNegociosSuperAdmin();
      setNegocios(data);
    } catch (err) {
      setError(err.message || "Error al cargar negocios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNegocios();
  }, []);

  const handleToggle = async (id) => {
    try {
      await toggleNegocio(id);
      loadNegocios();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    const ok = confirm("¿Eliminar negocio definitivamente?");
    if (!ok) return;

    try {
      await deleteNegocioSuperAdmin(id);
      loadNegocios();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p style={{ padding: 16 }}>Cargando...</p>;
  if (error) return <p style={{ padding: 16 }}>{error}</p>;

  return (
    <div className="sa-view">
      <div className="sa-list">
        <h1>Negocios</h1>

        {/* ================= DESKTOP ================= */}
        <div className="sa-table-wrapper">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Negocio</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Admin</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {negocios.map((n) => (
                <tr key={n.id}>
                  <td>{n.nombre}</td>
                  <td>{n.contactoEmail || "-"}</td>
                  <td>{n.telefono || "-"}</td>
                  <td>{n.adminUsername || "-"}</td>
                  <td>
                    <span
                      className={`sa-badge ${
                        n.activo ? "activo" : "suspendido"
                      }`}
                    >
                      {n.activo ? "activo" : "suspendido"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="sa-link warning"
                      onClick={() => handleToggle(n.id)}
                    >
                      {n.activo ? "Suspender" : "Activar"}
                    </button>

                    <button
                      className="sa-link"
                      style={{ color: "#dc2626" }}
                      onClick={() => handleDelete(n.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= MOBILE ================= */}
        <div className="sa-cards-mobile">
          {negocios.map((n) => (
            <div className="sa-card-mobile" key={n.id}>
              <strong>{n.nombre}</strong>
              <span>Email: {n.contactoEmail || "-"}</span>
              <span>Tel: {n.telefono || "-"}</span>
              <span>Admin: {n.adminUsername || "-"}</span>

              <span
                className={`sa-badge ${
                  n.activo ? "activo" : "suspendido"
                }`}
              >
                {n.activo ? "activo" : "suspendido"}
              </span>

              <div className="sa-card-actions">
                <button
                  className="warning"
                  onClick={() => handleToggle(n.id)}
                >
                  {n.activo ? "Suspender" : "Activar"}
                </button>

                <button
                  onClick={() => handleDelete(n.id)}
                  style={{
                    background: "#fee2e2",
                    color: "#991b1b",
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
