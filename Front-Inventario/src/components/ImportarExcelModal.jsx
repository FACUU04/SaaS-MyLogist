import React, { useState } from "react";
import { toast } from "react-toastify";
import { importarExcelProductos } from "../components/utils/api";
import "../styles/modules/ImportarExcelModule.css";

const ImportarExcelModal = ({ onClose, onImportacionExitosa }) => {
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [erroresExcel, setErroresExcel] = useState([]);
  const [errorGeneral, setErrorGeneral] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith(".xlsx")) {
        setErrorGeneral("Por favor, selecciona un archivo Excel válido (.xlsx)");
        setArchivo(null);
        e.target.value = "";
        return;
      }
      setArchivo(file);
      setErroresExcel([]);
      setErrorGeneral(null);
    }
  };

  const handleImportar = async () => {
    if (!archivo) {
      setErrorGeneral("Primero debes seleccionar un archivo.");
      return;
    }

    setCargando(true);
    setErroresExcel([]);
    setErrorGeneral(null);

    try {
      const response = await importarExcelProductos(archivo);
      toast.success(`Exito! Se procesaron ${response.filasProcesadas} productos.`);
      onImportacionExitosa();
      onClose();
    } catch (error) {
      console.error("Error devuelto por la API:", error);

      // Función auxiliar para saber cómo mostrar los errores
      const procesarListaDeErrores = (erroresArray) => {
        if (erroresArray.length === 1) {
          // Si es solo 1 error, sacamos el texto real y lo ponemos arriba.
          const errMsg = typeof erroresArray[0] === 'object' ? (erroresArray[0].mensaje || erroresArray[0].message || JSON.stringify(erroresArray[0])) : erroresArray[0];
          setErrorGeneral(errMsg);
          setErroresExcel([]); // Vaciamos la lista para que no aparezca nada abajo
        } else {
          // Si son varios (ej: fallan 3 filas distintas), avisamos arriba y listamos abajo.
          setErrorGeneral("Se encontraron múltiples problemas en el archivo. Revisa los detalles abajo.");
          setErroresExcel(erroresArray);
        }
      };

      // 1. Si el error viene como respuesta HTTP (formato Axios)
      if (error.response && error.response.data) {
        const data = error.response.data;
        if (data.errores && Array.isArray(data.errores) && data.errores.length > 0) {
          procesarListaDeErrores(data.errores);
          setCargando(false);
          return;
        }
        if (data.message || data.mensaje) {
          setErrorGeneral(data.message || data.mensaje);
          setCargando(false);
          return;
        }
      }

      // 2. Si el error viene parseado como texto en error.message (Tu caso actual)
      try {
        const errorData = JSON.parse(error.message);
        if (errorData.errores && Array.isArray(errorData.errores) && errorData.errores.length > 0) {
          procesarListaDeErrores(errorData.errores);
          setCargando(false);
          return;
        } else if (errorData.message || errorData.mensaje) {
          setErrorGeneral(errorData.message || errorData.mensaje);
          setCargando(false);
          return;
        }
      } catch (parseError) {
        // No es JSON, continuamos al mensaje por defecto
      }

      // 3. Fallback genérico
      setErrorGeneral(error.message || "Hubo un problema al subir el archivo");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content excel-modal animate-fade">
        
        <div className="modal-header header-con-cierre">
          <h3>Importar Productos</h3>
          <button className="btn-close" onClick={onClose} aria-label="Cerrar">
            &times;
          </button>
        </div>

        <div className="modal-body excel-modal-body">
          <p className="excel-instrucciones">
            Sube un archivo <strong>.xlsx</strong> para actualizar tu inventario de forma masiva. 
            El sistema validará el formato de cada fila antes de guardar.
          </p>
          
          <div className="excel-guia">
            <h5>Estructura de columnas requerida:</h5>
            <div className="table-responsive-wrapper">
              <table className="proveedores-table excel-tabla-guia">
                <thead>
                  <tr>
                    <th>Col A</th>
                    <th>Col B</th>
                    <th>Col C</th>
                    <th>Col D</th>
                    <th>Col E</th>
                    <th>Col F</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Marca</td>
                    <td><strong>Descripción</strong></td>
                    <td>Código</td>
                    <td><strong>Precio</strong></td>
                    <td><strong>Stock</strong></td>
                    <td>Unidad</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* CAJA DE ERROR GENERAL ADENTRO DEL MODAL */}
          {errorGeneral && (
            <div className="excel-error-general">
              {errorGeneral}
            </div>
          )}
          
          <div className="excel-dropzone" onClick={() => document.getElementById('fileInput').click()}>
            <input 
              id="fileInput"
              type="file" 
              accept=".xlsx" 
              onChange={handleFileChange}
              className="excel-input-file"
              style={{ display: 'none' }} 
            />
            <div className="dropzone-content">
              {archivo ? (
                <p className="file-selected">{archivo.name}</p>
              ) : (
                <p>Haz clic para seleccionar o arrastra un archivo .xlsx</p>
              )}
            </div>
          </div>

          {/* LA CAJA DE ABAJO SOLO APARECE SI HAY MÁS DE 1 ERROR */}
          {erroresExcel.length > 0 && (
            <div className="excel-errores-container">
              <div className="excel-errores-header">
                Se encontraron {erroresExcel.length} problemas:
              </div>
              <ul className="excel-errores-list">
                {erroresExcel.map((err, index) => {
                  const mensajeError = typeof err === 'object' ? (err.mensaje || err.message || err.error || JSON.stringify(err)) : err;
                  
                  return (
                    <li key={index}>
                      <span className="error-bullet">-</span> {mensajeError}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            className="btn-cancelar" 
            onClick={onClose} 
            disabled={cargando}
          >
            Cancelar
          </button>
          <button 
            className="btn-primario" 
            onClick={handleImportar} 
            disabled={cargando || !archivo}
          >
            {cargando ? "Procesando..." : "Iniciar Importación"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportarExcelModal;