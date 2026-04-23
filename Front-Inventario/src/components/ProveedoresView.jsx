import React, { useState, useEffect, useRef } from "react";
import {
  getProveedores,
  createProveedor,
  updateProveedor,
  removeProveedor, 
  getProductos,
  reactivarProveedor
} from "../components/utils/api";
import { ToastContainer, toast } from "react-toastify";
import * as XLSX from "xlsx";
import ProveedorForm from "../components/Proveedores/ProovedorForm";
import ProveedorList from "../components/Proveedores/ProovedorList";
import HistorialCompras from "./HistorialCompras";
import CompraModal from "./CompraModal";
import "react-toastify/dist/ReactToastify.css";
import "../styles/modules/ProveedoresModule.css";

const ProveedoresView = () => {
  const [lista, setLista] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [mostrarModalCompra, setMostrarModalCompra] = useState(null);
  const [productos, setProductos] = useState([]);
  const [nuevo, setNuevo] = useState({
    nombre: "",
    descripcion: "",
    contacto: "",
    productosSuministrados: "",
    sitioWeb: "",
    estado: "activo",
  });
  const [errores, setErrores] = useState({});
  const [editando, setEditando] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmarEliminacion, setConfirmarEliminacion] = useState(null);
  
  const [mostrarInactivos, setMostrarInactivos] = useState(false); 
  
  const comprasRef = useRef(null);

  const refrescar = async () => {
    const data = await getProveedores();
    setLista(data);
  };

  useEffect(() => {
    refrescar();
    getProductos().then(setProductos);
  }, []);

  const validarCampos = (campo, valor) => {
    let mensaje = "";
    if (!valor.trim()) mensaje = "Este campo es obligatorio";
    if (campo === "sitioWeb" && valor && !valor.startsWith("http")) {
      mensaje = "Debe comenzar con http:// o https://";
    }
    setErrores((prev) => ({ ...prev, [campo]: mensaje }));
    setNuevo((prev) => ({ ...prev, [campo]: valor }));
  };

  const guardar = async () => {
    try {
      const res = editando
        ? await updateProveedor(editando.id, nuevo)
        : await createProveedor(nuevo);
      toast.success(editando ? "Proveedor actualizado correctamente" : "Proveedor guardado correctamente");
      setNuevo({
        nombre: "",
        descripcion: "",
        contacto: "",
        productosSuministrados: "",
        sitioWeb: "",
        estado: "activo",
      });
      setErrores({});
      setEditando(null);
      setShowForm(false);
      refrescar();
    } catch (err) {
      toast.error(err.message || "Error al guardar proveedor");
    }
  };

  const eliminar = async () => {
    if (confirmarEliminacion) {
      await removeProveedor(confirmarEliminacion.id); 
      toast.info(`Proveedor ${confirmarEliminacion.nombre} deshabilitado`);
      setConfirmarEliminacion(null);
      refrescar();
    }
  };

  const handleReactivar = async (id) => {
    try {
      await reactivarProveedor(id);
      toast.success("Proveedor reactivado exitosamente");
      refrescar();
    } catch (err) {
      toast.error("Error al reactivar el proveedor");
    }
  };

  const verCompras = async (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setTimeout(() => {
      comprasRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(lista);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Proveedores");
    XLSX.writeFile(wb, "proveedores.xlsx");
  };

  const hayErrores = Object.values(errores).some((e) => e);
  const camposIncompletos = !nuevo.nombre || !nuevo.contacto;
  const deshabilitado = hayErrores || camposIncompletos;

  const proveedoresFiltrados = lista.filter((p) => {
    return mostrarInactivos ? true : p.activo !== false;
  });

  return (
    <div className="proveedores-module">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="proveedores-header">
        <h2>Gestión de Proveedores</h2>
        <div className="header-actions">
          <button className="btn-secundario" onClick={exportarExcel}>
            Exportar a Excel
          </button>
          <button className="btn-primario" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancelar" : "Añadir Proveedor"}
          </button>
        </div>
      </div>

      <div className="filtros-container mb-2">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={mostrarInactivos}
            onChange={(e) => setMostrarInactivos(e.target.checked)}
          />
          Mostrar proveedores deshabilitados
        </label>
      </div>

      {showForm && (
        <div className="form-wrapper animate-fade">
          <ProveedorForm
            nuevo={nuevo}
            errores={errores}
            onChange={validarCampos}
            onSubmit={guardar}
            editando={editando}
            deshabilitado={deshabilitado}
          />
        </div>
      )}

      {/* Modal Oscuro de Confirmación para Deshabilitar */}
      {confirmarEliminacion && (
        <div className="modal-overlay">
          <div className="modal-content modal-confirm">
            <h3>Deshabilitar Proveedor</h3>
            <p>¿Estás seguro de que deseas deshabilitar al proveedor <strong>{confirmarEliminacion.nombre}</strong>? Podrás reactivarlo más adelante si lo necesitas.</p>
            <div className="modal-actions">
              <button className="btn-cancelar" onClick={() => setConfirmarEliminacion(null)}>
                Cancelar
              </button>
              <button className="btn-peligro" onClick={eliminar}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="table-responsive-wrapper">
        <ProveedorList
          lista={proveedoresFiltrados} 
          onEdit={(p) => {
            setNuevo({
              nombre: p.nombre || "",
              descripcion: p.descripcion || "",
              contacto: p.contacto || "",
              productosSuministrados: p.productosSuministrados || "",
              sitioWeb: p.sitioWeb || "",
              estado: p.estado || "activo",
            });
            setErrores({});
            setEditando(p);
            setShowForm(true);
            setTimeout(() => {
              document.querySelector(".form-wrapper")?.scrollIntoView({ behavior: "smooth" });
            }, 300);
          }}
          onDelete={setConfirmarEliminacion}
          onVerCompras={verCompras}
          onRegistrarCompra={setMostrarModalCompra}
          onReactivar={handleReactivar} 
        />
      </div>

      {proveedorSeleccionado && (
        <div ref={comprasRef}>
          <HistorialCompras proveedorId={proveedorSeleccionado.id} />
        </div>
      )}

      {mostrarModalCompra && (
        <CompraModal
          proveedor={mostrarModalCompra}
          productos={productos}
          onClose={() => setMostrarModalCompra(null)}
          onCompraRegistrada={() => verCompras(mostrarModalCompra)}
        />
      )}
    </div>
  );
};

export default ProveedoresView;