import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, onSnapshot, collection, getDocs, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationsBalloon from '../components/NotificationsBalloon';

function DashboardUsuario() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedImg, setSelectedImg] = useState(null); // Estado para el Lightbox
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceCode, setAttendanceCode] = useState('');
  const [attendanceMessage, setAttendanceMessage] = useState('');
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  
  const navigate = useNavigate();

  const rewardsList = [
    { id: 'pase_vip', title: 'PASE GRATIS VIP', desc: 'Pasa gratis a cualquier evento antes de la 1:00 AM.', cost: 150, img: '/img/prox-1.png' },
    { id: 'codigo_50', title: 'CÓDIGO 50% DTO', desc: 'Mitad de precio en tu próxima compra de entradas.', cost: 200, img: '/img/prox-2.png' },
    { id: 'copa_gratis', title: 'COPA GRATIS', desc: 'Invita la casa. Válido en todas las barras principales.', cost: 300, img: '/img/1.png' },
    { id: 'merch_camiseta', title: 'CAMISETA BAJO MUNDO', desc: 'Llévate el flow a tu casa. Tallas S a XL disponibles.', cost: 1000, img: '/img/2.png' }
  ];

  const handleRedeemReward = async (reward) => {
    const userXp = userData?.xp || 0;
    if (userXp >= reward.cost) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          xp: userXp - reward.cost
        });
        alert(`¡Has canjeado con éxito: ${reward.title}!`);
      } catch (e) {
        console.error('Error canjeando:', e);
        alert('Error al canjear la recompensa.');
      }
    }
  };

  // Datos mock de eventos
  const events = {
    10: { title: "Dembow Party", desc: "La discoteca se prende" },
    21: { title: "Underground Battles", desc: "Freestyle en el bloque" },
    28: { title: "Bajo Mundo Fest", desc: "El evento del año" }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const unsubUser = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            setFollowing(data.following || []);
          }
        });
        
        // Cargar usuarios para la sección de Networking
        try {
          const usersSnap = await getDocs(collection(db, "users"));
          const usersList = [];
          usersSnap.forEach((docItem) => {
            if (docItem.id !== user.uid) {
              usersList.push({ id: docItem.id, ...docItem.data() });
            }
          });
          setAllUsers(usersList);
          // Tomar hasta 2 usuarios aleatorios
          setSuggestedUsers(usersList.sort(() => 0.5 - Math.random()).slice(0, 2));
        } catch (error) {
          console.error("Error fetching users for networking:", error);
        }
      } else {
        navigate('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  // LÓGICA PARA SEGUIR/DEJAR DE SEGUIR
  const handleFollowToggle = async (targetId) => {
    const user = auth.currentUser;
    if (!user) return;
    
    const isFollowing = following.includes(targetId);
    
    // Actualización visual optimista
    if (isFollowing) {
      setFollowing(prev => prev.filter(id => id !== targetId));
    } else {
      setFollowing(prev => [...prev, targetId]);
    }
    
    try {
      const myRef = doc(db, 'users', user.uid);
      const targetRef = doc(db, 'users', targetId);
      
      if (isFollowing) {
        await updateDoc(myRef, { following: arrayRemove(targetId) });
        await updateDoc(targetRef, { followers: arrayRemove(user.uid) });
      } else {
        const notif = {
          id: Date.now().toString(),
          type: 'follow',
          user: userData?.firstName || 'Alguien',
          text: 'te ha empezado a seguir',
          time: Date.now(),
          img: userData?.profilePic || '/img/perfil-6.png',
          active: true
        };
        await updateDoc(myRef, { following: arrayUnion(targetId) });
        await updateDoc(targetRef, { 
          followers: arrayUnion(user.uid),
          notifications: arrayUnion(notif)
        });
      }
    } catch (error) {
      console.error(error);
      // Revertir en caso de error
      if (isFollowing) {
        setFollowing(prev => [...prev, targetId]);
      } else {
        setFollowing(prev => prev.filter(id => id !== targetId));
      }
    }
  };

  // LÓGICA DEL CALENDARIO
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Ajuste para que empiece en Lunes
  };

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const daysShort = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1));

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
          <p className="profile-email">{userData?.email}</p>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li className="active"><Link to="/dashboard-usuario"><span className="icon">🏠</span> Inicio</Link></li>
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
                {unreadCount > 0 && (
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
                    {unreadCount}
                  </span>
                )}
              </button>
              <NotificationsBalloon 
                isOpen={showNotifications} 
                onClose={() => setShowNotifications(false)} 
                onUnreadCountChange={setUnreadCount}
              />
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
        <div className="dashboard-grid">

          {/* PRÓXIMOS EVENTOS */}
          <div className="widget-box calendar-widget-box">
            <div className="widget-header">
              <h3>PRÓXIMOS EVENTOS</h3>
              <span className="widget-icon">📅</span>
            </div>

            <div className="mini-calendar-container">
              <div className="calendar-nav">
                <button onClick={prevMonth}>&lt;</button>
                <span className="current-month-label">{monthNames[month]} {year}</span>
                <button onClick={nextMonth}>&gt;</button>
              </div>

              <div className="calendar-grid-header">
                {daysShort.map(d => <span key={d}>{d}</span>)}
              </div>

              <div className="calendar-grid-mini">
                {[...Array(firstDay)].map((_, i) => <span key={`empty-${i}`} className="empty"></span>)}
                {[...Array(daysInMonth)].map((_, i) => {
                  const dayNum = i + 1;
                  const isToday = dayNum === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

                  const events = {
                    10: { title: "Dembow Party", desc: "La discoteca se prende" },
                    21: { title: "Underground Battles", desc: "Freestyle en el bloque" },
                    28: { title: "Bajo Mundo Fest", desc: "El evento del año" }
                  };

                  const event = events[dayNum];

                  return (
                    <div key={dayNum} className={`mini-date ${isToday ? 'is-today' : ''} ${event ? 'has-event' : ''}`}>
                      {dayNum}
                      {event && (
                        <div className="event-tooltip">
                          <strong>{event.title}</strong>
                          <p>{event.desc}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ASISTENCIA */}
          <div className="widget-box assistance-box">
            <div className="widget-header">
              <h3>ASISTENCIA</h3>
              <span className="widget-icon">📝</span>
            </div>
            <div className="level-indicator">
              <div className="level-bar">
                <div className="level-progress" style={{ width: `${(userData?.xp || 0) % 100}%`, transition: 'width 1s ease-out' }}></div>
                <div className="level-badge" style={{ left: `${(userData?.xp || 0) % 100}%`, transition: 'left 1s ease-out' }}>
                  lvl {Math.floor((userData?.xp || 0) / 100) + 1}
                  <span className="particle p1"></span>
                  <span className="particle p2"></span>
                  <span className="particle p3"></span>
                  <span className="particle p4"></span>
                  <span className="particle p5"></span>
                </div>
              </div>
              <h4 className="level-status">¡ESO ESTÁ PELUCHE!</h4>
              <p>Estás on fire, no te pierdes ni una, ¡qué bacano!</p>
              <button className="btn-assistance" onClick={() => setShowAttendanceModal(true)}>FORMULARIO DE ASISTENCIA <span>&#10140;</span></button>
            </div>
          </div>

          {/* NETWORKING */}
          <div className="widget-box networking-box">
            <div className="widget-header">
              <h3>NETWORKING</h3>
              <span className="widget-icon">👥</span>
            </div>
            <p className="widget-desc">¡CONECTA CON EL BAJO MUNDO!</p>
            <div className="connections-list">
              {suggestedUsers.length === 0 && <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>No hay más usuarios en la app.</p>}
              {suggestedUsers.map(u => {
                const isFollowing = following.includes(u.id);
                return (
                  <div className="connection-item" key={u.id}>
                    <img src={u.profilePic || "/img/perfil-6.png"} alt={u.firstName} />
                    <div className="conn-info">
                      <strong>{u.firstName?.toUpperCase()}</strong>
                      <span>{u.bio ? u.bio.substring(0, 15) + '...' : 'Nuevo en el bloque'}</span>
                    </div>
                    <button 
                      className="btn-connect" 
                      onClick={() => handleFollowToggle(u.id)}
                      style={{
                        background: isFollowing ? 'rgba(255,60,0,0.1)' : 'var(--lemon)',
                        color: isFollowing ? '#ff5f56' : 'black',
                        border: isFollowing ? '1px solid rgba(255,60,0,0.5)' : 'none',
                        transition: '0.3s'
                      }}
                      title={isFollowing ? 'Dejar de seguir' : 'Seguir'}
                    >
                      {isFollowing ? '✕' : '+'}
                    </button>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0' }}>
              <button onClick={() => setShowNetworkModal(true)} className="btn-text" style={{ fontSize: '0.8rem', padding: 0 }}>VER MÁS <span>&#10140;</span></button>
              <Link to="/mensajes" className="btn-text" style={{ textDecoration: 'none', fontSize: '0.8rem', padding: 0 }}>IR A MENSAJES <span>&#10140;</span></Link>
            </div>
          </div>

          {/* RECOMPENSAS */}
          <div className="widget-box rewards-box">
            <div className="widget-header" style={{ alignItems: 'center' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                RECOMPENSAS
                <span style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--lemon)', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', border: '1px solid var(--lemon)' }}>
                  {userData?.xp || 0} XP
                </span>
              </h3>
              <span className="widget-icon">🔖</span>
            </div>
            <div className="rewards-list">
              {rewardsList.slice(0, 2).map(reward => {
                const userXp = userData?.xp || 0;
                const canAfford = userXp >= reward.cost;
                return (
                  <div key={reward.id} className="reward-card" style={{ opacity: canAfford ? 1 : 0.5, filter: canAfford ? 'none' : 'grayscale(100%)' }}>
                    <img src={reward.img} alt={reward.title} />
                    <div className="reward-info">
                      <h4>{reward.title}</h4>
                      <p>{reward.desc}</p>
                      <button 
                        className="btn-mini"
                        disabled={!canAfford}
                        onClick={() => handleRedeemReward(reward)}
                        style={{ 
                          background: canAfford ? 'var(--lemon)' : '#333', 
                          color: canAfford ? 'black' : 'gray',
                          cursor: canAfford ? 'pointer' : 'not-allowed',
                          border: 'none',
                          transition: '0.3s'
                        }}
                      >
                        {canAfford ? `CANJEAR (${reward.cost} XP) ➔` : `BLOQUEADO (${reward.cost} XP)`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="btn-text" onClick={() => setShowRewardsModal(true)}>TODAS LAS RECOMPENSAS <span>&#10140;</span></button>
          </div>

          {/* MI GALERÍA */}
          <div className="widget-box gallery-box">
            <div className="widget-header">
              <h3>MI GALERÍA</h3>
              <span className="widget-icon">🖼️</span>
            </div>
            <div 
              className="gallery-mosaic"
              style={{
                display: 'grid',
                gap: '0.6rem',
                flexGrow: 1,
                gridTemplateColumns: !userData?.gallery?.length ? '1fr 1fr 1.5fr' :
                                      userData.gallery.length === 1 ? '1fr' :
                                      userData.gallery.length === 2 ? '1fr 1fr' :
                                      userData.gallery.length === 3 ? '1fr 1fr 1fr' :
                                      '1fr 1fr 1.5fr'
              }}
            >
              {(!userData?.gallery || userData.gallery.length === 0) ? (
                <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.05)', borderRadius: '12px', border: '1px dashed rgba(0,0,0,0.2)' }}>
                  <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Aún no hay fotos.</p>
                </div>
              ) : (
                userData.gallery.slice(0, 4).map((img, i) => {
                  const len = Math.min(userData.gallery.length, 4);
                  let gridRow = 'span 1';
                  let gridCol = 'span 1';
                  
                  if (len === 1) {
                    gridRow = 'span 2';
                  } else if (len === 2 || len === 3) {
                    gridRow = 'span 2';
                  } else if (len >= 4) {
                    if (i === 0 || i === 1) gridRow = 'span 2';
                  }

                  return (
                    <img 
                      key={i} 
                      src={img} 
                      alt={`Gallery ${i+1}`} 
                      onClick={() => setSelectedImg(img)} 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        gridRow,
                        gridColumn: gridCol
                      }}
                    />
                  );
                })
              )}
            </div>
            <Link to="/mi-contenido" className="btn-text" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '0.5rem' }}>MI CONTENIDO <span>&#10140;</span></Link>
          </div>

        </div>
      </main>

      {/* MODAL LIGHTBOX */}
      {selectedImg && (
        <div className="lightbox-overlay" onClick={() => setSelectedImg(null)}>
          <div className="lightbox-content">
            <button className="close-lightbox">&times;</button>
            <img src={selectedImg} alt="Enlarged view" />
          </div>
        </div>
      )}

      {/* MODAL DE NETWORKING */}
      <AnimatePresence>
        {showNetworkModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
            onClick={() => setShowNetworkModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#120804', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', width: '100%', maxWidth: '400px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}
            >
              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: 'Bungee', color: 'white', margin: 0, fontSize: '1.2rem' }}>
                  NETWORKING
                </h3>
                <button onClick={() => setShowNetworkModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '1.5rem', cursor: 'pointer', transition: '0.3s' }}>×</button>
              </div>
              <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <input 
                  type="text" 
                  placeholder="Buscar usuarios..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                />
              </div>
              <div style={{ padding: '1rem', maxHeight: '400px', overflowY: 'auto' }} className="custom-scrollbar">
                {allUsers.length === 0 && <p style={{ textAlign: 'center', color: 'gray', padding: '2rem 0' }}>No hay otros usuarios.</p>}
                {allUsers
                  .filter(u => `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(user => {
                    const isFollowing = following.includes(user.id);
                    return (
                      <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', transition: '0.2s', borderBottom: '1px solid rgba(255,255,255,0.02)' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <img src={user.profilePic || '/img/perfil-6.png'} alt={user.firstName} style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                          <strong style={{ display: 'block', color: 'white', fontSize: '0.9rem' }}>{user.firstName} {user.lastName}</strong>
                          <span style={{ color: 'var(--lemon)', fontSize: '0.75rem' }}>@{user.firstName?.toLowerCase() || 'usuario'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollowToggle(user.id);
                            }}
                            style={{ 
                              background: isFollowing ? 'rgba(255,60,0,0.1)' : 'var(--lemon)', 
                              border: isFollowing ? '1px solid rgba(255,60,0,0.5)' : 'none', 
                              color: isFollowing ? '#ff5f56' : 'black', 
                              padding: '0.5rem 0.8rem', 
                              borderRadius: '8px', 
                              cursor: 'pointer', 
                              fontSize: '0.7rem', 
                              fontWeight: '900', 
                              transition: 'all 0.2s',
                              width: '35px',
                              textAlign: 'center'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            title={isFollowing ? 'Dejar de seguir' : 'Seguir'}
                          >
                            {isFollowing ? 'X' : '+'}
                          </button>
                        </div>
                      </div>
                    );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE ASISTENCIA */}
      <AnimatePresence>
        {showAttendanceModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
            onClick={() => setShowAttendanceModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#120804', border: '1px solid var(--lemon)', borderRadius: '20px', width: '100%', maxWidth: '400px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 20px rgba(223, 255, 0, 0.2)' }}
            >
              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: 'Bungee', color: 'var(--lemon)', margin: 0, fontSize: '1.2rem' }}>
                  VALIDAR ASISTENCIA
                </h3>
                <button onClick={() => setShowAttendanceModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '1.5rem', cursor: 'pointer', transition: '0.3s' }}>×</button>
              </div>
              <div style={{ padding: '2rem' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Introduce el código secreto del evento para sumar experiencia a tu nivel del Bajo Mundo.</p>
                <input 
                  type="text" 
                  placeholder="CÓDIGO SECRETO (Ej: DEMBOW24)" 
                  value={attendanceCode}
                  onChange={(e) => setAttendanceCode(e.target.value.toUpperCase())}
                  style={{ width: '100%', padding: '1rem', borderRadius: '10px', border: '2px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none', fontFamily: 'Bungee', textAlign: 'center', fontSize: '1.2rem', marginBottom: '1rem' }}
                />
                {attendanceMessage && (
                  <p style={{ textAlign: 'center', color: attendanceMessage.includes('Error') ? '#ff5f56' : 'var(--lemon)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                    {attendanceMessage}
                  </p>
                )}
                <button 
                  onClick={async () => {
                    const code = attendanceCode.trim();
                    if (code === 'DEMBOW24' || code === 'BAJOMUNDO') {
                      if (userData?.redeemedCodes?.includes(code)) {
                        setAttendanceMessage('Error: Ya has validado este código anteriormente.');
                        return;
                      }

                      try {
                        const userRef = doc(db, 'users', auth.currentUser.uid);
                        await updateDoc(userRef, {
                          xp: (userData?.xp || 0) + 50,
                          redeemedCodes: arrayUnion(code)
                        });
                        setAttendanceMessage('¡Asistencia validada! +50 XP sumados.');
                        setTimeout(() => {
                          setShowAttendanceModal(false);
                          setAttendanceMessage('');
                          setAttendanceCode('');
                        }, 2000);
                      } catch (error) {
                        console.error('Error XP:', error);
                        setAttendanceMessage('Error sumando experiencia.');
                      }
                    } else {
                      setAttendanceMessage('Error: Código inválido o expirado.');
                    }
                  }}
                  style={{ width: '100%', background: 'var(--lemon)', color: 'black', border: 'none', padding: '1rem', borderRadius: '10px', fontFamily: 'Bungee', cursor: 'pointer', fontSize: '1rem', transition: '0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  VERIFICAR CÓDIGO
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE TODAS LAS RECOMPENSAS */}
      <AnimatePresence>
        {showRewardsModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
            onClick={() => setShowRewardsModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#120804', border: '1px solid var(--lemon)', borderRadius: '20px', width: '100%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 20px rgba(223, 255, 0, 0.2)' }}
            >
              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <h3 style={{ fontFamily: 'Bungee', color: 'var(--lemon)', margin: 0, fontSize: '1.5rem' }}>
                    CATÁLOGO DE RECOMPENSAS
                  </h3>
                  <span style={{ fontSize: '1rem', background: 'rgba(223, 255, 0, 0.1)', color: 'var(--lemon)', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid rgba(223,255,0,0.5)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                    💎 PUNTOS DISPONIBLES: {userData?.xp || 0} XP
                  </span>
                </div>
                <button onClick={() => setShowRewardsModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '1.8rem', cursor: 'pointer', transition: '0.3s' }}>×</button>
              </div>
              <div style={{ padding: '1.5rem', overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {rewardsList.map(reward => {
                  const userXp = userData?.xp || 0;
                  const canAfford = userXp >= reward.cost;
                  return (
                    <div key={reward.id} className="reward-card" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', opacity: canAfford ? 1 : 0.5, filter: canAfford ? 'none' : 'grayscale(100%)' }}>
                      <img src={reward.img} alt={reward.title} />
                      <div className="reward-info">
                        <h4 style={{ color: 'white' }}>{reward.title}</h4>
                        <p style={{ color: 'rgba(255,255,255,0.6)' }}>{reward.desc}</p>
                        <button 
                          className="btn-mini" 
                          disabled={!canAfford}
                          onClick={() => handleRedeemReward(reward)}
                          style={{ 
                            background: canAfford ? 'var(--lemon)' : '#333', 
                            color: canAfford ? 'black' : 'gray',
                            cursor: canAfford ? 'pointer' : 'not-allowed'
                          }}
                        >
                          {canAfford ? `CANJEAR (${reward.cost} XP) ➔` : `BLOQUEADO (${reward.cost} XP)`}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardUsuario;
