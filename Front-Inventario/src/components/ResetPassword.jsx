import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react";
import { postData } from "../components/utils/api"; // O tu cliente de API centralizado
import "../styles/Login.css"; // Reutilizamos los mismos estilos limpios del login

 function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      setLoading(true);
      
      // Llamada a tu endpoint de backend /api/auth/reset-password
      await postData("auth/reset-password", {
        token: token,
        newPassword: password
      });

      setSuccess(true);
    } catch (err) {
      setError(err.message || "El enlace es inválido o ha expirado.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="login-screen">
        <div className="login-card" style={{ textAlign: "center" }}>
          <h2 style={{ color: "#ef4444", marginBottom: "16px" }}>Enlace no válido</h2>
          <p style={{ color: "#4b5563", marginBottom: "20px" }}>No se encontró el token de recuperación en el enlace.</p>
          <button onClick={() => navigate("/")} className="submit-button">
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <div className="login-bg-glow"></div>

      <div className="login-card">
        <div className="header-section">
          <div className="logo-container">
            <img src="/icono.png" alt="MyLogist Logo" className="custom-logo" />
          </div>
          <h1 className="login-title">Nueva contraseña</h1>
          <p className="login-subtitle">Ingresá tu nueva clave para acceder a MyLogist</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {success ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
              <CheckCircle2 size={24} /> ¡Contraseña actualizada con éxito!
            </div>
            <button 
              onClick={() => navigate("/")} 
              className="submit-button"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <ArrowLeft size={16} /> Iniciar sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Nueva Contraseña</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="login-input password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="eye-button"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirmar Contraseña</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="login-input"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="submit-button">
              {loading ? "Actualizando..." : "Restablecer contraseña"}
            </button>

            <button 
              type="button" 
              onClick={() => navigate("/")} 
              className="back-to-login"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px' }}
            >
              <ArrowLeft size={16} /> Volver al inicio de sesión
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;