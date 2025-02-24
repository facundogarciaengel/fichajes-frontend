/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
  server: {
    host: true, // Permite que el servidor sea accesible desde cualquier IP
    cors: true, // Habilita CORS para permitir peticiones desde cualquier origen
    allowedHosts: 'all', // Permite conexiones desde cualquier host
  }
}

