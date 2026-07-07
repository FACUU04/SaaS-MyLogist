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
    diasPrueba: 30, 
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
        diasPrueba: Number(form.diasPrueba), 
        adminUsername: form.adminUsername,
        adminPassword: form.adminPassword,
      });

      setSuccess("El registro del negocio y su administrador se ha completado con éxito.");
      
      setForm({
        nombre: "", contactoEmail: "", telefono: "",
        fundacion: "", adminUsername: "", adminPassword: "", diasPrueba: 30
      });

      setTimeout(() => setSuccess(""), 5000);

    } catch (err) {
      setError(err.message || "Ocurrió un error al intentar procesar el registro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sa-view">
      <div className="sa-view-header">
        <h1>Nuevo Registro</h1>
        <p>Ingresa los datos para dar de alta un nuevo cliente en MyLogist.</p>
      </div>

      {error && <div className="sa-alert sa-alert-error">{error}</div>}
      {success && <div className="sa-alert sa-alert-success">{success}</div>}

      <div className="sa-form-container">
        <form onSubmit={handleSubmit}>
          <div className="sa-form-grid">
            
            {/* COLUMNA 1: Datos del Negocio */}
            <div>
              <h3 className="sa-form-section-title">Datos Comerciales</h3>

              <div className="sa-form-group">
                <label>Razón Social / Nombre del Negocio</label>
                <input className="sa-input" name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Ej. Distribuidora Central" />
              </div>

              <div className="sa-form-group">
                <label>Correo Electrónico de Contacto</label>
                <input className="sa-input" type="email" name="contactoEmail" value={form.contactoEmail} onChange={handleChange} required placeholder="contacto@empresa.com" />
              </div>

              <div className="sa-form-group">
                <label>Teléfono Comercial</label>
                <input className="sa-input" name="telefono" value={form.telefono} onChange={handleChange} required placeholder="+54 11 0000-0000" />
              </div>

              <div className="sa-form-group">
                <label>Fecha de Inicio de Actividades</label>
                <input className="sa-input" type="date" name="fundacion" value={form.fundacion} onChange={handleChange} required />
              </div>
            </div>

            {/* COLUMNA 2: Datos del Admin y Suscripción */}
            <div>
              <h3 className="sa-form-section-title">Credenciales de Acceso</h3>

              <div className="sa-form-group">
                <label>Nombre de Usuario</label>
                <input className="sa-input" name="adminUsername" value={form.adminUsername} onChange={handleChange} required placeholder="Ej. admin_empresa" />
              </div>

              <div className="sa-form-group">
                <label>Contraseña Temporal</label>
                <input className="sa-input" type="password" name="adminPassword" value={form.adminPassword} onChange={handleChange} required placeholder="••••••••" />
              </div>
              
              <h3 className="sa-form-section-title" style={{ marginTop: '2rem' }}>Suscripción SaaS</h3>
              <div className="sa-form-group">
                <label>Días de Período de Prueba</label>
                <input className="sa-input" type="number" min="1" name="diasPrueba" value={form.diasPrueba} onChange={handleChange} required />
              </div>
              
              <div className="sa-card" style={{ padding: '1rem', marginTop: '1.5rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--sa-text-muted)', lineHeight: '1.5', margin: 0 }}>
                  <strong>Nota:</strong> Estas credenciales otorgan acceso total al panel. El cronómetro de {form.diasPrueba} días de prueba iniciará en el momento del alta.
                </p>
              </div>
            </div>

          </div>

          <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--sa-glass-border)', paddingTop: '1.5rem' }}>
            <button type="submit" className="btn-sa btn-primary" disabled={loading} style={{ minWidth: '200px' }}>
              {loading ? "Procesando Alta..." : "Registrar Cliente"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}