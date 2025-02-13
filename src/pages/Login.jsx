import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 shadow-lg rounded-lg w-full max-w-md mx-auto py-8 px-6 sm:px-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-center mb-6 text-purple-400">
          Bienvenido a Fingertech
        </h1>

        <div className="mb-4">
          <label htmlFor="dni" className="block text-sm font-medium text-gray-300">DNI</label>
          <input
            type="text"
            id="dni"
            placeholder="Ingrese su DNI"
            value={dni}
            onChange={(e) => {
              if (/^\d*$/.test(e.target.value)) setDni(e.target.value);
            }}
            className="w-full px-4 py-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">Contraseña</label>
          <div className="relative w-full">
            <input
              type={mostrarPassword ? "text" : "password"}
              id="password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-transparent p-1 text-gray-400 hover:text-white transition"
            >
              {mostrarPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={cargando}
          className={`w-full px-6 py-3 mt-4 ${
            cargando ? "bg-gray-500" : "bg-purple-600 hover:bg-purple-700"
          } transition-all rounded-lg text-white font-bold shadow-lg flex items-center justify-center gap-2`}
        >
          {cargando ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple-500 mr-2"></div>
              Iniciando sesión...
            </>
          ) : "Ingresar"}
        </button>

        {mensaje && (
          <div className="mt-4 text-center">
            <p className={`text-sm sm:text-base font-semibold ${mensaje.startsWith("✅") ? "text-green-500" : "text-yellow-400"}`}>
              {mensaje}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;