import { jwtDecode } from "jwt-decode";

export const getUserFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    // Leemos también los datos adicionales que hayas guardado al hacer login
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");

    return {
      username: decoded.sub,
      roles: decoded.roles || [],
      token,
      ...userData // Inyecta permisoVentas, permisoInventario, etc.
    };
  } catch (e) {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    return null;
  }
};

export const hasRole = (user, role) => {
  return user?.roles?.includes(role);
};

// NUEVA FUNCIÓN: Verifica permisos granulares
export const hasPermission = (user, permissionName) => {
  if (!user) return false;
  // El Admin y Superadmin siempre ven todo
  if (hasRole(user, "ROLE_ADMIN") || hasRole(user, "ROLE_SUPERADMIN")) return true;
  // Si es empleado, chequea su booleano específico
  return user[permissionName] === true;
};