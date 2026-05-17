import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Eventos from './pages/Eventos';
import Artistas from './pages/Artistas';
import Comunidad from './pages/Comunidad';
import About from './pages/About';
import Colabs from './pages/Colabs';
import Login from './pages/Login';
import DashboardUsuario from './pages/DashboardUsuario';
import './index.css';

import Perfil from './pages/Perfil';
import Mensajes from './pages/Mensajes';
import MiContenido from './pages/MiContenido';
import Ajustes from './pages/Ajustes';
import Notificaciones from './pages/Notificaciones';

// Componente para manejar la visibilidad de los elementos comunes
function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard') || 
                      location.pathname === '/perfil' || 
                      location.pathname === '/mensajes' ||
                      location.pathname === '/mi-contenido' ||
                      location.pathname === '/ajustes' ||
                      location.pathname === '/notificaciones';

  return (
    <>
      {!isDashboard && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/artistas" element={<Artistas />} />
          <Route path="/comunidad" element={<Comunidad />} />
          <Route path="/about" element={<About />} />
          <Route path="/colabs" element={<Colabs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard-usuario" element={<DashboardUsuario />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/mensajes" element={<Mensajes />} />
          <Route path="/mi-contenido" element={<MiContenido />} />
          <Route path="/ajustes" element={<Ajustes />} />
          <Route path="/notificaciones" element={<Notificaciones />} />
        </Routes>
      </main>
      {!isDashboard && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
