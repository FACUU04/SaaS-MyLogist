import { useEffect, useState } from "react";
import { getAvisosSA, enviarAvisoSA, desactivarAvisoSA } from "../../../components/utils/api";

export default function NotificacionesView() {
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    mensaje: "",
    nivelAlerta: "INFO",
    negocioId: "", 
    diasExpiracion: ""
  });

  const loadAvisos = async () => {
    try {
      setLoading(true);
      const data = await getAvisosSA();
      const arrayAvisos = Array.isArray(data) ? data : [];
      setAvisos(arrayAvisos.sort((a, b) => b.id - a.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAvisos(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      await enviarAvisoSA({
        mensaje: form.mensaje,
        nivelAlerta: form.nivelAlerta,
        negocioId: form.negocioId ? Number(form.negocioId) : null,
        diasExpiracion: form.diasExpiracion ? Number(form.diasExpiracion) : null
      });
      
      setForm({ mensaje: "", nivelAlerta: "INFO", negocioId: "", diasExpiracion: "" });
      
      setSuccessMsg("¡Aviso despachado y activo en el sistema!");
      setTimeout(() => setSuccessMsg(""), 4000);
      
      loadAvisos(); 
    } catch (err) {
      setErrorMsg("Error al enviar: " + err.message);
      setTimeout(() => setErrorMsg(""), 5000);
    }
  };

  const handleDesactivar = async (id) => {
    try {
      await desactivarAvisoSA(id);
      setSuccessMsg("Aviso apagado correctamente.");
      setTimeout(() => setSuccessMsg(""), 3000);
      loadAvisos();
    } catch (err) {
      alert("Error al desactivar: " + err.message);
    }
  };

  return (
    <div className="sa-view">
      <div className="sa-view-header">
        <h1>Centro de Notificaciones</h1>
        <p>Envía comunicados globales o alertas de facturación específicas.</p>
      </div>

      {successMsg && <div className="sa-alert sa-alert-success">{successMsg}</div>}
      {errorMsg && <div className="sa-alert sa-alert-error">{errorMsg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
        
        {/* PANEL PARA ENVIAR AVISO */}
        <div className="sa-card" style={{ padding: '1.5rem', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Redactar Nuevo Aviso</h3>
          <form onSubmit={handleSubmit}>
            <div className="sa-form-group">
              <label>Mensaje</label>
              <textarea className="sa-input" name="mensaje" value={form.mensaje} onChange={handleChange} required rows="3" placeholder="Ej. El servidor estará en mantenimiento..." />
            </div>

            <div className="sa-form-group">
              <label>Nivel de Alerta</label>
              <select className="sa-input" name="nivelAlerta" value={form.nivelAlerta} onChange={handleChange}>
                <option value="INFO">Informativo (Azul)</option>
                <option value="WARNING">Advertencia (Amarillo)</option>
                <option value="DANGER">Crítico / Cobro (Rojo)</option>
              </select>
            </div>

            <div className="sa-form-group">
              <label>ID del Cliente (Opcional)</label>
              <input className="sa-input" type="number" name="negocioId" value={form.negocioId} onChange={handleChange} placeholder="Dejar vacío para enviar a TODOS" />
            </div>

            <button type="submit" className="btn-sa btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Despachar Aviso</button>
          </form>
        </div>

        {/* HISTORIAL DE AVISOS */}
        <div className="sa-table-container">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Aviso</th>
                <th>Alcance</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {avisos.length > 0 ? avisos.map(a => (
                <tr key={a.id}>
                  <td>
                    <div style={{ fontWeight: '500', fontSize: '0.9rem', color: a.nivelAlerta === 'DANGER' ? '#f87171' : a.nivelAlerta === 'WARNING' ? '#fbbf24' : '#60a5fa' }}>
                      [{a.nivelAlerta}]
                    </div>
                    <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>{a.mensaje}</div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{a.negocio ? `Cliente #${a.negocio.id}` : '🌐 Global'}</td>
                  <td>
                    <span className={`sa-badge ${a.activa ? "activo" : "suspendido"}`}>
                      {a.activa ? "Activo" : "Apagado"}
                    </span>
                  </td>
                  <td>
                    {a.activa && (
                      <button className="btn-sa btn-ghost-danger" onClick={() => handleDesactivar(a.id)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                        Desactivar
                      </button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--sa-text-muted)' }}>
                    No hay avisos registrados en el sistema.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}