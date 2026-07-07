import { useState } from "react";
import { User, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { loginUser } from "../components/utils/api";
import "../styles/Login.css";

export default function Login({ onLoginSuccess }) {
  const [view, setView] = useState("login"); 
  
  const [form, setForm] = useState({ username: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const data = await loginUser(form.username, form.password);

      const token = data.accessToken || data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("userData", JSON.stringify(data));

      onLoginSuccess();
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      // Lógica de recuperación de contraseña
      console.log("Enviando mail a:", forgotEmail);
      alert("Si el usuario existe, se enviaron las instrucciones a tu correo.");
      setView("login");
    } catch (err) {
      setError(err.message || "Error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-bg-glow"></div>

      <div className="login-card">
        {view === "login" ? (
          <>
            <div className="header-section">
              <div className="logo-container">
                {/* ACÁ VA TU LOGO: Reemplazá "/assets/logo.png" por tu ruta */}
                <img 
                  src="/src/icon.svg" 
                  alt="MyLogist Logo" 
                  className="custom-logo" 
                />
              </div>
              <h1 className="login-title">MyLogist</h1>
              <p className="login-subtitle">Ingresá a tu panel de control</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleLoginSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label">Usuario</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Ingrese su usuario"
                    required
                    className="login-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label className="form-label">Contraseña</label>
                  <button 
                    type="button" 
                    onClick={() => { setView("forgot"); setError(""); }} 
                    className="forgot-link"
                  >
                    ¿Olvidaste tu clave?
                  </button>
                </div>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
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

              <button type="submit" disabled={loading} className="submit-button">
                {loading ? "Ingresando..." : "Ingresar a mi cuenta"}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="header-section">
              <div className="logo-container">
                {/* EL MISMO LOGO ACÁ PARA LA VISTA DE RECUPERACIÓN */}
                <img 
                  src="/assets/logo.png" 
                  alt="MyLogist Logo" 
                  className="custom-logo" 
                />
              </div>
              <h1 className="login-title">Recuperar clave</h1>
              <p className="login-subtitle">Ingresá tu correo para reestablecer el acceso</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleForgotSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label">Correo Electrónico</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="ejemplo@empresa.com"
                    required
                    className="login-input"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="submit-button">
                {loading ? "Procesando..." : "Enviar enlace de recuperación"}
              </button>

              <button 
                type="button" 
                onClick={() => { setView("login"); setError(""); }} 
                className="back-to-login"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px' }}
              >
                <ArrowLeft size={16} /> Volver al inicio de sesión
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}