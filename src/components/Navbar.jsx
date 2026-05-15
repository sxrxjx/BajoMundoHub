import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={scrolled ? 'nav-scrolled' : ''}>
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
