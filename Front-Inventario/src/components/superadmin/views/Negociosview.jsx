import { useEffect, useState } from "react";
import {
  getNegociosSuperAdmin,
  toggleNegocio,
  deleteNegocioSuperAdmin,
} from "../../../components/utils/api";

export default function ListNegocio() {
  const [negocios, setNegocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, negocio: null });
  const [confirmText, setConfirmText] = useState("");
  const [successMsg, setSuccessMsg] = useState(""); // 🔥 NUEVO: Estado para el mensaje

  const loadNegocios = async () => {
    try {
      setLoading(true);
      const data = await getNegociosSuperAdmin();
      setNegocios(data);
    } catch (err) {
      setError(err.message || "Error al cargar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNegocios(); }, []);

  const handleToggle = async (id) => {
    try {
      await toggleNegocio(id);
      loadNegocios();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteNegocioSuperAdmin(deleteModal.negocio.id);
      setDeleteModal({ isOpen: false, negocio: null });
      
      // 🔥 NUEVO: Mostramos el cartel y lo borramos a los 3 segundos
      setSuccessMsg(`¡El negocio ${deleteModal.negocio.nombre} fue eliminado por completo!`);
      setTimeout(() => setSuccessMsg(""), 3000);
      
      loadNegocios();
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="sa-view"><p>Cargando negocios...</p></div>;

  return (
    <div className="sa-view">
      <h1>Negocios</h1>
      <p>Administración central de clientes de MyLogist</p>

      {/* 🔥 NUEVO: Cartel de éxito */}
      {successMsg && (
        <div style={{ background: '#dcfce7', color: '#166534', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontWeight: '500', border: '1px solid #bbf7d0' }}>
          ✅ {successMsg}
        </div>
      )}

      <div className="sa-table-container">
        <table className="sa-table">
          <thead>
            <tr>
              <th>Negocio</th>
              <th>Contacto</th>
              <th>Admin</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {negocios.map((n) => (
              <tr key={n.id}>
                <td data-label="Negocio"><strong>{n.nombre}</strong></td>
                <td data-label="Contacto">{n.contactoEmail}<br/><small>{n.telefono}</small></td>
                <td data-label="Admin">{n.adminUsername}</td>
                <td data-label="Estado">
                  <span className={`sa-badge ${n.activo ? "activo" : "suspendido"}`}>
                    {n.activo ? "Activo" : "Suspendido"}
                  </span>
                </td>
                <td data-label="Acciones">
                  <button className="btn-sa btn-ghost-danger" onClick={() => {
                    setDeleteModal({ isOpen: true, negocio: n });
                    setConfirmText("");
                  }}>
                    Eliminar
                  </button>
                  <button className="btn-sa btn-primary" onClick={() => handleToggle(n.id)}>
                    {n.activo ? "Suspender" : "Activar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteModal.isOpen && (
        <div className="sa-modal-overlay">
          <div className="sa-modal">
            <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>⚠️ ¿Eliminar Negocio?</h2>
            <p style={{ background: '#fee2e2', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1rem', color: '#991b1b' }}>
              Esta acción borrará definitivamente el negocio <strong>{deleteModal.negocio.nombre}</strong>, sus ventas, productos y usuarios.
            </p>
            <p>Escribe el nombre del negocio para confirmar:</p>
            <input 
              className="sa-input" 
              style={{ marginTop: '0.5rem' }}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={deleteModal.negocio.nombre}
            />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button className="btn-sa" style={{ background: '#f1f5f9', color: '#475569' }} onClick={() => setDeleteModal({ isOpen: false, negocio: null })}>Cancelar</button>
              <button 
                className="btn-sa btn-danger" 
                disabled={confirmText.toLowerCase() !== deleteModal.negocio.nombre.toLowerCase()}
                onClick={handleConfirmDelete}
              >
                Confirmar Borrado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}