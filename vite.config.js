import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Permite conexiones desde cualquier IP
    port: 5173, // Asegurate de que coincida con el puerto donde corre Vite
    strictPort: true, // Evita que cambie el puerto automáticamente
    allowedHosts: ["https://e14b-190-13-225-115.ngrok-free.app"], // Agregar aquí la URL de Ngrok
  },
});
