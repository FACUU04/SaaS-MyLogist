import React from "react";

const ProveedorList = ({ lista, onEdit, onDelete, onVerCompras, onRegistrarCompra, onReactivar }) => {
  return (
    <table className="proveedores-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Descripción</th> 
          <th>Contacto</th>
          <th>Sitio Web</th> 
          <th>Estado</th>
          <th>Productos</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {lista.map((p) => {
          const isInactivo = p.activo === false;

          return (
            <tr key={p.id} className={isInactivo ? "fila-inactiva" : ""}>
              <td>
                <strong style={{ color: isInactivo ? "#94a3b8" : "#0f172a" }}>
                  {p.nombre}
                </strong>
              </td>
              <td>{p.descripcion || "-"}</td> 
              <td>{p.contacto || "-"}</td>
              <td>
                
                {p.sitioWeb ? (
                  <a 
                    href={p.sitioWeb} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: isInactivo ? "#94a3b8" : "#0284c7", textDecoration: "none", fontWeight: "500" }}
                  >
                    Ver Web
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td>
                <span 
                  style={{
                    backgroundColor: isInactivo ? "#fee2e2" : "#dcfce7",
                    color: isInactivo ? "#991b1b" : "#166534",
                    padding: "0.25rem 0.6rem",
                    borderRadius: "1rem",
                    fontSize: "0.8rem",
                    fontWeight: "600"
                  }}
                >
                  {isInactivo ? "Inactivo" : "Activo"}
                </span>
              </td>
              <td>{p.productosSuministrados || "-"}</td>
              
              <td style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {isInactivo ? (
                  <button 
                    style={{ backgroundColor: "#fff7ed", color: "#ea580c", border: "1px solid #fed7aa" }}
                    onClick={() => onReactivar(p.id)}
                    title="Volver a habilitar proveedor"
                  >
                    Reactivar
                  </button>
                ) : (
                  <>
                    <button 
                      style={{ backgroundColor: "#f0f9ff", color: "#0284c7", border: "1px solid #e0f2fe" }}
                      onClick={() => onEdit(p)} 
                      title="Editar proveedor"
                    >
                      Editar
                    </button>
                    <button 
                      style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fee2e2" }}
                      onClick={() => onDelete(p)} 
                      title="Deshabilitar proveedor"
                    >
                      Desactivar
                    </button>
                    <button 
                      style={{ backgroundColor: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }}
                      onClick={() => onVerCompras(p)} 
                      title="Ver historial de compras"
                    >
                      Historial
                    </button>
                    <button 
                      style={{ backgroundColor: "#f97316", color: "#ffffff", border: "none" }}
                      onClick={() => onRegistrarCompra(p)} 
                      title="Registrar nueva compra"
                    >
                      + Compra
                    </button>
                  </>
                )}
              </td>
            </tr>
          );
        })}
        {lista.length === 0 && (
          <tr>
            <td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
              No se encontraron proveedores.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default ProveedorList;