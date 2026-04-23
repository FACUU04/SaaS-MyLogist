import React, { useEffect, useState } from "react";
import { fetchData, postData, putData, deleteData } from "../../src/components/utils/api"; 
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../src/styles/modules/EmpleadosModule.css";

const UsuariosView = () => {
  const [lista, setLista] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  
  // Estado para el modal de eliminación
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
    <div className="empleados-view">
      <ToastContainer position="bottom-right" />

      <div className="empleados-header">
        <div className="header-info">
          <h2>Gestión de Personal</h2>
          <p>Administrá los accesos y permisos de tu equipo de trabajo.</p>
        </div>
        <button className={showForm ? "btn-secundario" : "btn-primario"} onClick={showForm ? () => setShowForm(false) : abrirParaCrear}>
          {showForm ? "Cancelar" : "Nuevo Empleado"}
        </button>
      </div>

      {showForm && (
        <div className="empleado-form-card">
          <form onSubmit={guardar}>
            <div className="form-grid">
              <div className="form-seccion">
                <h3>Datos Personales</h3>
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

              <div className="form-seccion seccion-seguridad">
                <h3>Credenciales y Acceso</h3>
                <div className="input-group">
                  <input type="text" name="username" placeholder="Nombre de Usuario *" value={nuevo.username} onChange={manejarCambio} required autoComplete="off" />
                  <input type="password" name="password" placeholder={editandoId ? "Nueva Contraseña (opcional)" : "Contraseña (mínimo 6) *"} value={nuevo.password} onChange={manejarCambio} autoComplete="new-password" />
                </div>
                <div className="permisos-container">
                  <h4>Permisos del Sistema</h4>
                  <label className="checkbox-label">
                    <input type="checkbox" name="permisoVentas" checked={nuevo.permisoVentas} onChange={manejarCambio} />
                    <span>Módulo de Ventas y Cobros</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" name="permisoInventario" checked={nuevo.permisoInventario} onChange={manejarCambio} />
                    <span>Gestión de Inventario y Productos</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" name="permisoProveedores" checked={nuevo.permisoProveedores} onChange={manejarCambio} />
                    <span>Gestión de Proveedores</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-guardar">{editandoId ? "Guardar Cambios" : "Registrar Empleado"}</button>
            </div>
          </form>
        </div>
      )}

      <div className="tabla-container">
        {cargando ? (
          <div className="loader">Cargando personal...</div>
        ) : (
          <table className="tabla-empleados">
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>Usuario</th>
                <th>Puesto</th>
                <th>Permisos Activos</th>
                <th>Estado</th>
                <th style={{textAlign: 'center'}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 ? (
                <tr><td colSpan="6" className="text-center">No hay empleados registrados.</td></tr>
              ) : (
                lista.map((u) => (
                  <tr key={u.id}>
                    <td className="fw-bold">{u.nombre} {u.apellido}</td>
                    <td className="text-muted">@{u.username}</td>
                    <td>{u.puestoOcupado || "Sin asignar"}</td>
                    <td className="celda-permisos">
                      {u.permisoVentas && <span className="badge badge-ventas">Ventas</span>}
                      {u.permisoInventario && <span className="badge badge-inventario">Inventario</span>}
                      {u.permisoProveedores && <span className="badge badge-proveedores">Proveedores</span>}
                      {!u.permisoVentas && !u.permisoInventario && !u.permisoProveedores && <span className="badge badge-ninguno">Sin Permisos</span>}
                    </td>
                    <td>
                      <span className={`status-dot ${u.enabled ? 'activo' : 'inactivo'}`}></span>
                      {u.enabled ? "Activo" : "Suspendido"}
                    </td>
                    <td className="celda-acciones">
                      <button className="btn-texto btn-texto-editar" onClick={() => abrirParaEditar(u)}>Editar</button>
                      <button className="btn-texto btn-texto-eliminar" onClick={() => solicitarEliminacion(u.id, `${u.nombre} ${u.apellido}`)}>Eliminar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      {modalEliminar.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmar Eliminación</h3>
            <p>¿Estás seguro de que deseás dar de baja a <strong>{modalEliminar.nombre}</strong>?</p>
            <p className="texto-advertencia">Esta acción revocará su acceso al sistema de forma permanente.</p>
            <div className="modal-acciones">
              <button className="btn-secundario" onClick={() => setModalEliminar({ show: false, id: null, nombre: "" })}>Cancelar</button>
              <button className="btn-peligro" onClick={confirmarEliminacion}>Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosView;