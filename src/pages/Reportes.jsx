const Reportes = () => {
    const descargarCSV = () => {
      window.location.href = "http://localhost:3000/api/reportes/fichajes/csv";
    };
  
    const descargarExcel = () => {
      window.location.href = "http://localhost:3000/api/reportes/fichajes/excel";
    };
  
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h2 className="text-2xl font-bold mb-4">Reportes de Fichajes</h2>
        <button onClick={descargarCSV} className="bg-yellow-500 text-white p-2 rounded mb-2">
          Descargar CSV
        </button>
        <button onClick={descargarExcel} className="bg-blue-500 text-white p-2 rounded">
          Descargar Excel
        </button>
      </div>
    );
  };
  
  export default Reportes;
  