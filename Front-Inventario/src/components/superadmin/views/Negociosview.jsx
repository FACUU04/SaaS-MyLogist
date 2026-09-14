import { useEffect, useState } from "react";
import {
  getNegociosSuperAdmin,
  toggleNegocio,
  deleteNegocioSuperAdmin,
  impersonateCliente,
  actualizarSuscripcionNegocio 
} from "../../../components/utils/api";

const calcularDiasRestantes = (fechaAlta, diasTotales) => {
  if (!fechaAlta || diasTotales == null) return 0;
  
  const inicio = new Date(fechaAlta);
  const hoy = new Date();
  
  inicio.setHours(0, 0, 0, 0);
  hoy.setHours(0, 0, 0, 0);
  
  const diferenciaTiempo = hoy.getTime() - inicio.getTime();
  const diasTranscurridos = Math.floor(diferenciaTiempo / (1000 * 60 * 60 * 24));
  
  const restantes = diasTotales - diasTranscurridos;
  return restantes > 0 ? restantes : 0;
};

export default function ListNegocio() {
  const [negocios, setNegocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, negocio: null });
  const [planModal, setPlanModal] = useState({ isOpen: false, negocio: null });
  
  const [confirmText, setConfirmText] = useState("");
  const [diasExtra, setDiasExtra] = useState(15); // Por defecto 15 días extra
  const [successMsg, setSuccessMsg] = useState("");

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

  const handleUpdatePlan = async (estado) => {
    try {
      await actualizarSuscripcionNegocio(planModal.negocio.id, estado, diasExtra);
      setSuccessMsg(`Suscripción de ${planModal.negocio.nombre} actualizada con éxito.`);
      setPlanModal({ isOpen: false, negocio: null });
      setTimeout(() => setSuccessMsg(""), 4000);
      loadNegocios(currentPage);
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
                  <td>
                    <div style={{ fontSize: '0.75rem', color: 'var(--sa-text-muted)', fontWeight: 'bold', marginBottom: '2px' }}>
                      ID: #{n.id}
                    </div>
                    <strong>{n.nombre}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--sa-text-muted)' }}>Admin: {n.adminUsername}</div>
                  </td>
                  <td>
                    <div>{n.contactoEmail}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--sa-text-muted)', marginTop: '2px' }}>{n.telefono}</div>
                  </td>
                  <td>
                    <div>Alta: {n.fechaAlta}</div>
                    {n.estadoSuscripcion === "PAGO" ? (
                       <div style={{ fontSize: '0.85rem', color: 'var(--sa-success)', fontWeight: 'bold' }}>Ilimitado</div>
                    ) : (
                       <div style={{ fontSize: '0.85rem', color: 'var(--sa-text-muted)' }}>
                         Quedan: <strong>{calcularDiasRestantes(n.fechaAlta, n.diasPrueba)} días</strong>
                       </div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                      <span className={`sa-badge ${n.activo ? "activo" : "suspendido"}`}>
                        {n.activo ? "Activo" : "Deshabilitado"}
                      </span>
                      {n.estadoSuscripcion === "PRUEBA" && <span className="sa-badge warning">Prueba</span>}
                      {n.estadoSuscripcion === "VENCIDO" && <span className="sa-badge suspendido">Vencido</span>}
                      {n.estadoSuscripcion === "PAGO" && <span className="sa-badge activo" style={{backgroundColor: '#059669', color: 'white'}}>Cliente Pago</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      
                      <button 
                        className="btn-sa btn-ghost" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: '#10b981', borderColor: '#10b981' }} 
                        onClick={() => setPlanModal({ isOpen: true, negocio: n })}
                        title="Gestionar Plan y Suscripción"
                      >
                        Plan
                      </button>

                      <button 
                        className="btn-sa btn-ghost" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} 
                        onClick={() => handleImpersonate(n)}
                        title={`Acceder al panel de ${n.nombre}`}
                      >
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
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--sa-text-muted)' }}>
                  No se encontraron resultados en esta página.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 0 && (
          <div className="sa-pagination">
            <button disabled={currentPage === 0} onClick={() => loadNegocios(currentPage - 1)}>Anterior</button>
            {pageNumbers.map(number => (
              <button key={number} onClick={() => loadNegocios(number)} className={currentPage === number ? "active" : ""}>
                {number + 1}
              </button>
            ))}
            <button disabled={currentPage >= totalPages - 1} onClick={() => loadNegocios(currentPage + 1)}>Siguiente</button>
          </div>
        )}
      </div>

      {/* MODAL GESTIONAR PLAN (NUEVO) */}
      {planModal.isOpen && (
        <div className="sa-modal-overlay">
          <div className="sa-modal">
            <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', color: 'var(--sa-text-main)' }}>Gestionar Plan: {planModal.negocio.nombre}</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--sa-text-muted)', marginBottom: '1.5rem' }}>
              Estado actual: <strong>{planModal.negocio.estadoSuscripcion}</strong>
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Opción 1: Cliente Pago */}
              <div style={{ padding: '1rem', border: '1px solid var(--sa-glass-border)', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Pasar a Cliente Pago</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--sa-text-muted)', marginBottom: '1rem' }}>El negocio dejará de tener límites de tiempo de prueba y no será suspendido por el bot.</p>
                <button className="btn-sa btn-primary" style={{ width: '100%', backgroundColor: '#059669', borderColor: '#059669' }} onClick={() => handleUpdatePlan("PAGO")}>
                  Convertir a Cliente Pago
                </button>
              </div>

              {/* Opción 2: Extender Prueba */}
              <div style={{ padding: '1rem', border: '1px solid var(--sa-glass-border)', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Extender / Reiniciar Prueba</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--sa-text-muted)', marginBottom: '0.5rem' }}>Suma días extra a su período de prueba y reactiva la cuenta si estaba vencida.</p>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <input type="number" className="sa-input" style={{ width: '80px' }} value={diasExtra} onChange={(e) => setDiasExtra(parseInt(e.target.value) || 0)} min="1" />
                  <span style={{ fontSize: '0.9rem', color: 'var(--sa-text-main)' }}>días extra</span>
                </div>
                <button className="btn-sa btn-primary" style={{ width: '100%' }} onClick={() => handleUpdatePlan("PRUEBA")}>
                  Extender Prueba
                </button>
              </div>

            </div>
            
            <div style={{ display: 'flex', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button className="btn-sa btn-ghost" onClick={() => setPlanModal({ isOpen: false, negocio: null })}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR (EXISTENTE) */}
      {deleteModal.isOpen && (
        <div className="sa-modal-overlay">
          <div className="sa-modal">
            <h2 style={{ color: 'var(--sa-danger)', marginBottom: '1rem', fontSize: '1.25rem' }}>Eliminar Negocio</h2>
            <div className="sa-alert sa-alert-error" style={{ marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Esta acción es irreversible. Se borrará permanentemente el negocio <strong>{deleteModal.negocio.nombre}</strong>.
            </div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--sa-text-main)' }}>Escribe el nombre del negocio para confirmar:</label>
            <input className="sa-input" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder={deleteModal.negocio.nombre} />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
              <button className="btn-sa btn-ghost" onClick={() => setDeleteModal({ isOpen: false, negocio: null })}>Cancelar</button>
              <button className="btn-sa btn-danger" disabled={confirmText.toLowerCase() !== deleteModal.negocio.nombre.toLowerCase()} onClick={handleConfirmDelete}>Confirmar Eliminación</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}