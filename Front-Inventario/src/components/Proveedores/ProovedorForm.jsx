import React from "react";

const ProveedorForm = ({ nuevo, errores, onChange, onSubmit, editando, deshabilitado }) => {
  return (
    <div className="proveedor-form animate-fade">
      <h3 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#0f172a" }}>
        {editando ? "Editar Proveedor" : "Nuevo Proveedor"}
      </h3>

      <div className="form-group" style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#475569", fontSize: "0.9rem" }}>
          Nombre
        </label>
        <input
          type="text"
          placeholder="Razón social o nombre comercial"
          value={nuevo.nombre}
          onChange={(e) => onChange("nombre", e.target.value)}
        />
        {errores.nombre && <span className="error">{errores.nombre}</span>}
      </div>

      <div className="form-group" style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#475569", fontSize: "0.9rem" }}>
          Descripción
        </label>
        <textarea
          placeholder="Detalles sobre el proveedor"
          value={nuevo.descripcion}
          onChange={(e) => onChange("descripcion", e.target.value)}
        />
      </div>

      <div className="form-group" style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#475569", fontSize: "0.9rem" }}>
          Contacto
        </label>
        <input
          type="text"
          placeholder="Nombre de la persona de contacto"
          value={nuevo.contacto}
          onChange={(e) => onChange("contacto", e.target.value)}
        />
        {errores.contacto && <span className="error">{errores.contacto}</span>}
      </div>

      <div className="form-group" style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#475569", fontSize: "0.9rem" }}>
          Productos Suministrados
        </label>
        <input
          type="text"
          placeholder="Ej: Lácteos, Herramientas, etc."
          value={nuevo.productosSuministrados}
          onChange={(e) => onChange("productosSuministrados", e.target.value)}
        />
      </div>

      <div className="form-group" style={{ marginBottom: "1.5rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#475569", fontSize: "0.9rem" }}>
          Sitio Web
        </label>
        <input
          type="text"
          placeholder="https://www.proveedor.com"
          value={nuevo.sitioWeb}
          onChange={(e) => onChange("sitioWeb", e.target.value)}
        />
        {errores.sitioWeb && <span className="error">{errores.sitioWeb}</span>}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button 
          className="btn-primario" 
          onClick={onSubmit} 
          disabled={deshabilitado}
        >
          {editando ? "Guardar Cambios" : "Guardar Proveedor"}
        </button>
      </div>
    </div>
  );
};

export default ProveedorForm;