import React, { useState, useEffect } from "react";
import { fetchData, postData, putData, deleteData } from "../components/utils/api.js";
import { ToastContainer, toast } from "react-toastify";
import { Users, UserPlus, Search, Edit, Trash2, CheckCircle2, XCircle, X, RefreshCw } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import "../styles/modules/ClientesModule.css";
import "../styles/Modal.css"; // Reutilizamos estilos globales

const ClientesView = () => {
  const [lista, setLista] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  
  const [nuevo, setNuevo] = useState({
    nombre: "", apellido: "", telefono: "", correo: "", dni: "", fechaNacimiento: "",
  });
  const [errores, setErrores] = useState({});
  const [editando, setEditando] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [modal, setModal] = useState({ isOpen: false, accion: null, id: null, titulo: "", mensaje: "" });

  const refrescar = async () => {
    const res = await fetchData("clientes");
    const data = res.content || res;
    setLista(Array.isArray(data) ? data : []);
  };

  useEffect(() => { refrescar(); }, []);

  const validarCampos = (campo, valor) => {
    let mensaje = "";
    switch (campo) {
      case "nombre":
      case "apellido":
        if (!valor.trim()) mensaje = "Obligatorio";
        break;
      case "correo":
        if (!valor.trim()) mensaje = "Obligatorio";
        else if (!/\S+@\S+\.\S+/.test(valor)) mensaje = "Correo inválido";
        break;
      case "dni":
        if (!valor.trim()) mensaje = "Obligatorio";
        else if (!/^\d{7,}$/.test(valor)) mensaje = "DNI muy corto";
        break;
      case "fechaNacimiento":
        if (!valor) mensaje = "Obligatorio";
        break;
      default: break;
    }
    setErrores((prev) => ({ ...prev, [campo]: mensaje }));
    setNuevo((prev) => ({ ...prev, [campo]: valor }));
  };

  const guardar = async () => {
    try {
      await (editando ? putData(`clientes/${editando.id}`, nuevo) : postData("clientes", nuevo));
      toast.success(editando ? "Actualizado correctamente" : "Guardado correctamente");
      setNuevo({ nombre: "", apellido: "", telefono: "", correo: "", dni: "", fechaNacimiento: "" });
      setEditando(null);
      setShowForm(false);
      refrescar();
    } catch (err) { toast.error("Error al guardar"); }
  };

  const ejecutarAccionModal = async () => {
    try {
      if (modal.accion === 'eliminar') {
        await deleteData(`clientes/${modal.id}`);
        toast.info("Cliente deshabilitado");
      } else if (modal.accion === 'reactivar') {
        await putData(`clientes/${modal.id}/reactivar`, {});
        toast.success("Cliente reactivado");
      }
      refrescar();
    } catch (err) { toast.error(`Error al ${modal.accion}`); } 
    finally { setModal({ isOpen: false, accion: null, id: null, titulo: "", mensaje: "" }); }
  };

  const abrirModalEliminar = (id) => {
    setModal({
      isOpen: true, accion: 'eliminar', id: id,
      titulo: "Deshabilitar Cliente",
      mensaje: "¿Estás seguro de deshabilitar a este cliente? No podrá realizar compras hasta ser reactivado."
    });
  };

  const abrirModalReactivar = (id) => {
    setModal({
      isOpen: true, accion: 'reactivar', id: id,
      titulo: "Reactivar Cliente",
      mensaje: "¿Deseas volver a habilitar a este cliente en el sistema?"
    });
  };

  const listaFiltrada = lista.filter((c) => {
    const nombreCompleto = `${c.nombre} ${c.apellido}`.toLowerCase();
    const coincideBusqueda = nombreCompleto.includes(filtro.toLowerCase());
    const pasaFiltroEstado = mostrarInactivos ? true : c.activo !== false;
    return coincideBusqueda && pasaFiltroEstado;
  });

  const deshabilitado = Object.values(errores).some((e) => e) || !nuevo.nombre || !nuevo.apellido;

  return (
    <div className="dashboard-content">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* HEADER */}
      <div className="ventas-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2>Directorio de Clientes</h2>
          <span className="turno-info" style={{ color: '#64748b' }}>
            Gestiona la información y estado de tus compradores
          </span>
        </div>
        <button 
          className={showForm ? "btn-secundario" : "btn-primario"} 
          onClick={() => setShowForm(!showForm)}
          style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          {showForm ? <><X size={18} /> Cancelar</> : <><UserPlus size={18} /> Añadir Cliente</>}
        </button>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Search size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Buscar por nombre o apellido..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{ padding: '0.75rem 1rem 0.75rem 45px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
          />
        </div>
        <label className="checkbox-label-premium" style={{ margin: 0, padding: '0.75rem 1rem', background: '#f8fafc' }}>
          <input type="checkbox" checked={mostrarInactivos} onChange={(e) => setMostrarInactivos(e.target.checked)} />
          <div className="checkbox-content"><strong>Mostrar inactivos</strong></div>
        </label>
      </div>

      {/* FORMULARIO */}
      {showForm && (
        <div className="card form-card-premium" style={{ marginBottom: '1.5rem' }}>
          <div className="form-grid">
            {["nombre", "apellido", "telefono", "correo", "dni"].map((k) => (
              <div key={k} className="input-group" style={{ flexDirection: 'column', gap: '0.25rem', marginBottom: 0 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>{k.charAt(0).toUpperCase() + k.slice(1)}</label>
                <input
                  style={{ width: '100%' }}
                  placeholder={`Ingresar ${k}`}
                  value={nuevo[k]}
                  onChange={(e) => validarCampos(k, e.target.value)}
                />
                {errores[k] && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errores[k]}</span>}
              </div>
            ))}
            <div className="input-group" style={{ flexDirection: 'column', gap: '0.25rem', marginBottom: 0 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Fecha de Nacimiento</label>
              <input style={{ width: '100%' }} type="date" value={nuevo.fechaNacimiento} onChange={(e) => validarCampos("fechaNacimiento", e.target.value)} />
            </div>
          </div>
          <div style={{ marginTop: '1.5rem', textAlign: 'right', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
            <button className="btn-primario" onClick={guardar} disabled={deshabilitado}>Guardar Cliente</button>
          </div>
        </div>
      )}

      {/* TABLA */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive" style={{ paddingBottom: 0 }}>
          <table className="table-compras clean-table" style={{ margin: 0 }}>
            <thead style={{ backgroundColor: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '1.25rem 1.5rem' }}>Nombre Completo</th>
                <th>DNI</th>
                <th>Contacto</th>
                <th>Estado</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.length === 0 ? (
                <tr><td colSpan="5" className="texto-vacio text-center">No se encontraron clientes.</td></tr>
              ) : (
                listaFiltrada.map((c) => (
                  <tr key={c.id} style={{ opacity: c.activo === false ? 0.6 : 1, backgroundColor: c.activo === false ? '#f8fafc' : 'transparent' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#0f172a' }}>{c.nombre} {c.apellido}</td>
                    <td style={{ color: '#64748b' }}>{c.dni}</td>
                    <td style={{ color: '#64748b' }}>{c.telefono || c.correo || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: c.activo === false ? '#ef4444' : '#16a34a', fontWeight: '500' }}>
                        {c.activo === false ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                        {c.activo === false ? "Inactivo" : "Activo"}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        {c.activo === false ? (
                          <button className="btn-eliminar-nota" onClick={() => abrirModalReactivar(c.id)} title="Reactivar" style={{ color: '#f97316' }}>
                            <RefreshCw size={18} />
                          </button>
                        ) : (
                          <>
                            <button className="btn-eliminar-nota" onClick={() => { setNuevo({ ...c, dni: c.dni?.toString() }); setEditando(c); setShowForm(true); }} style={{ color: '#0284c7' }}>
                              <Edit size={18} />
                            </button>
                            <button className="btn-eliminar-nota" onClick={() => abrirModalEliminar(c.id)} style={{ color: '#ef4444' }}>
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      {modal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-confirm">
            <h3>{modal.titulo}</h3>
            <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1.5rem' }}>{modal.mensaje}</p>
            <div className="modal-footer" style={{ borderTop: 'none', padding: 0 }}>
              <button className="btn-cancelar" onClick={() => setModal({ isOpen: false, accion: null, id: null, titulo: "", mensaje: "" })}>Cancelar</button>
              <button className={modal.accion === 'eliminar' ? "btn-peligro" : "btn-primario"} onClick={ejecutarAccionModal}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientesView;