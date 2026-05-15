import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider 
} from 'firebase/auth';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Iniciar Sesión
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Registrarse
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/'); // Redirigir a la home tras éxito
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Email o contraseña incorrectos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este email ya está registrado.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setError('Ha ocurrido un error. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err) {
      setError('Error al conectar con Google.');
    }
  };

  return (
    <div className="login-page">
      <Link to="/" className="login-back-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        VOLVER
      </Link>

      <div className="login-card">
        <div className="login-header">
          <img src="/img/logo.png" alt="Bajo Mundo" className="login-logo" />
          <h2 className="login-welcome">
            {isLogin ? 'BIENVENIDO DE NUEVO' : 'ÚNETE AL MOVIMIENTO'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isLogin ? 'Entra y conecta con el flow' : 'Crea tu cuenta de artista o fan'}
          </p>
        </div>

        <div className="login-tabs">
          <button 
            className={`login-tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            ENTRAR
          </button>
          <button 
            className={`login-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            REGISTRO
          </button>
        </div>

        {error && <div className="login-error" style={{ color: 'var(--primary)', marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              placeholder="tu@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <div className="form-footer">
            <label className="remember-me">
              <input type="checkbox" /> Recordarme
            </label>
            <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'CARGANDO...' : (isLogin ? 'INICIAR SESIÓN' : 'CREAR CUENTA')}
          </button>
        </form>

        <div className="social-divider">
          <span className="divider-line"></span>
          <span className="divider-text">O CONTINÚA CON</span>
        </div>

        <div className="social-login">
          <button className="social-btn" onClick={handleGoogleLogin}>GOOGLE</button>
        </div>

        <p className="login-footer">
          {isLogin ? '¿No tienes cuenta?' : '¿Ya eres del Bajo Mundo?'}
          <span 
            className="link-primary-bold" 
            style={{ cursor: 'pointer' }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'REGÍSTRATE' : 'ENTRA AQUÍ'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
