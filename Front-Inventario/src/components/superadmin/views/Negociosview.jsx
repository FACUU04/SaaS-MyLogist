import { useEffect, useState } from "react";
import {
  getNegociosSuperAdmin,
  toggleNegocio,
  deleteNegocioSuperAdmin,
  impersonateCliente
} from "../../../components/utils/api";

export default function ListNegocio() {
  const [negocios, setNegocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, negocio: null });
  const [confirmText, setConfirmText] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Estados para Paginación Real (Backend)
  const [currentPage, setCurrentPage] = useState(0); 
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const loadNegocios = async (pageIndex = 0) => {
    try {
      setLoading(true);
      const response = await getNegociosSuperAdmin(pageIndex, pageSize);
      
      setNegocios(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
      setCurrentPage(response.pageable?.pageNumber ?? pageIndex);
      
    } catch (err) {
      setError(err.message || "Error al cargar el directorio.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadNegocios(0); 
  }, []);

  const handleToggle = async (id) => {
    try {
      await toggleNegocio(id);
      loadNegocios(currentPage); 
    } catch (err) {
      alert(err.message);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteNegocioSuperAdmin(deleteModal.negocio.id);
      const nombreNegocio = deleteModal.negocio.nombre;
      setDeleteModal({ isOpen: false, negocio: null });
      
      setSuccessMsg(`El negocio ${nombreNegocio} fue eliminado del sistema.`);
      setTimeout(() => setSuccessMsg(""), 4000);
      
      if (negocios.length === 1 && currentPage > 0) {
        loadNegocios(currentPage - 1);
      } else {
        loadNegocios(currentPage);
      }
    } catch (err) { 
      alert(err.message); 
    }
  };

  const handleImpersonate = async (negocio) => {
    try {
      if (!window.confirm(`¿Estás seguro de iniciar sesión como el administrador de ${negocio.nombre}?`)) {
        return;
      }

      const data = await impersonateCliente(negocio.id);
      
      const superAdminToken = localStorage.getItem("token");
      localStorage.setItem("superAdminToken", superAdminToken);
      localStorage.setItem("token", data.token);

      window.location.href = "/";
      
    } catch (err) {
      alert("Error al intentar acceder a la cuenta: " + err.message);
    }
  };

  if (loading && negocios.length === 0) {
    return <div className="sa-view"><p>Cargando directorio de negocios...</p></div>;
  }

  // Generador de array para los números de página (ej: [0, 1, 2])
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i);

  return (
    <div className="sa-view">
      <div className="sa-view-header">
        <h1>Directorio de Clientes</h1>
        <p>Administración centralizada de negocios en la plataforma.</p>
      </div>

      {successMsg && <div className="sa-alert sa-alert-success">{successMsg}</div>}
      {error && <div className="sa-alert sa-alert-error">{error}</div>}

      <div className="sa-toolbar" style={{ justifyContent: 'flex-end' }}>
        <span className="sa-pagination-info">Total en sistema: <strong>{totalElements}</strong> negocios</span>
      </div>

      <div className="sa-table-container">
        <table className="sa-table">
          <thead>
            <tr>
              <th>Negocio</th>
              <th>Contacto</th>
              <th>Alta / Prueba</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {negocios.length > 0 ? (
              negocios.map((n) => (
                <tr key={n.id}>
                  {/* ACÁ AGREGAMOS EL ID VISIBLE */}
                  <td>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', marginBottom: '2px' }}>
                      ID: #{n.id}
                    </div>
                    <strong>{n.nombre}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Admin: {n.adminUsername}</div>
                  </td>
                  <td>
                    <div>{n.contactoEmail}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>{n.telefono}</div>
                  </td>
                  <td>
                    <div>Alta: {n.fechaAlta}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Días: {n.diasPrueba}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                      <span className={`sa-badge ${n.activo ? "activo" : "suspendido"}`}>
                        {n.activo ? "Activo" : "Deshabilitado"}
                      </span>
                      {n.estadoSuscripcion === "PRUEBA" && <span className="sa-badge" style={{ background: '#fef3c7', color: '#b45309' }}>Prueba</span>}
                      {n.estadoSuscripcion === "VENCIDO" && <span className="sa-badge" style={{ background: '#fee2e2', color: '#b91c1c' }}>Vencido</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <button 
                        className="btn-sa" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd' }} 
                        onClick={() => handleImpersonate(n)}
                        title={`Acceder al panel de ${n.nombre}`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                          <polyline points="10 17 15 12 10 7"></polyline>
                          <line x1="15" y1="12" x2="3" y2="12"></line>
                        </svg>
                        Ingresar
                      </button>

                      <button className="btn-sa btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleToggle(n.id)}>
                        {n.activo ? "Suspender" : "Activar"}
                      </button>

                      <button className="btn-sa btn-ghost-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => {
                        setDeleteModal({ isOpen: true, negocio: n });
                        setConfirmText("");
                      }}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  No se encontraron resultados en esta página.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* CONTROLES DE PAGINACIÓN VISIBLES */}
        {totalPages > 0 && (
          <div className="sa-pagination" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '1rem', background: '#fff', borderTop: '1px solid #e2e8f0' }}>
            <button 
              disabled={currentPage === 0} 
              onClick={() => loadNegocios(currentPage - 1)}
              style={{ padding: '0.4rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: currentPage === 0 ? '#f8fafc' : '#fff', cursor: currentPage === 0 ? 'not-allowed' : 'pointer', color: '#1e293b' }}
            >
              Anterior
            </button>
            
            {/* Números de página */}
            {pageNumbers.map(number => (
              <button
                key={number}
                onClick={() => loadNegocios(number)}
                style={{
                  padding: '0.4rem 0.8rem',
                  border: '1px solid',
                  borderColor: currentPage === number ? '#2563eb' : '#cbd5e1',
                  backgroundColor: currentPage === number ? '#2563eb' : '#fff',
                  color: currentPage === number ? '#fff' : '#1e293b',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: currentPage === number ? '600' : '400'
                }}
              >
                {number + 1}
              </button>
            ))}

            <button 
              disabled={currentPage >= totalPages - 1} 
              onClick={() => loadNegocios(currentPage + 1)}
              style={{ padding: '0.4rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: currentPage >= totalPages - 1 ? '#f8fafc' : '#fff', cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer', color: '#1e293b' }}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* MODAL DE ELIMINACIÓN */}
      {deleteModal.isOpen && (
        <div className="sa-modal-overlay">
          <div className="sa-modal">
            <h2 style={{ color: 'var(--sa-danger)', marginBottom: '1rem', fontSize: '1.25rem' }}>Eliminar Negocio</h2>
            <div style={{ background: 'var(--sa-danger-bg)', padding: '1rem', borderRadius: '6px', fontSize: '0.9rem', marginBottom: '1.5rem', color: '#991b1b', lineHeight: '1.5' }}>
              Esta acción es irreversible. Se borrará permanentemente el negocio <strong>{deleteModal.negocio.nombre}</strong>, junto con su historial, inventario y usuarios asociados.
            </div>
            
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>
              Escribe el nombre del negocio para confirmar:
            </label>
            <input 
              className="sa-input" 
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={deleteModal.negocio.nombre}
            />
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
              <button 
                className="btn-sa" 
                style={{ background: '#f1f5f9', color: '#475569' }} 
                onClick={() => setDeleteModal({ isOpen: false, negocio: null })}
              >
                Cancelar
              </button>
              <button 
                className="btn-sa btn-danger" 
                disabled={confirmText.toLowerCase() !== deleteModal.negocio.nombre.toLowerCase()}
                onClick={handleConfirmDelete}
              >
                Confirmar Eliminación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}