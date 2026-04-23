const API_BASE = "/api";
//const API_BASE = "http://192.168.0.14:8080/api";

// HELPERS
const handleResponse = async (res) => {
  const text = await res.text();

  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(data?.message || data || res.statusText);
  }

  return data;
};

// NORMALIZADOR CENTRAL
const normalize = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.content && Array.isArray(data.content)) return data.content;
  return data;
};

const getHeaders = (isJSON = true) => {
  const token = localStorage.getItem("token");
  const headers = {};

  if (isJSON) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return headers;
};


// AUTH
export const loginUser = async (username, password) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    let msg = "Usuario o contraseña incorrectos";
    try {
      const err = await res.json();
      msg = err.message || msg;
    } catch {}
    throw new Error(msg);
  }

  return await res.json();
};


// FUNCIONES GENERICAS
export const fetchData = async (endpoint) => {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await handleResponse(res);
  return normalize(data);
};

export const postData = async (endpoint, body) => {
  console.log(`POST a ${endpoint} con cuerpo:`, JSON.stringify(body));
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
};

export const putData = async (endpoint, body) => {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
};

export const deleteData = async (endpoint) => {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(res);
};


// NEGOCIO (ADMIN) ✅ FIX
export const getNegocio = () => fetchData("negocio");


// ---  FUNCIÓN OPTIMIZADA PARA EL DASHBOARD ---
export const getDashboardResumen = () => fetchData("dashboard/resumen");


export const updateNegocio = (datos) =>
  putData(`negocio`, datos);


// PROVEEDORES
export const getProveedores = () => fetchData("proveedores");

export const createProveedor = (proveedor) =>
  postData("proveedores", proveedor);

export const updateProveedor = (id, proveedor) =>
  putData(`proveedores/${id}`, proveedor);

export const removeProveedor = (id) =>
  deleteData(`proveedores/${id}`);


// PRODUCTOS
export const getProductos = () => fetchData("productos");


// COMPRAS
export const getComprasPorProveedor = (idProveedor) =>
  fetchData(`compras/proveedor/${idProveedor}`);

export const createCompraSimple = (compra) =>
  postData("compras/simple", compra);

export const createCompraMultiple = (compra) =>
  postData("compras/multiple", compra);

export const getDetallesCompra = (idCompra) =>
  fetchData(`compras/${idCompra}/detalles`);


// SUPERADMIN - NEGOCIOS
export const getNegociosSuperAdmin = () =>
  fetchData("superadmin/negocios");

export const createNegocioSuperAdmin = (negocio) =>
  postData("superadmin/negocios", negocio);

export const toggleNegocio = (id) =>
  putData(`superadmin/negocios/${id}/toggle`);

export const deleteNegocioSuperAdmin = (id) =>
  deleteData(`superadmin/negocios/${id}`);


// ADMIN - USUARIOS
export const getUsuariosAdmin = () =>
  fetchData("admin/usuarios");

export const createUsuarioAdmin = (usuario) =>
  postData("admin/usuarios", usuario);

export const toggleUsuarioAdmin = (id) =>
  putData(`admin/usuarios/${id}/toggle`);


// ADMIN - EMPLEADOS
export const getEmpleadosAdmin = () =>
  fetchData("admin/empleados");

export const createEmpleadoAdmin = (empleado) =>
  postData("admin/empleados", empleado);

export const updateEmpleadoAdmin = (id, empleado) =>
  putData(`admin/empleados/${id}`, empleado);

export const deleteEmpleadoAdmin = (id) =>
  deleteData(`admin/empleados/${id}`);

export const reactivarProveedor = async (id) => {
  return await putData(`proveedores/${id}/reactivar`, {});
};


// CAJA Y TURNOS 
export const getTurnoActivo = () => 
  fetchData("turnos/activo");

export const abrirTurno = (montoAperturaFisico) => 
  postData("turnos/abrir", { montoAperturaFisico });

export const cerrarTurno = (montoCierreFisicoReal, observaciones) => 
  postData("turnos/cerrar", { montoCierreFisicoReal, observaciones });


// AUDITORIA
export const getAuditoria = () => fetchData("auditoria");

// NOTAS
export const getNotas = () => fetchData("notas");
export const createNota = (contenido) => postData("notas", { contenido });
export const deleteNota = (id) => deleteData(`notas/${id}`);