import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer-main">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-newsletter">
            <h3>Newsletter</h3>
            <p>Conecta con el flow del Bajo Mundo</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Email" required />
              <button type="submit">Sign Up</button>
            </form>
            <p className="footer-newsletter-text">Al iniciar sesión, aceptas
              nuestros Términos y Condiciones y la Política de Privacidad.</p>
          </div>
          <div className="footer-links">
            <h4>Bajo Mundo</h4>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contacto">Contacto</Link></li>
              <li><a href="#">FAQ's</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Social</h4>
            <ul>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">Facebook</a></li>
              <li><a href="#">Twitter</a></li>
              <li><a href="#">Youtube</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Accesibilidad</a></li>
              <li><a href="#">Soporte</a></li>
              <li><a href="#">Términos y Condiciones</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <img src="/img/logo.png" alt="Bajo Mundo Hub" className="footer-logo" />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
