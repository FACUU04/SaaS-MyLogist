import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import './index.css';

import Login from "./components/Login";
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

        {/* LOGIN */}
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

        {/* SUPERADMIN */}
        <Route
          path="/superadmin"
          element={
            <ProtectedRoute role="ROLE_SUPERADMIN">
              <DashboardSuperAdmin onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* ADMIN + USER */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route path="/unauthorized" element={<h2>No autorizado</h2>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;


//Facu0408