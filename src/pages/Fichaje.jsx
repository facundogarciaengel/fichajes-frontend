import { useState, useEffect, useRef } from "react";
import moment from "moment-timezone";

const Fichaje = () => {
  const [ubicacion, setUbicacion] = useState(null);
  const [direccion, setDireccion] = useState("📍 Obteniendo...");
  const [mensaje, setMensaje] = useState("");
  const [historial, setHistorial] = useState([]);
  const [cargandoFichaje, setCargandoFichaje] = useState(false);
  const [mostrarCamara, setMostrarCamara] = useState(false);
  const [selfie, setSelfie] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    obtenerUbicacion();
  }, []);

  useEffect(() => {
    if (mostrarCamara && videoRef.current) {
      console.log("🔵 Intentando acceder a la cámara tras renderizar el video...");
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
        .then(stream => {
          videoRef.current.srcObject = stream;
          console.log("📹 Stream asignado al video correctamente:", stream);
        })
        .catch(error => {
          console.error("❌ Error al acceder a la cámara:", error);
          setMensaje("❌ No se pudo acceder a la cámara");
        });
    }
  }, [mostrarCamara]); // Se ejecuta cada vez que `mostrarCamara` cambia a `true`
  
  

  const obtenerUbicacion = async () => {
    if (navigator.geolocation) {
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
      setDireccion(respuesta.ok ? data.direccion : "❌ Dirección no disponible");
    } catch (error) {
      console.error("Error obteniendo dirección:", error);
      setDireccion("❌ Dirección no disponible");
    }
  };

  
  const iniciarCamara = () => {
    console.log("📷 Activando cámara...");
    setMostrarCamara(true); // Esto activará el useEffect que se encargará de asignar el stream
  };
  
  
   
  const capturarSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      // Reducir la resolución de la imagen antes de convertirla a base64
      const width = 240; // Reducimos el tamaño a 240px de ancho
      const height = 180; // Ajustamos la altura proporcionalmente
      canvas.width = width;
      canvas.height = height;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      // Convertimos la imagen a Base64 con calidad reducida
      setSelfie(canvas.toDataURL("image/jpeg", 0.6)); // 0.6 indica una calidad del 60%
      setMostrarCamara(false)
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
          body: JSON.stringify({ coordenadas: ubicacion, imagen: selfie }),
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
      <h1 className="text-2xl font-extrabold mb-3 text-purple-400 text-center">Registrar Fichaje</h1>
      <p className="mb-4 text-sm sm:text-lg text-center flex items-center gap-2">
        Ubicación: {direccion.includes("❌") ? "❌" : "📍"} {direccion}
      </p>

      {mostrarCamara ? (
        <div>
          <video ref={videoRef} autoPlay className="w-full h-auto" />
          <canvas ref={canvasRef} className="hidden" width={240} height={180} />
          <button onClick={capturarSelfie} className="mt-4 bg-green-600 px-4 py-2 rounded-md">Capturar Selfie</button>
        </div>
      ) : (
        selfie ? (
          <div>
            <img src={selfie} alt="Selfie" className="w-32 h-32 rounded-full" />
            <button onClick={fichar} disabled={cargandoFichaje} className={`mt-4 px-4 py-2 rounded-md ${cargandoFichaje ? "bg-gray-500" : "bg-purple-600 hover:bg-purple-700"}`}>
              {cargandoFichaje ? "⏳ Fichando..." : "Confirmar Fichaje"}
            </button>
          </div>
        ) : (
          <button onClick={iniciarCamara} className="bg-blue-500 px-4 py-2 rounded-md">Abrir Cámara</button>
        )
      )}

      {mensaje && <p className="mt-4 text-yellow-400 text-center font-semibold text-sm sm:text-base">{mensaje}</p>}

      <h2 className="text-lg sm:text-xl mt-6 text-purple-300 font-bold text-center">Historial Reciente</h2>
      <ul className="mt-4 w-full space-y-2 sm:space-y-3">
        {historial.map((f, index) => (
          <li key={index} className="bg-gray-800 p-3 sm:p-4 rounded-lg shadow-md flex justify-between items-center border border-gray-700 text-xs sm:text-sm">
            <span className="font-bold text-purple-200">{f.fechaHora}</span>
            <span className={`px-2 sm:px-3 py-1 rounded text-white font-semibold ${f.tipo === "entrada" ? "bg-green-500" : "bg-red-500"}`}>{f.tipo.toUpperCase()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Fichaje;
