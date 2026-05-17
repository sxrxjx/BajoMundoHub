import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, onSnapshot, updateDoc, arrayRemove } from 'firebase/firestore';
import { motion } from 'framer-motion';

function Notificaciones() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubAuth = () => {};
    let unsubSnapshot = () => {};

    unsubAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        unsubSnapshot = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            const notifs = data.notifications || [];
            notifs.sort((a, b) => b.time - a.time);
            setNotifications(notifs);
          }
          setLoading(false);
        }, (error) => {
          console.error("Firestore onSnapshot error:", error);
          setLoading(false);
        });
      } else {
        navigate('/login');
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      unsubSnapshot();
    };
  }, [navigate]);

  const handleClear = async (notif) => {
    const user = auth.currentUser;
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          notifications: arrayRemove(notif)
        });
      } catch (err) {
        console.error("Error clearing notification", err);
      }
    }
  };

  const handleClearAll = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          notifications: []
        });
      } catch (err) {
        console.error("Error clearing all notifications", err);
      }
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'ahora';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `hace ${seconds} seg`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `hace ${hours} h`;
    const days = Math.floor(hours / 24);
    return `hace ${days} días`;
  };

  if (loading) return <div className="loading">CARGANDO...</div>;

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-profile">
          <div className="profile-img-container">
            <img src={userData?.profilePic || "/img/perfil-6.png"} alt="Profile" className="profile-img" />
          </div>
          <h2 className="profile-name">
            {userData?.firstName ? (
              <>{userData.firstName.toUpperCase()}<br />{userData.lastName?.toUpperCase()}</>
            ) : (
              <>BAJO<br />MUNDO</>
            )}
          </h2>
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
            <li className="active" style={{ position: 'relative' }}>
              {/* Escritorio */}
              <Link 
                to="/notificaciones"
                className="nav-btn active desktop-only-nav"
                style={{ position: 'relative' }}
              >
                <span className="icon">🔔</span> Notificaciones
                {notifications.filter(n => n.active).length > 0 && (
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
                    {notifications.filter(n => n.active).length}
                  </span>
                )}
              </Link>

              {/* Móvil */}
              <Link 
                to="/notificaciones"
                className="nav-btn active mobile-only-nav"
                style={{ position: 'relative' }}
              >
                <span className="icon">🔔</span> Notificaciones
                {notifications.filter(n => n.active).length > 0 && (
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
                    {notifications.filter(n => n.active).length}
                  </span>
                )}
              </Link>
            </li>
            <li><Link to="/ajustes"><span className="icon">⚙️</span> Ajustes</Link></li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <Link to="/">
            <img src="/img/logo.png" alt="Logo" className="sidebar-logo" />
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="dashboard-main">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="notifications-page-wrapper"
          style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}
        >
          <header className="profile-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 className="bungee-font" style={{ fontSize: '3rem', color: 'var(--lemon)', textShadow: '3px 3px 0px var(--primary)', marginBottom: '0.5rem' }}>ALERTAS</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontWeight: '700' }}>Tus notificaciones y avisos del Bajo Mundo</p>
            </div>
            {notifications.length > 0 && (
              <button 
                onClick={handleClearAll}
                className="btn"
                style={{ 
                  padding: '0.8rem 1.5rem', 
                  fontSize: '0.9rem', 
                  background: 'rgba(255, 60, 0, 0.1)', 
                  border: '1px solid var(--primary)',
                  color: 'white' 
                }}
              >
                LIMPIAR TODO
              </button>
            )}
          </header>

          <div className="widget-box" style={{ background: '#1a0a04', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '2rem' }}>
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '4rem 1rem' }}>
                <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>📭</span>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>No tienes notificaciones en este momento</p>
                <p style={{ fontSize: '0.9rem', color: 'gray', marginTop: '0.5rem' }}>¡Te avisaremos cuando haya novedades en el bloque!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {notifications.map((n) => (
                  <motion.div 
                    whileHover={{ background: 'rgba(255,255,255,0.03)', x: 5 }}
                    key={n.id} 
                    style={{ 
                      display: 'flex', 
                      gap: '1.2rem', 
                      padding: '1.2rem', 
                      borderRadius: '15px',
                      background: 'rgba(255,255,255,0.01)',
                      position: 'relative',
                      alignItems: 'center',
                      borderBottom: '1px solid rgba(255,255,255,0.02)'
                    }}
                  >
                    <button 
                      onClick={() => handleClear(n)}
                      style={{ 
                        position: 'absolute', 
                        top: '1rem', 
                        right: '1rem', 
                        background: 'none', 
                        border: 'none', 
                        color: 'rgba(255,255,255,0.3)', 
                        cursor: 'pointer', 
                        fontSize: '1.5rem',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ff5f56'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                    >×</button>

                    <div style={{ position: 'relative' }}>
                      <img src={n.img} alt={n.user} style={{ width: '50px', height: '50px', borderRadius: '12px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                      {n.active && <span style={{ position: 'absolute', top: '-3px', right: '-3px', width: '12px', height: '12px', background: 'var(--lemon)', borderRadius: '50%', border: '2px solid #1a0a04' }}></span>}
                    </div>
                    <div style={{ flex: 1, paddingRight: '2rem' }}>
                      <p style={{ margin: 0, fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: '1.4' }}>
                        <strong style={{ color: 'white', fontWeight: '800' }}>@{n.user.toUpperCase()}</strong> {n.text}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.4rem', display: 'block' }}>{getTimeAgo(n.time)}</span>
                    </div>
                    {n.type === 'reward' && <span style={{ fontSize: '1.8rem', opacity: 0.8 }}>🎁</span>}
                    {n.type === 'follow' && <span style={{ fontSize: '1.8rem', opacity: 0.8 }}>👤➕</span>}
                    {n.type === 'unfollow' && <span style={{ fontSize: '1.8rem', opacity: 0.8 }}>👤➖</span>}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default Notificaciones;
