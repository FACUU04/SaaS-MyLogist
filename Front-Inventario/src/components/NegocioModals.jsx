import React, { useState } from "react";
import "../styles/Modal.css"; 

const NegocioModal = ({ negocio, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: negocio.nombre || "",
    rubro: negocio.rubro || "",
    fundacion: negocio.fundacion || "",
    ubicacionlocal: negocio.ubicacionlocal || "",
    contactoemail: negocio.contactoemail || "",
    telefono: negocio.telefono || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Editar Información del Negocio</h3>
        <form onSubmit={handleSubmit}>
          {Object.entries(formData).map(([key, value]) => (
            <div key={key}>
              <label>{key}</label>
              <input name={key} value={value} onChange={handleChange} />
            </div>
          ))}
          <div className="modal-buttons">
            <button type="submit">Guardar</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NegocioModal;