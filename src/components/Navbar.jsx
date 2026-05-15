import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <img src="/img/logo.png" alt="Bajo Mundo Hub" className="logo-base" />
          <img src="/img/logo_grad.png" alt="Bajo Mundo Hub" className="logo-hover" />
        </Link>
        <div className="nav-links">
          <Link to="/eventos">Eventos</Link>
          <Link to="/comunidad">Comunidad</Link>
          <Link to="/artistas">Artistas</Link>
          <Link to="/about">About</Link>
          <Link to="/colabs">Colabs</Link>
          <Link to="/login" className="login-btn">Log In</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
