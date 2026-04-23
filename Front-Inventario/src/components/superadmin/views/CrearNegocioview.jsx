import { useState } from "react";
import { createNegocioSuperAdmin } from "../../../components/utils/api";
import "../../../styles/modules/DashboardSuperAdmin.css";
import { v4 as uuidv4 } from 'uuid';

export default function CrearNegocio() {
  const [form, setForm] = useState({
    nombre: "",
    contactoEmail: "",
    telefono: "",
    fundacion: "",
    adminUsername: "",
    adminPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setLoading(true);

      await createNegocioSuperAdmin({
        nombre: form.nombre,
        contactoEmail: form.contactoEmail,
        telefono: form.telefono,
        fundacion: form.fundacion,
        rubro: "General",
        nroNegocio: uuidv4().slice(0, 8),
        umbralStock: 10,
        activo: true,

        adminUsername: form.adminUsername,
        adminPassword: form.adminPassword,
      });

      setSuccess("Negocio creado correctamente");
      setForm({
        nombre: "",
        contactoEmail: "",
        telefono: "",
        fundacion: "",
        adminUsername: "",
        adminPassword: "",
      });
    } catch (err) {
      setError(err.message || "Error al crear negocio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sa-view">
      <div className="sa-create">
        <h1>Crear negocio</h1>
        <p>Alta de nuevo cliente en MyLogist</p>

        <form className="sa-form" onSubmit={handleSubmit}>
          <div className="sa-form-section">
            <h3>Datos del negocio</h3>

            <label>
              Nombre del negocio
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Email de contacto
              <input
                type="email"
                name="contactoEmail"
                value={form.contactoEmail}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Teléfono
              <input
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Fecha de inicio
              <input
                type="date"
                name="fundacion"
                value={form.fundacion}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div className="sa-form-section">
            <h3>Administrador inicial</h3>

            <label>
              Usuario
              <input
                name="adminUsername"
                value={form.adminUsername}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Contraseña
              <input
                type="password"
                name="adminPassword"
                value={form.adminPassword}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}
          {success && <p style={{ color: "green" }}>{success}</p>}

          <div className="sa-form-actions">
            <button type="submit" className="sa-primary" disabled={loading}>
              {loading ? "Creando..." : "Crear negocio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
