// Este archivo es el que se encarga de manejar las rutas de la aplicación
import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom'
import Login from './pages/Login'
import Fichaje from './pages/Fichaje'




function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
       <Route path='/fichajes' element={<Fichaje/>} />
      </Routes>
    </Router>
  );
}

export default App;