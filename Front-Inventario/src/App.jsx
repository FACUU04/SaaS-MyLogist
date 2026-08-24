import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import './index.css';

import Login from "./components/Login";
import ResetPassword from "./components/ResetPassword"; 
import Dashboard from "./components/Dashboard";
import DashboardSuperAdmin from "./components/DashboardSuperAdmin";
import ProtectedRoute from "./components/utils/ProtectedRouted";
import { getUserFromToken, hasRole } from "./components/utils/auth";

function App() {
  const [user, setUser] = useState(getUserFromToken());

  const handleLoginSuccess = () => {
    setUser(getUserFromToken());
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        
        {/* RUTAS PÚBLICAS PRIMERO */}
        
        {/* 1. Reset Password - Debe estar libre y arriba */}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* 2. Login */}
        <Route
          path="/login"
          element={
            user
              ? hasRole(user, "ROLE_SUPERADMIN")
                ? <Navigate to="/superadmin" replace />
                : <Navigate to="/" replace />
              : <Login onLoginSuccess={handleLoginSuccess} />
          }
        />

        <Route path="/unauthorized" element={<h2>No autorizado</h2>} />

        {/* RUTAS PROTEGIDAS DESPUÉS */}

        {/* 3. SuperAdmin */}
        <Route
          path="/superadmin"
          element={
            <ProtectedRoute role="ROLE_SUPERADMIN">
              <DashboardSuperAdmin onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* 4. Dashboard (Admin/User) - Ruta raíz al final */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        
        {/* 5. Ruta comodín (opcional, para atrapar errores 404) */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

//Facu0408