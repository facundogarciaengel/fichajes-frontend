import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Logo from "./Logo";
import { motion } from "framer-motion";


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
    <div className="w-full h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-sm bg-gray-800 shadow-lg rounded-lg py-12 px-6 sm:px-8 text-white">
      <div className="flex flex-col items-center gap-3">
          {/* Logo */}
      <Logo size="200px" />
      <motion.h1
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: "easeOut" }}
  className="text-xl sm:text-2xl font-bold text-center text-purple-400 font-poppins"
>
  Bienvenido a FingerCloud
</motion.h1>
        </div>
        <motion.p
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1.2, ease: "easeOut" }}
  className="text-sm text-gray-300 text-center mt-2 font-poppins"
>
  Ingrese sus datos para continuar
</motion.p>

      {/* Input DNI */}
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: "easeOut" }}
  className="mb-4"
>
  <label htmlFor="dni" className="block text-sm font-medium text-gray-300">
    DNI
  </label>
  <input
  type="text"
  id="dni"
  placeholder="Ingrese su DNI"
  value={dni}
  onChange={(e) => {
    if (/^\d*$/.test(e.target.value)) setDni(e.target.value);
  }}
  className="w-full px-4 py-3 bg-gray-700 text-white rounded-md border border-gray-600 
    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 
    transition-all duration-300 shadow-sm focus:shadow-purple-600/50 
    autofill:bg-gray-700 autofill:text-white autofill:border-purple-500"
/>

</motion.div>

{/* Input Contraseña con botón de mostrar/ocultar */}
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
  className="mb-4"
>
  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
    Contraseña
  </label>
  <div className="relative w-full">
  <input
  type={mostrarPassword ? "text" : "password"}
  id="password"
  placeholder="Ingrese su contraseña"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="w-full px-4 py-3 pr-12 bg-gray-700 text-white rounded-md border border-gray-600 
    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 
    transition-all duration-300 shadow-sm focus:shadow-purple-600/50 
    autofill:bg-gray-700 autofill:text-white autofill:border-purple-500"
/>
<button
  type="button"
  onClick={() => setMostrarPassword(!mostrarPassword)}
  className={`absolute right-4 top-1/2 transform -translate-y-1/2 bg-transparent p-1 
    transition text-gray-400 hover:text-white focus:text-white
    ${mostrarPassword ? "text-purple-400" : ""}`}
>
  {mostrarPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
</button>

  </div>
</motion.div>

{/* Botón de Iniciar Sesión */}
        <button
  onClick={handleLogin}
  disabled={cargando}
  className={`w-full px-6 py-3 mt-6 ${
    cargando ? "bg-gray-500" : "bg-purple-600 hover:bg-purple-700"
  } transition-all duration-200 transform hover:scale-105 active:scale-95 
  shadow-lg hover:shadow-purple-500/50 rounded-lg text-white font-bold 
  flex items-center justify-center gap-2`}
>
  {cargando ? (
    <>
      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple-500 mr-2"></div>
      Iniciando sesión...
    </>
  ) : "Ingresar"}
</button>


        {/* Mensajes de validación */}
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
