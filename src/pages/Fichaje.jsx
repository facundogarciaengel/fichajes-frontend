import { useState, useEffect } from "react";
import moment from "moment-timezone";

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

  const fichar = async () => {
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
            Authorization: `Bearer ${token}`,
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
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-3 text-purple-400 text-center">
        Registrar Fichaje
      </h1>
      <p className="mb-4 text-sm sm:text-lg text-center flex items-center gap-2">
        Ubicación: {direccion.includes("❌") ? "❌" : "📍"} {direccion}
      </p>
      <button
        onClick={fichar}
        disabled={cargandoFichaje}
        className={`w-full px-4 py-3 sm:px-6 sm:py-4 ${
          cargandoFichaje
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-purple-600 hover:bg-purple-700"
        } transition-all rounded-lg text-white font-bold shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base`}
      >
        {cargandoFichaje ? "⏳ Fichando..." : "📌 Fichar"}
      </button>
      {mensaje && (
        <p className="mt-4 text-yellow-400 text-center font-semibold text-sm sm:text-base">
          {mensaje}
        </p>
      )}
      <h2 className="text-lg sm:text-xl mt-6 text-purple-300 font-bold text-center">
        Historial Reciente
      </h2>
      <ul className="mt-4 w-full space-y-2 sm:space-y-3">
        {historial.map((f, index) => (
          <li
            key={index}
            className="bg-gray-800 p-3 sm:p-4 rounded-lg shadow-md flex justify-between items-center border border-gray-700 text-xs sm:text-sm"
          >
            <span className="font-bold text-purple-200">{f.fechaHora}</span>
            <span
              className={`px-2 sm:px-3 py-1 rounded text-white font-semibold ${
                f.tipo === "entrada" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {f.tipo.toUpperCase()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Fichaje;
