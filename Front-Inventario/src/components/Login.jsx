import { useState } from "react";
import { loginUser } from "../components/utils/api";
import "../styles/Login.css";

export default function Login({ onLoginSuccess }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const data = await loginUser(form.username, form.password);
      
      // ÚNICA FUENTE DE VERDAD
      const token = data.accessToken || data.token;
      localStorage.setItem("token", token);

      // NUEVO: Guardamos toda la información extra (roles, permisos, id del negocio)
      localStorage.setItem("userData", JSON.stringify(data));

      // Avisamos al App que hay sesión
      onLoginSuccess();

    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Iniciar Sesión</h2>

        {error && <p className="error">{error}</p>}

        <input
          name="username"
          placeholder="Usuario"
          value={form.username}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}