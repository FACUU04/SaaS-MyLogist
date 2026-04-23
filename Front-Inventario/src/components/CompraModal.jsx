import React, { useState } from "react";
import { createCompraMultiple } from "../components/utils/api";
import { toast } from "react-toastify";
import "../styles/modules/ComprasModule.css";

const CompraModal = ({ proveedor, productos, onClose, onCompraRegistrada }) => {
  const [item, setItem] = useState({
    idProducto: "",
    cantidad: "",
    importe: "",
    observaciones: "",
  });

  const [items, setItems] = useState([]);

  const [compraInfo, setCompraInfo] = useState({
    idProveedor: proveedor.id,
    metodoPago: "",
    fecha: new Date().toISOString().slice(0, 10),
    observaciones: "",
  });

  const handleItemChange = (campo, valor) => {
    setItem((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleCompraInfo = (campo, valor) => {
    setCompraInfo((prev) => ({ ...prev, [campo]: valor }));
  };

  const agregarItem = () => {
    if (!item.idProducto || !item.cantidad || !item.importe) {
      toast.error("Completa producto, cantidad e importe");
      return;
    }

    setItems((prev) => [...prev, item]);
    setItem({
      idProducto: "",
      cantidad: "",
      importe: "",
      observaciones: "",
    });
  };

  const eliminarItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const guardarCompra = async () => {
    if (items.length === 0) {
      toast.error("Agrega al menos un producto a la compra");
      return;
    }

    try {
      const payload = {
        ...compraInfo,
        detalles: items,
      };

      await createCompraMultiple(payload);

      toast.success("Compra registrada correctamente");
      onCompraRegistrada();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error al registrar la compra");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-compra">
        <div className="modal-header">
          <h3>Registrar compra para {proveedor.nombre}</h3>
        </div>

        <div className="modal-body">
          <section className="form-section">
            <h4>Agregar Producto</h4>
            <div className="input-group">
              <label>Producto</label>
              <select
                value={item.idProducto}
                onChange={(e) => handleItemChange("idProducto", e.target.value)}
              >
                <option value="">Seleccionar producto...</option>
                {productos.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.descripcion}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Cantidad</label>
                <input
                  type="number"
                  placeholder="0"
                  value={item.cantidad}
                  onChange={(e) => handleItemChange("cantidad", e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Importe Unitario</label>
                <input
                  type="number"
                  placeholder="$ 0.00"
                  value={item.importe}
                  onChange={(e) => handleItemChange("importe", e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Observaciones del producto (Opcional)</label>
              <textarea
                placeholder="Detalles sobre este producto..."
                value={item.observaciones}
                onChange={(e) => handleItemChange("observaciones", e.target.value)}
              />
            </div>

            <button className="btn-secundario btn-full" onClick={agregarItem}>
              Agregar a la lista
            </button>
          </section>

          {items.length > 0 && (
            <section className="form-section items-agregados">
              <h4>Productos Agregados</h4>
              <div className="items-list">
                {items.map((it, index) => {
                  const prod = productos.find((p) => p.id == it.idProducto);
                  return (
                    <div key={index} className="item-card">
                      <div className="item-info">
                        <strong>{prod?.descripcion}</strong>
                        <span className="item-details">
                          Cant: {it.cantidad} | Importe: ${it.importe}
                        </span>
                        {it.observaciones && <span className="item-obs">Obs: {it.observaciones}</span>}
                      </div>
                      <button className="btn-eliminar-item" onClick={() => eliminarItem(index)}>
                        Eliminar
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className="form-section">
            <h4>Datos Generales</h4>
            <div className="form-row">
              <div className="input-group">
                <label>Método de Pago</label>
                <input
                  type="text"
                  placeholder="Ej. Transferencia"
                  value={compraInfo.metodoPago}
                  onChange={(e) => handleCompraInfo("metodoPago", e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Fecha de Compra</label>
                <input
                  type="date"
                  value={compraInfo.fecha}
                  onChange={(e) => handleCompraInfo("fecha", e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Observaciones de la Compra</label>
              <textarea
                placeholder="Notas generales de la compra..."
                value={compraInfo.observaciones}
                onChange={(e) => handleCompraInfo("observaciones", e.target.value)}
              />
            </div>
          </section>
        </div>

        <div className="modal-footer">
          <button className="btn-cancelar" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primario" onClick={guardarCompra}>
            Confirmar Compra
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompraModal;