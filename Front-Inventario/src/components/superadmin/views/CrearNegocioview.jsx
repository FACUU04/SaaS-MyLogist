import { useState } from "react";
import { createNegocioSuperAdmin } from "../../../components/utils/api";
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

      setSuccess("¡Negocio y administrador creados correctamente!");
      
      // Limpiamos el formulario después de crear
      setForm({
        nombre: "", contactoEmail: "", telefono: "",
        fundacion: "", adminUsername: "", adminPassword: "",
      });

      // Borramos el cartel verde después de 4 segundos
      setTimeout(() => setSuccess(""), 4000);

    } catch (err) {
      setError(err.message || "Error al crear negocio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sa-view">
      <h1>Crear Negocio</h1>
      <p>Da de alta un nuevo cliente en la plataforma MyLogist.</p>

      {/* Alertas */}
      {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>❌ {error}</div>}
      {success && <div style={{ background: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>✅ {success}</div>}

      <form className="sa-card" onSubmit={handleSubmit}>
        <div className="sa-form-grid">
          
          {/* COLUMNA 1: Datos del Negocio */}
          <div>
            <h3 style={{ marginBottom: '1.2rem', color: '#2563eb', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              🏢 Datos del Negocio
            </h3>

            <div className="sa-form-group">
              <label>Nombre del negocio</label>
              <input className="sa-input" name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Ej. Ferretería San José" />
            </div>

            <div className="sa-form-group">
              <label>Email de contacto</label>
              <input className="sa-input" type="email" name="contactoEmail" value={form.contactoEmail} onChange={handleChange} required placeholder="contacto@empresa.com" />
            </div>

            <div className="sa-form-group">
              <label>Teléfono</label>
              <input className="sa-input" name="telefono" value={form.telefono} onChange={handleChange} required placeholder="+54 11 1234-5678" />
            </div>

            <div className="sa-form-group">
              <label>Fecha de inicio</label>
              <input className="sa-input" type="date" name="fundacion" value={form.fundacion} onChange={handleChange} required />
            </div>
          </div>

          {/* COLUMNA 2: Datos del Admin */}
          <div>
            <h3 style={{ marginBottom: '1.2rem', color: '#2563eb', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              👤 Administrador Inicial
            </h3>

            <div className="sa-form-group">
              <label>Usuario</label>
              <input className="sa-input" name="adminUsername" value={form.adminUsername} onChange={handleChange} required placeholder="Ej. admin_sanjose" />
            </div>

            <div className="sa-form-group">
              <label>Contraseña</label>
              <input className="sa-input" type="password" name="adminPassword" value={form.adminPassword} onChange={handleChange} required placeholder="••••••••" />
            </div>
            
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '1rem' }}>
              ℹ️ Estas son las credenciales que el cliente usará para ingresar por primera vez a su panel.
            </p>
          </div>

        </div>

        {/* BOTONERA */}
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
          <button type="submit" className="btn-sa btn-primary" disabled={loading} style={{ width: '100%', maxWidth: '250px' }}>
            {loading ? "Creando..." : "➕ Crear negocio y usuario"}
          </button>
        </div>

      </form>
    </div>
  );
}