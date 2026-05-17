import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { updatePassword, signOut, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { motion } from 'framer-motion';
import NotificationsBalloon from '../components/NotificationsBalloon';

function Ajustes() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // States for password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [updating, setUpdating] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const unsubUser = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
          setLoading(false);
        });
        return () => unsubUser();
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    if (!currentPassword) {
      setMessage({ type: 'error', text: 'Debes introducir tu contraseña actual.' });
      return;
    }

    setUpdating(true);
    setMessage({ type: '', text: 'Actualizando contraseña...' });

    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      
      // Reautenticar primero
      await reauthenticateWithCredential(user, credential);
      
      // Si la reautenticación es correcta, actualizar
      await updatePassword(user, newPassword);
      
      setMessage({ type: 'success', text: '¡Contraseña actualizada con éxito!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setMessage({ type: 'error', text: 'La contraseña actual es incorrecta.' });
      } else {
        setMessage({ type: 'error', text: 'Hubo un error al cambiar la contraseña.' });
      }
    } finally {
      setUpdating(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error cerrando sesión:", error);
    }
  };

  if (loading) return <div className="loading">CARGANDO...</div>;

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR (Idéntico a las otras vistas) */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-profile">
          <div className="profile-img-container">
            <img src={userData?.profilePic || "/img/perfil-6.png"} alt="Profile" className="profile-img" />
          </div>
          <h2 className="profile-name">
            {userData?.firstName ? (
              <>{userData.firstName.toUpperCase()}<br />{userData?.lastName?.toUpperCase()}</>
            ) : (
              <>BAJO<br />MUNDO</>
            )}
          </h2>
          <p className="profile-email">{userData?.email}</p>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li><Link to="/dashboard-usuario"><span className="icon">🏠</span> Inicio</Link></li>
            <li><Link to="/perfil"><span className="icon">👤</span> Perfil</Link></li>
            <li>
              <Link to="/mensajes" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <span className="icon">💬</span> Mensajes
                {userData?.unreadMessagesFrom?.length > 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    background: '#ff5f56',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    boxShadow: '0 0 5px rgba(255,95,86,0.5)'
                  }}>
                    {userData.unreadMessagesFrom.length}
                  </span>
                )}
              </Link>
            </li>
            <li style={{ position: 'relative' }}>
              <button 
                onClick={() => window.innerWidth <= 900 ? navigate('/notificaciones') : setShowNotifications(!showNotifications)}
                className={`nav-btn ${showNotifications ? 'active' : ''}`}
                style={{ position: 'relative' }}
              >
                <span className="icon">🔔</span> Notificaciones
                {userData?.notifications?.filter(n => n.active).length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '8px',
                    right: '10px',
                    background: '#ff5f56',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    boxShadow: '0 0 5px rgba(255,95,86,0.5)'
                  }}>
                    {userData.notifications.filter(n => n.active).length}
                  </span>
                )}
              </button>
              <NotificationsBalloon 
                isOpen={showNotifications} 
                onClose={() => setShowNotifications(false)} 
              />
            </li>
            <li className="active"><Link to="/ajustes"><span className="icon">⚙️</span> Ajustes</Link></li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <Link to="/">
            <img src="/img/logo.png" alt="Logo" className="sidebar-logo" />
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="dashboard-main" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="content-header"
          style={{ marginBottom: '2rem' }}
        >
          <h1 style={{ fontFamily: 'Bungee', color: 'var(--lemon)', fontSize: '2.5rem', margin: 0 }}>AJUSTES</h1>
          <p style={{ color: 'var(--text-muted)' }}>Configura tu cuenta y seguridad.</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', maxWidth: '1000px', flexGrow: 1 }}>
          {/* SEGURIDAD - CONTRASEÑA */}
          <div style={{ background: '#120804', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2rem' }}>
            <h3 style={{ fontFamily: 'Bungee', color: 'white', marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🔒 SEGURIDAD
            </h3>
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Contraseña Actual</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Introduce tu contraseña actual"
                  style={{ width: '100%', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Nueva Contraseña</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Escribe tu nueva contraseña"
                  style={{ width: '100%', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Confirmar Contraseña</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Vuelve a escribirla"
                  style={{ width: '100%', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                />
              </div>
              
              {message.text && (
                <div style={{ color: message.type === 'error' ? '#ff5f56' : 'var(--lemon)', fontSize: '0.9rem', fontWeight: 'bold', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', textAlign: 'center' }}>
                  {message.text}
                </div>
              )}

              <button 
                type="submit" 
                disabled={updating || !currentPassword || !newPassword || !confirmPassword}
                style={{ 
                  background: (updating || !currentPassword || !newPassword || !confirmPassword) ? '#333' : 'var(--lemon)', 
                  color: (updating || !currentPassword || !newPassword || !confirmPassword) ? 'gray' : 'black', 
                  padding: '1rem', 
                  borderRadius: '10px', 
                  fontFamily: 'Bungee', 
                  cursor: (updating || !currentPassword || !newPassword || !confirmPassword) ? 'not-allowed' : 'pointer',
                  border: 'none',
                  marginTop: '0.5rem',
                  transition: '0.3s'
                }}
              >
                {updating ? 'ACTUALIZANDO...' : 'CAMBIAR CONTRASEÑA ➔'}
              </button>
            </form>
          </div>

          {/* SESIÓN */}
          <div style={{ background: '#120804', border: '1px solid rgba(255,95,86,0.3)', borderRadius: '20px', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontFamily: 'Bungee', color: '#ff5f56', marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🛑 SESIÓN
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>Al cerrar sesión, no recibirás notificaciones en tiempo real en este dispositivo.</p>
            <button 
              onClick={handleLogout}
              style={{ 
                background: 'rgba(255,95,86,0.1)', 
                color: '#ff5f56', 
                padding: '1rem', 
                borderRadius: '10px', 
                fontFamily: 'Bungee', 
                cursor: 'pointer',
                border: '1px solid rgba(255,95,86,0.5)',
                width: '100%',
                transition: '0.3s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,95,86,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,95,86,0.1)'}
            >
              CERRAR SESIÓN DEL BARRIO ➔
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Ajustes;
