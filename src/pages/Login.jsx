import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('usuario'); // Default role
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Obtener el rol de Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Redirigir según el rol
          if (userData.role === 'artista') navigate('/dashboard-artista');
          else if (userData.role === 'empresa') navigate('/dashboard-empresa');
          else navigate('/dashboard-usuario');
        } else {
          navigate('/dashboard-usuario');
        }
      } else {
        // REGISTRO
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Guardar el rol en Firestore
        await setDoc(doc(db, 'users', user.uid), {
          email: email,
          role: role,
          createdAt: new Date().toISOString()
        });

        // Redirigir según el rol elegido
        if (role === 'artista') navigate('/dashboard-artista');
        else if (role === 'empresa') navigate('/dashboard-empresa');
        else navigate('/dashboard-usuario');
      }
    } catch (err) {
      console.error("Firebase Error Code:", err.code);
      console.error("Firebase Error Message:", err.message);
      
      if (err.code === 'auth/invalid-credential') {
        setError('Email o contraseña incorrectos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este email ya está registrado. Prueba a entrar en lugar de registrarte.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña es demasiado corta (mínimo 6 caracteres).');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Error de conexión. Revisa tu internet.');
      } else if (err.code === 'auth/configuration-not-found') {
        setError('Error de configuración: ¿Has activado el Login por Email en la consola de Firebase?');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
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
            {isLogin ? 'BIENVENIDO' : 'CREA TU CUENTA'}
          </h2>
        </div>

        <div className="login-tabs">
          <button className={`login-tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>ENTRAR</button>
          <button className={`login-tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>REGISTRO</button>
        </div>

        {!isLogin && (
          <div className="role-selector" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {['usuario', 'artista', 'empresa'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                style={{
                  flex: 1,
                  padding: '0.6rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: role === r ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: '0.3s'
                }}
              >
                {r}
              </button>
            ))}
          </div>
        )}

        {error && <div style={{ color: 'var(--primary)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'CARGANDO...' : (isLogin ? 'ENTRAR' : 'CONTINUAR')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
