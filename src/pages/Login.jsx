import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"; // Importación correcta

const Login = () => {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const navigate = useNavigate();

  // Validaciones
  const validarDni = (valor) => /^[0-9]{7,9}$/.test(valor);
  const validarPassword = (valor) => valor.length >= 6;

  const handleLogin = async () => {
    if (!validarDni(dni)) {
      setMensaje("⚠️ El DNI debe contener entre 7 y 9 dígitos.");
      return;
    }
    if (!validarPassword(password)) {
      setMensaje("⚠️ La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setCargando(true);
    setMensaje("");
    try {
      const respuesta = await fetch("https://fichajes-backend.onrender.com/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni, password }),
      });
      const data = await respuesta.json();
      if (respuesta.ok) {
        localStorage.setItem("token", data.token);
        setMensaje("✅ Inicio de sesión exitoso");
        setTimeout(() => navigate("/fichajes"), 1500);
      } else {
        setMensaje("⚠️ " + (data.mensaje || "Credenciales incorrectas"));
      }
    } catch (error) {
      console.error("Error en el login:", error);
      setMensaje("❌ Error de conexión con el servidor");
    }
    setCargando(false);
  };

  return (
<div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-4 py-6 sm:px-6 sm:py-10 w-full max-w-md mx-auto">
<h1 className="text-2xl sm:text-3xl font-extrabold mb-6 text-purple-400 text-center">
        Fingertech Login
      </h1>

      {/* Input DNI */}
      <input
        type="text"
        placeholder="DNI"
        value={dni}
        onChange={(e) => {
          if (/^\d*$/.test(e.target.value)) setDni(e.target.value);
        }}
        className="w-full p-4 mb-4 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      {/* Input Contraseña con botón de mostrar/ocultar */}
      <div className="relative w-full">
        <input
          type={mostrarPassword ? "text" : "password"}
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 pr-12 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="button"
          onClick={() => setMostrarPassword(!mostrarPassword)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white transition"
        >
          {mostrarPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      {/* Botón Ingresar */}
      <button
        onClick={handleLogin}
        disabled={cargando}
        className={`w-full px-6 py-4 mt-6 ${
          cargando ? "bg-gray-500 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
        } transition-all rounded-lg text-white font-bold shadow-lg flex items-center justify-center gap-2 text-lg`}
      >
        {cargando ? "⏳ Iniciando sesión..." : "Ingresar"}
      </button>

      {/* Mensajes de validación */}
      {mensaje && (
        <p className="mt-4 text-yellow-400 text-center font-semibold text-sm sm:text-base">
          {mensaje}
        </p>
      )}
    </div>
  );
};

export default Login;
