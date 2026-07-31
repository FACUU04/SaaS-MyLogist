import React, { useEffect, useState } from "react";
import { fetchData, postData, putData, deleteData } from "../components/utils/api"; 
import { toast, ToastContainer } from "react-toastify";
import { 
  UserPlus, Edit, Trash2, Shield, Key, CheckCircle2, XCircle, X, Users
} from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import "../styles/modules/EmpleadosModule.css";
import "../styles/Modal.css"; 

const UsuariosView = () => {
  const [lista, setLista] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  
  const [modalEliminar, setModalEliminar] = useState({ show: false, id: null, nombre: "" });

  const estadoInicial = {
    nombre: "", apellido: "", email: "", telefono: "", puestoOcupado: "",
    fechaIngreso: new Date().toISOString().split('T')[0],
    username: "", password: "", permisoVentas: true, permisoInventario: false, permisoProveedores: false,
  };

  const [nuevo, setNuevo] = useState(estadoInicial);

  const refrescar = async () => {
    setCargando(true);
    try {
      const data = await fetchData("empleados");
      setLista(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Error al cargar el personal");
      setLista([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { refrescar(); }, []);

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target;
    setNuevo({ ...nuevo, [name]: type === "checkbox" ? checked : value });
  };

  const abrirParaCrear = () => {
    setEditandoId(null);
    setNuevo(estadoInicial);
    setShowForm(true);
  };

  const abrirParaEditar = (empleado) => {
    setEditandoId(empleado.id);
    setNuevo({
      nombre: empleado.nombre || "", apellido: empleado.apellido || "",
      email: empleado.email || "", telefono: empleado.telefono || "",
      puestoOcupado: empleado.puestoOcupado || "",
      fechaIngreso: empleado.fechaIngreso || estadoInicial.fechaIngreso,
      username: empleado.username || "", password: "", 
      permisoVentas: empleado.permisoVentas || false,
      permisoInventario: empleado.permisoInventario || false,
      permisoProveedores: empleado.permisoProveedores || false,
    });
    setShowForm(true);
  };

  const solicitarEliminacion = (id, nombreCompleto) => {
    setModalEliminar({ show: true, id, nombre: nombreCompleto });
  };

  const confirmarEliminacion = async () => {
    try {
      await deleteData(`empleados/${modalEliminar.id}`);
      toast.success("Empleado eliminado correctamente");
      setModalEliminar({ show: false, id: null, nombre: "" });
      refrescar();
    } catch (err) {
      toast.error("Error al eliminar el empleado");
      setModalEliminar({ show: false, id: null, nombre: "" });
    }
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (!nuevo.nombre || !nuevo.apellido || !nuevo.username) {
      toast.warning("Completá Nombre, Apellido y Usuario.");
      return;
    }
    if (!editandoId && nuevo.password.length < 6) {
      toast.warning("Por seguridad, la contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (editandoId && nuevo.password && nuevo.password.length < 6) {
      toast.warning("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      if (editandoId) {
        await putData(`empleados/${editandoId}`, nuevo);
        toast.success("Datos actualizados");
      } else {
        await postData("empleados", nuevo);
        toast.success("Empleado registrado");
      }
      setNuevo(estadoInicial);
      setShowForm(false);
      setEditandoId(null);
      refrescar();
    } catch (err) {
      toast.error(err.message || "Error al guardar los datos");
    }
  };

  return (
    <div className="dashboard-content">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* ENCABEZADO */}
      <div className="ventas-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2>Gestión de Personal</h2>
          <span className="turno-info" style={{ color: '#64748b' }}>
            Administrá los accesos y roles de tu equipo
          </span>
        </div>
        <button 
          className={showForm ? "btn-secundario" : "btn-primario"} 
          onClick={showForm ? () => setShowForm(false) : abrirParaCrear}
          style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          {showForm ? <><X size={18} /> Cancelar</> : <><UserPlus size={18} /> Nuevo Empleado</>}
        </button>
      </div>

      {/* FORMULARIO DE ALTA / EDICIÓN */}
      {showForm && (
        <div className="card form-card-premium">
          <form onSubmit={guardar}>
            <div className="form-grid">
              
              {/* Sección Datos Personales */}
              <div className="form-seccion">
                <div className="seccion-header">
                  <Users size={18} className="text-slate-500" />
                  <h3>Datos Personales</h3>
                </div>
                <div className="input-group">
                  <input type="text" name="nombre" placeholder="Nombre *" value={nuevo.nombre} onChange={manejarCambio} required />
                  <input type="text" name="apellido" placeholder="Apellido *" value={nuevo.apellido} onChange={manejarCambio} required />
                </div>
                <div className="input-group">
                  <input type="email" name="email" placeholder="Correo Electrónico" value={nuevo.email} onChange={manejarCambio} />
                  <input type="text" name="telefono" placeholder="Teléfono" value={nuevo.telefono} onChange={manejarCambio} />
                </div>
                <div className="input-group">
                  <input type="text" name="puestoOcupado" placeholder="Puesto (ej. Cajero)" value={nuevo.puestoOcupado} onChange={manejarCambio} />
                  <input type="date" name="fechaIngreso" title="Fecha de Ingreso" value={nuevo.fechaIngreso} onChange={manejarCambio} />
                </div>
              </div>

              {/* Sección Credenciales y Permisos */}
              <div className="form-seccion seccion-seguridad">
                <div className="seccion-header">
                  <Shield size={18} className="text-slate-500" />
                  <h3>Credenciales y Acceso</h3>
                </div>
                <div className="input-group">
                  <div className="input-icon-wrapper">
                    <UserPlus size={16} className="input-icon" />
                    <input type="text" name="username" placeholder="Usuario de acceso *" value={nuevo.username} onChange={manejarCambio} required autoComplete="off" />
                  </div>
                  <div className="input-icon-wrapper">
                    <Key size={16} className="input-icon" />
                    <input type="password" name="password" placeholder={editandoId ? "Nueva Contraseña (opcional)" : "Contraseña (mínimo 6) *"} value={nuevo.password} onChange={manejarCambio} autoComplete="new-password" />
                  </div>
                </div>
                
                <div className="permisos-container">
                  <h4 style={{ color: '#0f172a', marginBottom: '1rem', fontSize: '0.95rem' }}>Niveles de Autorización</h4>
                  <div className="checkbox-grid">
                    <label className="checkbox-label-premium">
                      <input type="checkbox" name="permisoVentas" checked={nuevo.permisoVentas} onChange={manejarCambio} />
                      <div className="checkbox-content">
                        <strong>Módulo de Ventas</strong>
                        <span>Autorizado a facturar y cobrar</span>
                      </div>
                    </label>
                    <label className="checkbox-label-premium">
                      <input type="checkbox" name="permisoInventario" checked={nuevo.permisoInventario} onChange={manejarCambio} />
                      <div className="checkbox-content">
                        <strong>Gestión de Inventario</strong>
                        <span>Autorizado a modificar stock y precios</span>
                      </div>
                    </label>
                    <label className="checkbox-label-premium">
                      <input type="checkbox" name="permisoProveedores" checked={nuevo.permisoProveedores} onChange={manejarCambio} />
                      <div className="checkbox-content">
                        <strong>Módulo Proveedores</strong>
                        <span>Autorizado a gestionar contactos</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="form-actions" style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', textAlign: 'right' }}>
              <button type="submit" className="btn-primario">
                {editandoId ? "Guardar Cambios" : "Registrar Empleado"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABLA DE EMPLEADOS */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive" style={{ paddingBottom: 0 }}>
          {cargando ? (
            <div className="loader-clean" style={{ padding: '3rem' }}>Sincronizando equipo...</div>
          ) : (
            <table className="table-compras clean-table" style={{ margin: 0 }}>
              <thead style={{ backgroundColor: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '1.25rem 1.5rem' }}>Colaborador</th>
                  <th>Usuario</th>
                  <th>Puesto</th>
                  <th>Permisos Activos</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lista.length === 0 ? (
                  <tr><td colSpan="6" className="texto-vacio text-center">No hay empleados registrados.</td></tr>
                ) : (
                  lista.map((u) => (
                    <tr key={u.id}>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#0f172a' }}>
                        {u.nombre} {u.apellido}
                      </td>
                      <td style={{ color: '#64748b', fontWeight: '500' }}>@{u.username}</td>
                      <td>{u.puestoOcupado || "Sin asignar"}</td>
                      <td className="celda-permisos">
                        {u.permisoVentas && <span className="badge badge-ventas">Ventas</span>}
                        {u.permisoInventario && <span className="badge badge-inventario">Inventario</span>}
                        {u.permisoProveedores && <span className="badge badge-proveedores">Proveedores</span>}
                        {!u.permisoVentas && !u.permisoInventario && !u.permisoProveedores && <span className="badge badge-ninguno">Sin Permisos</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: u.enabled ? '#16a34a' : '#ef4444', fontWeight: '500' }}>
                          {u.enabled ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                          {u.enabled ? "Activo" : "Suspendido"}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                          <button className="btn-eliminar-nota" onClick={() => abrirParaEditar(u)} title="Editar Empleado" style={{ color: '#0284c7' }}>
                            <Edit size={18} />
                          </button>
                          <button className="btn-eliminar-nota" onClick={() => solicitarEliminacion(u.id, `${u.nombre} ${u.apellido}`)} title="Revocar Acceso" style={{ color: '#ef4444' }}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL DE ELIMINACIÓN (Usando el global) */}
      {modalEliminar.show && (
        <div className="modal-overlay">
          <div className="modal-content modal-confirm">
            <h3>Revocar Acceso</h3>
            <p>¿Estás seguro de que deseás dar de baja a <strong>{modalEliminar.nombre}</strong>?</p>
            <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: '500' }}>
              Esta acción bloqueará su ingreso al sistema de forma permanente.
            </p>
            <div className="modal-footer" style={{ borderTop: 'none', padding: 0 }}>
              <button className="btn-cancelar" onClick={() => setModalEliminar({ show: false, id: null, nombre: "" })}>Cancelar</button>
              <button className="btn-peligro" onClick={confirmarEliminacion}>Sí, Revocar Acceso</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosView;