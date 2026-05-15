import { Link } from 'react-router-dom';
import { useState } from 'react';

function Login() {
  const [activeTab, setActiveTab] = useState('Usuario');

  return (
    <div className="login-page-wrapper">
      <div className="login-page">
        <Link to="/" className="login-back-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>VOLVER</span>
        </Link>
        <div className="login-card">
          <div className="login-header">
            <img src="/img/logo.png" alt="Logo" className="login-logo" />
            <h2 className="login-welcome">Bienvenido al Hub</h2>
          </div>

          <div className="login-tabs">
            {['Usuario', 'Artista', 'Empresa'].map(tab => (
              <button 
                key={tab}
                className={`login-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="tu@email.com" required />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" placeholder="••••••••" required />
            </div>
            <div className="form-footer">
              <label className="remember-me">
                <input type="checkbox" /> Recuérdame
              </label>
              <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
            </div>
            <button type="submit" className="btn btn-primary btn-full">Entrar</button>
          </form>

          <div className="social-divider">
            <span className="divider-text">O continúa con</span>
            <div className="divider-line"></div>
          </div>

          <div className="social-login">
            <button className="social-btn" style={{ width: '100%' }}>Google</button>
          </div>

          <p className="login-footer">
            ¿No tienes cuenta? <a href="#" className="link-primary-bold">REGÍSTRATE</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
