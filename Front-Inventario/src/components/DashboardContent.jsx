import React, { useEffect, useState } from "react";
import { fetchData } from "../components/utils/api.js";
import DashboardView from "./DashboardView";
import InventarioView from "./InventarioView";
import ClientesView from "./ClientesView";
import UsuariosView from "./UsuariosView";
import VentasView from "./VentasView";
import VentasRegistradasView from "./VentasRegistradasView";
import ProveedoresView from "./ProveedoresView";
import "../styles/DashboardContent.css";

const normalizePage = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.content)) return res.content;
  return [];
};

const DashboardContent = ({ selected, user, onLogout }) => {
  const [data, setData] = useState({
    productos: [],
    clientes: [],
    empleados: [],
    ventas: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSafe = async (endpoint) => {
      try {
        return await fetchData(endpoint);
      } catch (err) {
        console.error(`Error cargando ${endpoint}:`, err.message);
        return null;
      }
    };

    const fetchAll = async () => {
      setLoading(true);

      try {
        switch (selected) {
          case "dashboard": {
          
            setData({}); 
            break;
          }
          case "inventario": {
            const productosRes = await fetchSafe("productos");
            setData({ productos: normalizePage(productosRes) });
            break;
          }
          case "clientes": {
            const clientes = await fetchSafe("clientes");
            setData({ clientes: normalizePage(clientes) });
            break;
          }
          case "usuarios": {
            const empleados = await fetchSafe("empleados");
            setData({ empleados: normalizePage(empleados) });
            break;
          }
          case "ventas": {
            const productosRes = await fetchSafe("productos");
            const clientes = await fetchSafe("clientes");

            setData({
              productos: normalizePage(productosRes),
              clientes: normalizePage(clientes),
            });
            break;
          }
          case "ventasregistradas": {
            const ventas = await fetchSafe("ventas");
            const clientes = await fetchSafe("clientes");

            setData({
              ventas: normalizePage(ventas),
              clientes: normalizePage(clientes),
            });
            break;
          }
          case "proveedores":
            break;
          default:
            break;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [selected]);

  if (loading) {
    return (
      <div className="dashboard-loader-container">
        <div className="dashboard-spinner"></div>
        <p>Cargando información...</p>
      </div>
    );
  }

  switch (selected) {
    case "dashboard":
    
      return <DashboardView />; 
    case "inventario":
      return <InventarioView productos={data.productos} />;
    case "clientes":
      return <ClientesView clientes={data.clientes} />;
    case "usuarios":
      return <UsuariosView empleados={data.empleados} />;
    case "ventas":
      return <VentasView productos={data.productos} clientes={data.clientes} user={user} onLogout={onLogout} />;
    case "ventasregistradas":
      return <VentasRegistradasView ventas={data.ventas} clientes={data.clientes} />;
    case "proveedores":
      return <ProveedoresView />;
    default:
      return null;
  }
};

export default DashboardContent;