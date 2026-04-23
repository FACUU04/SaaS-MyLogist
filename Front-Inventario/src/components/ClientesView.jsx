import React, { useState, useEffect } from "react";
import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../components/utils/api.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/modules/ClientesModule.css";

const ClientesView = () => {
  const [lista, setLista] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  
  const [nuevo, setNuevo] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    correo: "",
    dni: "",
    fechaNacimiento: "",
  });
  const [errores, setErrores] = useState({});
  const [editando, setEditando] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Estado para controlar el modal de confirmación
  const [modal, setModal] = useState({
    isOpen: false,
    accion: null, // 'eliminar' | 'reactivar'
    id: null,
    titulo: "",
    mensaje: ""
  });

  const refrescar = async () => {
    const res = await fetchData("clientes");
    const data = res.content || res;
    setLista(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    refrescar();
  }, []);

  const validarCampos = (campo, valor) => {
    let mensaje = "";
    switch (campo) {
      case "nombre":
      case "apellido":
        if (!valor.trim()) mensaje = "Este campo es obligatorio";
        break;
      case "correo":
        if (!valor.trim()) mensaje = "Este campo es obligatorio";
        else if (!/\S+@\S+\.\S+/.test(valor)) mensaje = "Correo inválido";
        break;
      case "dni":
        if (!valor.trim()) mensaje = "Este campo es obligatorio";
        else if (!/^\d{7,}$/.test(valor)) mensaje = "DNI demasiado corto";
        break;
      case "fechaNacimiento":
        if (!valor) mensaje = "Fecha obligatoria";
        break;
      default: break;
    }
    setErrores((prev) => ({ ...prev, [campo]: mensaje }));
    setNuevo((prev) => ({ ...prev, [campo]: valor }));
  };

  const guardar = async () => {
    try {
      await (editando
        ? putData(`clientes/${editando.id}`, nuevo)
        : postData("clientes", nuevo));
      toast.success(editando ? "Actualizado correctamente" : "Guardado correctamente");
      setNuevo({ nombre: "", apellido: "", telefono: "", correo: "", dni: "", fechaNacimiento: "" });
      setEditando(null);
      setShowForm(false);
      refrescar();
    } catch (err) {
      toast.error("Error al guardar");
    }
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
    } catch (err) {
      toast.error(`Error al ${modal.accion}`);
    } finally {
      setModal({ isOpen: false, accion: null, id: null, titulo: "", mensaje: "" });
    }
  };

  const abrirModalEliminar = (id) => {
    setModal({
      isOpen: true,
      accion: 'eliminar',
      id: id,
      titulo: "Deshabilitar Cliente",
      mensaje: "¿Estás seguro de que deseas deshabilitar a este cliente? No podrá realizar compras hasta ser reactivado."
    });
  };

  const abrirModalReactivar = (id) => {
    setModal({
      isOpen: true,
      accion: 'reactivar',
      id: id,
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
    <div className="dashboard-content clientes-module">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="clientes-header">
        <h2>Gestión de Clientes</h2>
        <button className="btn-primario" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "Añadir Cliente"}
        </button>
      </div>

      <div className="filtros-container">
        <input
          type="text"
          placeholder="Buscar por nombre o apellido..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="buscador-input"
        />
        <label className="checkbox-label">
          <input 
            type="checkbox" 
            checked={mostrarInactivos} 
            onChange={(e) => setMostrarInactivos(e.target.checked)} 
          />
          Mostrar inactivos
        </label>
      </div>

      {showForm && (
        <div className="cliente-form">
          <div className="form-grid">
            {["nombre", "apellido", "telefono", "correo", "dni"].map((k) => (
              <div key={k} className="input-group">
                <label>{k.charAt(0).toUpperCase() + k.slice(1)}</label>
                <input
                  placeholder={`Ingresar ${k}`}
                  value={nuevo[k]}
                  onChange={(e) => validarCampos(k, e.target.value)}
                />
                {errores[k] && <span className="error-text">{errores[k]}</span>}
              </div>
            ))}
            <div className="input-group">
              <label>Fecha de Nacimiento</label>
              <input 
                type="date" 
                value={nuevo.fechaNacimiento} 
                onChange={(e) => validarCampos("fechaNacimiento", e.target.value)} 
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-primario" onClick={guardar} disabled={deshabilitado}>
              Guardar Cliente
            </button>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="clientes-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>DNI</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.map((c) => (
              <tr key={c.id} className={c.activo === false ? "fila-inactiva" : ""}>
                <td>{c.nombre}</td>
                <td>{c.apellido}</td>
                <td>{c.dni}</td>
                <td>
                  <span className={`badge ${c.activo === false ? "badge-inactivo" : "badge-activo"}`}>
                    {c.activo === false ? "Inactivo" : "Activo"}
                  </span>
                </td>
                <td className="acciones-celda">
                  {c.activo === false ? (
                    <button className="btn-accion btn-reactivar" onClick={() => abrirModalReactivar(c.id)}>
                      Reactivar
                    </button>
                  ) : (
                    <>
                      <button className="btn-accion btn-editar" onClick={() => {
                        setNuevo({ ...c, dni: c.dni?.toString() });
                        setEditando(c);
                        setShowForm(true);
                      }}>
                        Editar
                      </button>
                      <button className="btn-accion btn-eliminar" onClick={() => abrirModalEliminar(c.id)}>
                        Deshabilitar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {listaFiltrada.length === 0 && (
              <tr>
                <td colSpan="5" className="sin-datos">No se encontraron clientes.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Oscuro de Confirmación */}
      {modal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{modal.titulo}</h3>
            <p>{modal.mensaje}</p>
            <div className="modal-actions">
              <button className="btn-cancelar" onClick={() => setModal({ isOpen: false, accion: null, id: null, titulo: "", mensaje: "" })}>
                Cancelar
              </button>
              <button 
                className={modal.accion === 'eliminar' ? "btn-peligro" : "btn-confirmar"} 
                onClick={ejecutarAccionModal}
              >
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