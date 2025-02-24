import { useState, useEffect } from "react";
import moment from "moment-timezone";
import { motion } from "framer-motion";
import { MapPin, Clock} from "lucide-react";
import Logo from "./Logo";

const Fichaje = () => {
  const [ubicacion, setUbicacion] = useState(null);
  const [direccion, setDireccion] = useState("📍 Obteniendo...");
  const [mensaje, setMensaje] = useState("");
  const [historial, setHistorial] = useState([]);
  const [cargandoFichaje, setCargandoFichaje] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    obtenerUbicacion();
  }, []);

  const obtenerUbicacion = async () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords = `${pos.coords.latitude},${pos.coords.longitude}`;
          setUbicacion(coords);
          await obtenerDireccion(coords);
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
          setDireccion("❌ No se pudo obtener la ubicación");
        }
      );
    } else {
      setDireccion("❌ La geolocalización no está soportada en este dispositivo");
    }
  };

  const obtenerDireccion = async (coords) => {
    try {
      const respuesta = await fetch(
        `https://fichajes-backend.onrender.com/api/obtener-direccion?coordenadas=${coords}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await respuesta.json();
      if (respuesta.ok) {
        setDireccion(data.direccion);
      } else {
        setDireccion("❌ Dirección no disponible");
      }
    } catch (error) {
      console.error("Error obteniendo dirección:", error);
      setDireccion("❌ Dirección no disponible");
    }
  };

  const verificarToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;
  
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp > Math.floor(Date.now() / 1000);
    } catch (error) {
      console.error("Error verificando el token:", error);
      return false;
    }
  };
  
  const fichar = async () => {
    if (!verificarToken()) {
        setMensaje("⚠️ Sesión expirada. Inicie sesión nuevamente.");
        localStorage.removeItem("token");
        setTimeout(() => {
            window.location.href = "/login";
        }, 2000);
        return;
    }

        // 🟣 Mostrar mensaje de actualización de ubicación antes de buscarla
        setDireccion("📍 Obteniendo...");

    // 🔄 Obtener nueva ubicación antes de fichar
    await obtenerUbicacion();

    // ✅ Continuamos con la lógica actual si la ubicación es válida
    if (!ubicacion || direccion.includes("❌")) {
        setMensaje("⚠️ Ubicación no válida, intenta nuevamente.");
        return;
    }

    setCargandoFichaje(true);
    try {
        const respuesta = await fetch(
            "https://fichajes-backend.onrender.com/api/fichajes",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ coordenadas: ubicacion }),
            }
        );

        const data = await respuesta.json();
        if (respuesta.ok) {
            setMensaje(`✅ Fichaje registrado: ${data.fichaje.tipo.toUpperCase()}`);
            setHistorial((prev) => [
                {
                    ...data.fichaje,
                    fechaHora: moment(data.fichaje.fechaHora)
                        .tz("America/Argentina/Buenos_Aires")
                        .format("DD/MM/YYYY HH:mm:ss"),
                },
                ...prev.slice(0, 4),
            ]);
        } else {
            setMensaje(`⚠️ ${data.mensaje || "Error al registrar fichaje"}`);
        }
    } catch (error) {
        console.error("Error al fichar:", error);
        setMensaje("❌ No se pudo conectar con el servidor.");
    }
    setCargandoFichaje(false);
};

  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-4 py-6 sm:px-6 sm:py-10 w-full max-w-md mx-auto">
     <div className="flex flex-col items-center">
  <Logo size="220px" />
  <motion.h1
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className="text-3xl sm:text-4xl font-extrabold text-purple-400 text-center mt-2 mb-6 font-poppins"
  >
    Registrar Fichaje
  </motion.h1>
</div>

<div className="w-full flex flex-col items-center space-y-6">

<motion.p
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
  className="mb-4 text-sm sm:text-lg text-center text-gray-300 flex items-center justify-center gap-2"
>
  {direccion === "📍 Obteniendo..." ? (
    <>
      <MapPin size={18} className="text-purple-400 animate-pulse" />
      <span>Obteniendo ubicación...</span>
    </>
  ) : (
    direccion
  )}
</motion.p>







{/* Botón Fichar */}
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  onClick={fichar}
  disabled={cargandoFichaje}
  className={`w-full px-6 py-4 sm:px-8 sm:py-5 
    ${cargandoFichaje ? "bg-gray-500 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"} 
    transition-all rounded-lg text-white font-bold shadow-lg hover:shadow-xl 
    flex items-center justify-center gap-2 text-sm sm:text-base font-poppins`}
>
  {cargandoFichaje ? (
    <>
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        <Clock size={20} className="animate-spin" />
      </motion.div>
      <span className="animate-pulse">Fichando...</span>
    </>
  ) : (
    <>
      <Clock size={20} />
      Fichar
    </>
  )}
</motion.button>


<h2 className="text-lg sm:text-xl mt-6 text-purple-300 font-bold text-center">
Historial Reciente
</h2>
</div>
<div className="mt-4 w-full max-h-56 overflow-y-auto">
  <ul className="space-y-2 sm:space-y-3">
    {historial.map((f, index) => (
      <motion.li
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="bg-gray-800 p-2 sm:p-3 rounded-lg shadow-md flex justify-between items-center border border-gray-700 text-xs sm:text-sm"
      >
        <span className="font-bold text-purple-200 text-xs sm:text-sm">
          {f.fechaHora}
        </span>
        <span
          className={`px-2 sm:px-3 py-1 rounded font-semibold shadow-md ${
            f.tipo === "entrada"
              ? "bg-green-400 text-green-900" // 🌿 Color más suave para Entrada
              : "bg-red-400 text-red-900" // 🔴 Color menos agresivo para Salida
          }`}
        >
          {f.tipo.toUpperCase()}
        </span>
      </motion.li>
    ))}
  </ul>
</div>


    </div>
  );
};

export default Fichaje;
