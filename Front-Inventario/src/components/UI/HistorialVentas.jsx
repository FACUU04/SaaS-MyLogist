import React, { useState, useEffect, useRef } from "react";
import { fetchData, getNegocio } from "../utils/api";
import Select from "react-select";
import * as XLSX from "xlsx";
import { useReactToPrint } from "react-to-print";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import "../../styles/modules/HistorialVentasModule.css";

// COMPONENTE DEL TICKET HISTÓRICO (Diseño para impresión)
const TicketToPrint = React.forwardRef(({ ventaFinal, negocioConfig, clienteNombre }, ref) => {
  if (!ventaFinal) return null;

  return (
    <div ref={ref} style={{ padding: "30px", fontFamily: "Arial, sans-serif", width: "320px", margin: "0 auto", color: "#000" }}>
      <div style={{ textAlign: "center", marginBottom: "20px", borderBottom: "1px solid #000", paddingBottom: "10px" }}>
        <h2 style={{ margin: "0 0 5px 0", textTransform: "uppercase" }}>{negocioConfig?.nombre || "Comprobante"}</h2>
        <p style={{ margin: "0", fontSize: "12px" }}>{negocioConfig?.ticketCabecera}</p>
        <p style={{ margin: "10px 0 0 0", fontSize: "11px" }}>Copia de Comprobante</p>
        <p style={{ margin: "2px 0", fontSize: "11px" }}>Número de Operación: {ventaFinal.id}</p>
        {clienteNombre && clienteNombre !== "Desconocido" && <p style={{ margin: "2px 0", fontSize: "11px" }}>Cliente: {clienteNombre}</p>}
      </div>

      <table style={{ width: "100%", fontSize: "12px", marginBottom: "20px", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #eee" }}>
            <th style={{ textAlign: "left", padding: "5px 0" }}>Cant.</th>
            <th style={{ textAlign: "left", padding: "5px 0" }}>Descripción</th>
            <th style={{ textAlign: "right", padding: "5px 0" }}>Subt.</th>
          </tr>
        </thead>
        <tbody>
          {(ventaFinal.detalles || []).map((d, i) => (
            <tr key={i}>
              <td style={{ padding: "5px 0" }}>{d.cantidad}</td>
              <td style={{ padding: "5px 0" }}>{d.descripcionProducto || `Producto #${d.idProducto}`}</td>
              <td style={{ textAlign: "right", padding: "5px 0" }}>${Number(d.importe || 0).toLocaleString("es-AR")}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ borderTop: "2px solid #000", paddingTop: "10px", textAlign: "right" }}>
        <h3 style={{ margin: "0" }}>TOTAL: ${Number(ventaFinal.importeTotal || 0).toLocaleString("es-AR")}</h3>
        {ventaFinal.metodoPago && (
          <p style={{ fontSize: "11px", marginTop: "5px" }}>Método de Pago: {ventaFinal.metodoPago}</p>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: "30px", fontSize: "11px", fontStyle: "italic" }}>
        <p>{negocioConfig?.ticketPie}</p>
      </div>
    </div>
  );
});

const HistorialVentas = () => {
  const [ventas, setVentas] = useState([]);
  const [estadisticas, setEstadisticas] = useState([]); 
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [negocioConfig, setNegocioConfig] = useState({});
  const [mesActual, setMesActual] = useState(new Date());
  
  // PAGINACIÓN
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalElementos, setTotalElementos] = useState(0);

  const [filtroCliente, setFiltroCliente] = useState(null);
  const [expandida, setExpandida] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mostrarDetalleLista, setMostrarDetalleLista] = useState(false); // NUEVO ESTADO

  // ESTADOS DE IMPRESIÓN RE-IMPRESIÓN
  const [ventaParaImprimir, setVentaParaImprimir] = useState(null);
  const componentRef = useRef();

  const normalizar = (data) => (Array.isArray(data) ? data : data?.content ?? []);

  useEffect(() => {
    const cargarMaestros = async () => {
      try {
        const [clientesData, productosData, negocioData] = await Promise.all([
          fetchData("clientes"),
          fetchData("productos"),
          getNegocio()
        ]);
        setClientes(normalizar(clientesData));
        setProductos(normalizar(productosData));
        setNegocioConfig(Array.isArray(negocioData) ? negocioData[0] : negocioData);
      } catch (err) { console.error(err); }
    };
    cargarMaestros();
  }, []);

  useEffect(() => {
    cargarVentasYPaginacion();
    cargarEstadisticasGrafico();
  }, [mesActual, paginaActual]);

  const cargarVentasYPaginacion = async () => {
    setCargando(true);
    const mes = mesActual.getMonth() + 1;
    const anio = mesActual.getFullYear();
    try {
      const data = await fetchData(`ventas?mes=${mes}&anio=${anio}&page=${paginaActual}&size=10`);
      setVentas(normalizar(data));
      setTotalPaginas(data.totalPages || 1);
      setTotalElementos(data.totalElements || 0);
    } catch (err) { console.error(err); }
    finally { setCargando(false); }
  };

  const cargarEstadisticasGrafico = async () => {
    const mes = mesActual.getMonth() + 1;
    const anio = mesActual.getFullYear();
    try {
      const data = await fetchData(`ventas/estadisticas?mes=${mes}&anio=${anio}`);
      setEstadisticas(data || []);
    } catch (err) { console.error(err); }
  };

  const cambiarMes = (delta) => {
    const nuevo = new Date(mesActual);
    nuevo.setMonth(nuevo.getMonth() + delta);
    setMesActual(nuevo);
    setPaginaActual(0); 
  };

  const getNombreCliente = (id) => {
    if (!id) return "Consumidor Final";
    const c = clientes.find(cli => cli.id === id);
    return c ? `${c.nombre} ${c.apellido}` : "Desconocido";
  };

  // MOTOR DE IMPRESIÓN
  const triggerPrint = useReactToPrint({
    contentRef: componentRef,
    onAfterPrint: () => setVentaParaImprimir(null)
  });

  const imprimirComprobante = (venta, e) => {
    e.stopPropagation();
    setVentaParaImprimir(venta);
    
    setTimeout(() => {
      triggerPrint();
    }, 150);
  };

  const totalFacturadoMes = estadisticas.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="historial-ventas">
      {/* CONTENEDOR OCULTO PARA IMPRIMIR */}
      <div style={{ display: "none" }}>
        <TicketToPrint 
          ref={componentRef} 
          ventaFinal={ventaParaImprimir} 
          negocioConfig={negocioConfig}
          clienteNombre={ventaParaImprimir ? getNombreCliente(ventaParaImprimir.clienteId) : null}
        />
      </div>

      <div className="encabezado-historial">
        <h3>
          Historial de Ventas —{" "}
          <span className="mes-resaltado">
            {mesActual.toLocaleString("es-AR", { month: "long", year: "numeric" })}
          </span>
        </h3>
        <div className="controles-mes">
          <button className="btn-mes" onClick={() => cambiarMes(-1)}>Anterior</button>
          <button className="btn-mes" onClick={() => cambiarMes(1)}>Siguiente</button>
        </div>
      </div>

      {/* GRÁFICO DE FACTURACIÓN DIARIA */}
      <h4 className="seccion-titulo">Facturación Diaria ($)</h4>
      <div className="grafico-wrapper" style={{ height: "250px", marginBottom: "2rem" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={estadisticas}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="dia" tick={{ fill: '#64748b', fontSize: 12 }} label={{ value: 'Día del mes', position: 'insideBottom', offset: -5 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip 
              formatter={(value) => [`$${value.toLocaleString("es-AR")}`, "Facturado"]}
              labelFormatter={(label) => `Día ${label}`}
            />
            <Area type="monotone" dataKey="total" stroke="#0284c7" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="total-destacado-container">
          <span>Total Facturado en el Mes:</span>
          <strong>${totalFacturadoMes.toLocaleString("es-AR")}</strong>
      </div>

      {/* LISTADO DE VENTAS PAGINADO (CON BOTÓN DE OCULTAR) */}
      <div className="lista-ventas-container" style={{ marginTop: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h4 className="seccion-titulo" style={{ margin: 0 }}>Detalle de Operaciones ({totalElementos})</h4>
          <button 
            className="btn-secundario" 
            onClick={() => setMostrarDetalleLista(!mostrarDetalleLista)}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            {mostrarDetalleLista ? "Ocultar Registros" : "Ver Registros"}
          </button>
        </div>

        {mostrarDetalleLista && (
          <>
            {cargando ? (
              <div className="loader">Cargando operaciones...</div>
            ) : (
              <>
                <ul className="lista-ventas">
                  {ventas.length === 0 ? (
                    <li className="sin-ventas">No hay registros para este periodo.</li>
                  ) : (
                    ventas.map((v) => (
                      <li key={v.id} className="item-venta">
                        <div className="venta-cabecera" onClick={() => setExpandida(expandida === v.id ? null : v.id)}>
                          <div className="venta-info-principal">
                            <span className="venta-numero">#{v.id}</span>
                            <span className="venta-cliente">{getNombreCliente(v.clienteId)}</span>
                          </div>
                          <div className="venta-info-secundaria">
                            <span className="venta-importe">${Number(v.importeTotal || 0).toLocaleString("es-AR")}</span>
                            <span className="venta-toggle">{expandida === v.id ? "▲" : "▼"}</span>
                          </div>
                        </div>
                        {expandida === v.id && (
                          <div className="venta-detalles-desplegados">
                            <ul className="detalle-venta-lista">
                              {(v.detalles || []).map((d, i) => (
                                <li key={i} className="detalle-fila">
                                  <span>{d.descripcionProducto || `Producto #${d.idProducto}`}</span>
                                  <span>x{d.cantidad}</span>
                                  <span>${Number(d.importe || 0).toLocaleString("es-AR")}</span>
                                </li>
                              ))}
                            </ul>
                            
                            <div style={{ marginTop: "15px", textAlign: "right", borderTop: "1px solid #e2e8f0", paddingTop: "10px" }}>
                              <button 
                                className="btn-secundario" 
                                onClick={(e) => imprimirComprobante(v, e)}
                                style={{ fontSize: "0.85rem", padding: "6px 12px" }}
                              >
                                Imprimir Comprobante
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))
                  )}
                </ul>

                {totalPaginas > 1 && (
                  <div className="paginacion-controles">
                    <button disabled={paginaActual === 0} onClick={() => setPaginaActual(p => p - 1)}>Anterior</button>
                    <span>Página {paginaActual + 1} de {totalPaginas}</span>
                    <button disabled={paginaActual >= totalPaginas - 1} onClick={() => setPaginaActual(p => p + 1)}>Siguiente</button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HistorialVentas;