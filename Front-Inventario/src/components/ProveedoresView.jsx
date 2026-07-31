import React, { useState, useEffect, useRef } from "react";
import { getProveedores, createProveedor, updateProveedor, removeProveedor, getProductos, reactivarProveedor } from "../components/utils/api";
import { ToastContainer, toast } from "react-toastify";
import * as XLSX from "xlsx";
import ProveedorForm from "../components/Proveedores/ProovedorForm";
import ProveedorList from "../components/Proveedores/ProovedorList";
import HistorialCompras from "./HistorialCompras";
import CompraModal from "./CompraModal";
import { Truck, Plus, FileSpreadsheet, X } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import "../styles/modules/ProveedoresModule.css";
import "../styles/Modal.css";

const ProveedoresView = () => {
  const [lista, setLista] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [mostrarModalCompra, setMostrarModalCompra] = useState(null);
  const [productos, setProductos] = useState([]);
  const [nuevo, setNuevo] = useState({ nombre: "", descripcion: "", contacto: "", productosSuministrados: "", sitioWeb: "", estado: "activo" });
  const [errores, setErrores] = useState({});
  const [editando, setEditando] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmarEliminacion, setConfirmarEliminacion] = useState(null);
  const [mostrarInactivos, setMostrarInactivos] = useState(false); 
  const comprasRef = useRef(null);

  const refrescar = async () => { setLista(await getProveedores()); };

  useEffect(() => {
    refrescar();
    getProductos().then(setProductos);
  }, []);

  const validarCampos = (campo, valor) => {
    let mensaje = "";
    if (!valor.trim()) mensaje = "Este campo es obligatorio";
    if (campo === "sitioWeb" && valor && !valor.startsWith("http")) mensaje = "Debe comenzar con http:// o https://";
    setErrores((prev) => ({ ...prev, [campo]: mensaje }));
    setNuevo((prev) => ({ ...prev, [campo]: valor }));
  };

  const guardar = async () => {
    try {
      await (editando ? updateProveedor(editando.id, nuevo) : createProveedor(nuevo));
      toast.success(editando ? "Proveedor actualizado" : "Proveedor guardado");
      setNuevo({ nombre: "", descripcion: "", contacto: "", productosSuministrados: "", sitioWeb: "", estado: "activo" });
      setErrores({});
      setEditando(null);
      setShowForm(false);
      refrescar();
    } catch (err) { toast.error("Error al guardar proveedor"); }
  };

  const eliminar = async () => {
    if (confirmarEliminacion) {
      await removeProveedor(confirmarEliminacion.id); 
      toast.info(`Proveedor deshabilitado`);
      setConfirmarEliminacion(null);
      refrescar();
    }
  };

  const handleReactivar = async (id) => {
    try {
      await reactivarProveedor(id);
      toast.success("Proveedor reactivado");
      refrescar();
    } catch (err) { toast.error("Error al reactivar"); }
  };

  const verCompras = async (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setTimeout(() => { comprasRef.current?.scrollIntoView({ behavior: "smooth" }); }, 300);
  };

  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(lista);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Proveedores");
    XLSX.writeFile(wb, "proveedores.xlsx");
  };

  const deshabilitado = Object.values(errores).some((e) => e) || !nuevo.nombre || !nuevo.contacto;
  const proveedoresFiltrados = lista.filter((p) => mostrarInactivos ? true : p.activo !== false);

  return (
    <div className="dashboard-content">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* HEADER */}
      <div className="ventas-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2>Directorio de Proveedores</h2>
          <span className="turno-info" style={{ color: '#64748b' }}>
            Gestiona tus proveedores y compras de mercadería
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secundario" onClick={exportarExcel} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <FileSpreadsheet size={18} /> Exportar Excel
          </button>
          <button className="btn-primario" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {showForm ? <><X size={18} /> Cancelar</> : <><Plus size={18} /> Añadir Proveedor</>}
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex' }}>
        <label className="checkbox-label-premium" style={{ margin: 0, padding: '0.5rem', border: 'none', background: 'transparent' }}>
          <input type="checkbox" checked={mostrarInactivos} onChange={(e) => setMostrarInactivos(e.target.checked)} />
          <div className="checkbox-content"><strong style={{ color: '#475569' }}>Mostrar proveedores deshabilitados</strong></div>
        </label>
      </div>

      {showForm && (
        <div className="card form-card-premium" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <ProveedorForm
            nuevo={nuevo} errores={errores} onChange={validarCampos}
            onSubmit={guardar} editando={editando} deshabilitado={deshabilitado}
          />
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {confirmarEliminacion && (
        <div className="modal-overlay">
          <div className="modal-content modal-confirm">
            <h3>Deshabilitar Proveedor</h3>
            <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              ¿Estás seguro de que deseas deshabilitar al proveedor <strong>{confirmarEliminacion.nombre}</strong>? 
              Podrás reactivarlo más adelante si lo necesitas.
            </p>
            <div className="modal-footer" style={{ borderTop: 'none', padding: 0 }}>
              <button className="btn-cancelar" onClick={() => setConfirmarEliminacion(null)}>Cancelar</button>
              <button className="btn-peligro" onClick={eliminar}>Deshabilitar</button>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive" style={{ paddingBottom: 0 }}>
          <ProveedorList
            lista={proveedoresFiltrados} 
            onEdit={(p) => {
              setNuevo({ ...p });
              setErrores({});
              setEditando(p);
              setShowForm(true);
              setTimeout(() => { document.querySelector(".form-card-premium")?.scrollIntoView({ behavior: "smooth" }); }, 300);
            }}
            onDelete={setConfirmarEliminacion}
            onVerCompras={verCompras}
            onRegistrarCompra={setMostrarModalCompra}
            onReactivar={handleReactivar} 
          />
        </div>
      </div>

      {proveedorSeleccionado && (
        <div ref={comprasRef} style={{ marginTop: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <HistorialCompras proveedorId={proveedorSeleccionado.id} />
          </div>
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