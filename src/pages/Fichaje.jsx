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
          console.log(coords);
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
    console.log("🔵 Obteniendo dirección de las coordenadas:", coords);
    try {
      const respuesta = await fetch(
        `https://fichajes-backend.onrender.com/api/obtener-direccion?coordenadas=${coords}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await respuesta.json();
      console.log("📍 Respuesta de la API de geolocalización:", data);
      if (respuesta.ok && data.direccion) {
        setDireccion(data.direccion);
      } else {
        console.warn("⚠️ No se encontró dirección para estas coordenadas:", coords);
        setDireccion("❌ Dirección no disponible");
      }
    } catch (error) {
      console.error("Error obteniendo dirección:", error);
      setDireccion("❌ Error al obtener dirección");
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

  const actualizarHistorial = async () => {
    try {
      const respuesta = await fetch("https://fichajes-backend.onrender.com/api/fichajes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await respuesta.json();
      if (respuesta.ok) {
        setHistorial(data.fichajes);
      }
    } catch (error) {
      console.error("Error al actualizar historial:", error);
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
        setSelfie(null);
        setMostrarCamara(false);
        await actualizarHistorial();
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
      {selfie ? (
        <div>
          <img src={selfie} alt="Selfie" className="w-32 h-32 rounded-full" />
          <button onClick={fichar} disabled={!selfie || cargandoFichaje} className="mt-4 px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700">
            {cargandoFichaje ? "⏳ Fichando..." : "Confirmar Fichaje"}
          </button>
          <button onClick={() => { setSelfie(null); setMostrarCamara(true); }} className="mt-2 bg-red-500 px-4 py-2 rounded-md text-white">
            Tomar otra selfie
          </button>
        </div>
      ) : (
        <button onClick={() => setMostrarCamara(true)} className="bg-blue-500 px-4 py-2 rounded-md">Abrir Cámara</button>
      )}
    </div>
  );
};

export default Fichaje;
