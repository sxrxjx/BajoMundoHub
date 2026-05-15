import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Eventos from './pages/Eventos';
import Comunidad from './pages/Comunidad';
import Artistas from './pages/Artistas';
import About from './pages/About';
import Colabs from './pages/Colabs';
import Login from './pages/Login';
import DashboardUsuario from './pages/DashboardUsuario';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <div className="bg-texture"></div>
        <div className="gradient-overlay"></div>
        
        <Navbar />
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/comunidad" element={<Comunidad />} />
            <Route path="/artistas" element={<Artistas />} />
            <Route path="/about" element={<About />} />
            <Route path="/colabs" element={<Colabs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard-usuario" element={<DashboardUsuario />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
