import {
  FiHome,
  FiBox,
  FiShoppingCart,
  FiUsers,
  FiUserPlus,
  FiTruck
} from "react-icons/fi";
import { getUserFromToken, hasPermission, hasRole } from "../../src/components/utils/auth"; 

export default function Sidebar({ selected, setSelected }) {
  const user = getUserFromToken();

  const allItems = [
    { key: "dashboard", label: "Inicio", icon: <FiHome />, show: hasRole(user, "ROLE_ADMIN") },
    { key: "ventas", label: "Ventas", icon: <FiShoppingCart />, show: hasPermission(user, "permisoVentas") },
    { key: "clientes", label: "Clientes", icon: <FiUserPlus />, show: hasPermission(user, "permisoVentas") }, 
    { key: "inventario", label: "Almacén", icon: <FiBox />, show: hasPermission(user, "permisoInventario") },
    { key: "proveedores", label: "Proveedores", icon: <FiTruck />, show: hasPermission(user, "permisoProveedores") },
    { key: "usuarios", label: "Equipo", icon: <FiUsers />, show: hasRole(user, "ROLE_ADMIN") },
  ];

  const items = allItems.filter(item => item.show);

  return (
    <div className="sidebar">
      <h2 className="sidebar-logo">My<span>Logist</span></h2>
      <ul>
        {items.map(item => (
          <li
            key={item.key}
            className={selected === item.key ? "active" : ""}
            onClick={() => setSelected(item.key)}
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}