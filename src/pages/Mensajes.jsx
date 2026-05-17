import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, where, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationsBalloon from '../components/NotificationsBalloon';

function Mensajes() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileView, setMobileView] = useState('contacts');
  
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Cargar datos del usuario y lista de contactos (usuarios reales)
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Cargar mis datos en tiempo real para badges
          const docRef = doc(db, 'users', user.uid);
          const unsubUser = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
              setUserData(docSnap.data());
            }
          });

          // Cargar otros usuarios (contactos) - Filtrado localmente para evitar errores de Firebase
          const usersSnap = await getDocs(collection(db, "users"));
          const usersList = [];
          usersSnap.forEach((doc) => {
            if (doc.id !== user.uid) {
              usersList.push({ id: doc.id, ...doc.data() });
            }
          });
          setUsers(usersList);
          
          // Seleccionar el usuario por defecto o el solicitado desde el perfil
          const openChatId = location.state?.openChatId;
          
          if (openChatId) {
            const targetUser = usersList.find(u => u.id === openChatId);
            if (targetUser) {
              setActiveChat(targetUser);
              setMobileView('chat');
            } else if (usersList.length > 0 && !activeChat) {
              setActiveChat(usersList[0]);
            }
          } else if (usersList.length > 0 && !activeChat) {
            setActiveChat(usersList[0]);
          }
        } catch (error) {
          console.error("Error al cargar usuarios:", error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // 2. Escuchar mensajes del chat activo
  useEffect(() => {
    if (!auth.currentUser || !activeChat) return;

    // Generar chatId único (menor_UID + "_" + mayor_UID)
    const myUid = auth.currentUser.uid;
    const otherUid = activeChat.id;
    const chatId = myUid < otherUid ? `${myUid}_${otherUid}` : `${otherUid}_${myUid}`;

    // Marcar como leído
    const myRef = doc(db, 'users', myUid);
    updateDoc(myRef, { unreadMessagesFrom: arrayRemove(otherUid) }).catch(e => console.error(e));

    const q = query(
      collection(db, "direct_messages", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubMessages = onSnapshot(q, (snapshot) => {
      let msgList = [];
      snapshot.forEach((doc) => {
        msgList.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgList);
      
      // Auto-scroll
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    });

    return () => unsubMessages();
  }, [activeChat]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      const myUid = auth.currentUser.uid;
      const otherUid = activeChat.id;
      const chatId = myUid < otherUid ? `${myUid}_${otherUid}` : `${otherUid}_${myUid}`;

      await addDoc(collection(db, "direct_messages", chatId, "messages"), {
        text: newMessage,
        senderId: myUid,
        receiverId: otherUid,
        senderName: userData?.firstName || 'Anon',
        senderImg: userData?.profilePic || '/img/perfil-6.png',
        createdAt: serverTimestamp()
      });
      
      // Notificar al destinatario de mensaje no leído
      const otherUserRef = doc(db, 'users', otherUid);
      await updateDoc(otherUserRef, { unreadMessagesFrom: arrayUnion(myUid) });
      
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (loading) return <div className="loading">CARGANDO BARRIO...</div>;

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
            <li><Link to="/dashboard-usuario"><span className="icon">🏠</span> Inicio</Link></li>
            <li><Link to="/perfil"><span className="icon">👤</span> Perfil</Link></li>
            <li className="active" style={{ position: 'relative' }}>
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
              {/* Escritorio */}
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`nav-btn ${showNotifications ? 'active' : ''} desktop-only-nav`}
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

              {/* Móvil */}
              <Link 
                to="/notificaciones"
                className="nav-btn mobile-only-nav"
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
              </Link>

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
      <main className="dashboard-main chat-popup-container">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="chat-modal-window"
        >
          <div className="window-title-bar">
            <div className="window-dots">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <div className="window-title bungee-font">MENSAJERÍA PRIVADA</div>
            <div className="window-actions">
              <button className="win-btn" onClick={() => navigate('/dashboard-usuario')}>×</button>
            </div>
          </div>

          <div className="chat-interface-wrapper">
            {/* Lista de Usuarios */}
            <div className={`chat-contacts ${mobileView === 'contacts' ? 'mobile-visible' : 'mobile-hidden'}`}>
              <div className="contacts-header">
                <input type="text" placeholder="Buscar contacto..." className="search-bar" />
              </div>
              <div className="contacts-list">
                {users.length === 0 && <p style={{ textAlign: 'center', color: 'gray', fontSize: '0.8rem', padding: '1rem' }}>No hay otros usuarios en el barrio...</p>}
                {users.map(u => {
                  const hasUnread = userData?.unreadMessagesFrom?.includes(u.id);
                  return (
                    <div 
                      key={u.id} 
                      className={`contact-item ${activeChat?.id === u.id ? 'active' : ''}`}
                      onClick={() => {
                        setActiveChat(u);
                        setMobileView('chat');
                      }}
                      style={{ position: 'relative' }}
                    >
                      <div className="contact-img">
                        <img src={u.profilePic || '/img/perfil-6.png'} alt={u.firstName} />
                        <span className="online-dot"></span>
                      </div>
                      <div className="contact-info">
                        <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: hasUnread ? 'white' : '' }}>
                          {u.firstName?.toUpperCase()} {u.lastName?.toUpperCase()}
                          {hasUnread && <span style={{ width: '8px', height: '8px', background: '#ff5f56', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 5px rgba(255,95,86,0.5)' }}></span>}
                        </strong>
                        <span style={{ color: hasUnread ? 'var(--lemon)' : '' }}>{hasUnread ? 'Nuevo mensaje' : (u.bio ? u.bio.substring(0, 20) + '...' : 'Activo en el bloque')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ventana de Chat */}
            <div className={`chat-window ${mobileView === 'chat' ? 'mobile-visible' : 'mobile-hidden'}`}>
              {activeChat ? (
                <>
                  <header className="chat-header">
                    <div className="active-contact-info">
                      <button 
                        className="mobile-chat-back-btn" 
                        onClick={() => setMobileView('contacts')}
                      >
                        ←
                      </button>
                      <img src={activeChat.profilePic || '/img/perfil-6.png'} alt={activeChat.firstName} />
                      <div>
                        <h4>{activeChat.firstName?.toUpperCase()} {activeChat.lastName?.toUpperCase()}</h4>
                        <span className="status-online">En línea</span>
                      </div>
                    </div>
                  </header>

                  <div className="chat-messages" ref={scrollRef}>
                    <AnimatePresence>
                      {messages.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.3 }}>
                          <span style={{ fontSize: '3rem' }}>💬</span>
                          <p>Empieza la charla con {activeChat.firstName}</p>
                        </div>
                      )}
                      {messages.map((msg) => {
                        const isMine = msg.senderId === auth.currentUser?.uid;
                        return (
                          <motion.div 
                            key={msg.id}
                            initial={{ opacity: 0, x: isMine ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`message-bubble-wrapper ${isMine ? 'mine' : 'theirs'}`}
                          >
                            {!isMine && <img src={msg.senderImg} alt="User" className="msg-avatar" />}
                            <div className="message-content">
                              <div className="bubble">
                                {msg.text}
                                <span className="msg-time">
                                  {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>

                  <footer className="chat-input-area">
                    <form onSubmit={handleSendMessage}>
                      <input 
                        type="text" 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)} 
                        placeholder={`Escribe a ${activeChat.firstName}...`}
                      />
                      <button type="submit" className="send-btn">🚀</button>
                    </form>
                  </footer>
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                  <p>Selecciona un contacto para empezar a chatear</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>

      <style>{`
        .chat-popup-container {
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at center, rgba(255, 60, 0, 0.05) 0%, transparent 70%);
          height: 100vh;
          padding: 2rem !important;
        }
        .chat-modal-window {
          width: 100%;
          max-width: 1100px;
          height: 85vh;
          background: #120804;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
        }
        .window-title-bar {
          background: #1a0a04;
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .window-dots { display: flex; gap: 8px; }
        .dot { width: 12px; height: 12px; border-radius: 50%; }
        .dot.red { background: #ff5f56; }
        .dot.yellow { background: #ffbd2e; }
        .dot.green { background: #27c93f; }
        .window-title { font-size: 0.75rem; color: rgba(255,255,255,0.4); letter-spacing: 2px; }
        .win-btn { background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; opacity: 0.3; transition: 0.3s; }
        .win-btn:hover { opacity: 1; color: var(--primary); }

        .chat-interface-wrapper { display: flex; flex: 1; overflow: hidden; }
        .chat-contacts { width: 320px; border-right: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.1); display: flex; flex-direction: column; }
        .contacts-header { padding: 1.5rem; }
        .search-bar { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 0.8rem 1.2rem; color: white; font-size: 0.85rem; outline: none; transition: 0.3s; }
        .search-bar:focus { border-color: var(--lemon); background: rgba(255,255,255,0.05); }
        .contacts-list { flex: 1; overflow-y: auto; padding: 0.8rem; }
        .contact-item { display: flex; gap: 1rem; padding: 1rem; border-radius: 15px; cursor: pointer; transition: 0.2s; margin-bottom: 0.5rem; border: 1px solid transparent; }
        .contact-item:hover { background: rgba(255,255,255,0.02); }
        .contact-item.active { background: rgba(239, 255, 0, 0.05); border-color: rgba(239, 255, 0, 0.1); }
        .contact-img { position: relative; width: 48px; height: 48px; }
        .contact-img img { width: 100%; height: 100%; border-radius: 14px; object-fit: cover; }
        .online-dot { position: absolute; bottom: -2px; right: -2px; width: 12px; height: 12px; background: #4ade80; border: 3px solid #120804; border-radius: 50%; }
        .contact-info strong { display: block; color: white; font-size: 0.9rem; margin-bottom: 0.2rem; }
        .contact-info span { color: rgba(255,255,255,0.4); font-size: 0.75rem; }

        .chat-window { flex: 1; display: flex; flex-direction: column; background: rgba(0,0,0,0.05); }
        .chat-header { padding: 1.2rem 2rem; background: rgba(255,255,255,0.01); border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
        .active-contact-info { display: flex; gap: 1rem; align-items: center; }
        .active-contact-info img { width: 42px; height: 42px; border-radius: 12px; }
        .active-contact-info h4 { margin: 0; color: white; font-size: 1.1rem; }
        .status-online { color: #4ade80; font-size: 0.7rem; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }

        .chat-messages { flex: 1; padding: 2rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1.2rem; }
        .message-bubble-wrapper { display: flex; gap: 1rem; max-width: 75%; }
        .message-bubble-wrapper.mine { align-self: flex-end; flex-direction: row-reverse; }
        .msg-avatar { width: 36px; height: 36px; border-radius: 10px; }
        .bubble { padding: 1rem 1.2rem; border-radius: 18px; color: white; font-size: 0.95rem; position: relative; line-height: 1.4; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
        .mine .bubble { background: var(--primary); border-bottom-right-radius: 4px; }
        .theirs .bubble { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.05); border-bottom-left-radius: 4px; }
        .msg-time { display: block; font-size: 0.65rem; opacity: 0.4; margin-top: 0.5rem; text-align: right; }

        .chat-input-area { padding: 1.5rem 2rem; background: rgba(0,0,0,0.1); border-top: 1px solid rgba(255,255,255,0.03); }
        .chat-input-area form { display: flex; gap: 1rem; background: rgba(255,255,255,0.03); padding: 0.5rem; border-radius: 18px; align-items: center; border: 1px solid rgba(255,255,255,0.05); }
        .chat-input-area input { flex: 1; background: none; border: none; color: white; padding: 0.8rem 1.2rem; outline: none; font-size: 0.95rem; }
        .send-btn { background: var(--lemon); border: none; width: 45px; height: 45px; border-radius: 14px; cursor: pointer; transition: 0.3s; display: flex; alignItems: center; justifyContent: center; }
        .send-btn:hover { transform: scale(1.05) rotate(5deg); box-shadow: 0 0 20px rgba(239, 255, 0, 0.4); }

        .dashboard-sidebar {
          width: 260px;
          background: #1a0a04;
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(255,255,255,0.05);
          position: sticky;
          top: 0;
          height: 100vh;
          z-index: 100;
        }

        .mobile-chat-back-btn {
          display: none;
        }

        @media (max-width: 1024px) {
          .chat-modal-window {
            height: 90vh;
            max-width: 95%;
          }
        }
        @media (max-width: 768px) {
          .chat-popup-container {
            padding: 0 !important;
            height: calc(100vh - 65px) !important;
          }
          .chat-modal-window {
            height: 100% !important;
            border-radius: 0;
            max-width: 100%;
            border: none;
          }
          .chat-contacts.mobile-visible {
            display: flex !important;
            width: 100% !important;
          }
          .chat-contacts.mobile-hidden {
            display: none !important;
          }
          .chat-window.mobile-visible {
            display: flex !important;
            width: 100% !important;
          }
          .chat-window.mobile-hidden {
            display: none !important;
          }
          .mobile-chat-back-btn {
            display: flex !important;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: var(--lemon);
            font-size: 1.4rem;
            width: 38px;
            height: 38px;
            border-radius: 10px;
            margin-right: 0.8rem;
            cursor: pointer;
            outline: none;
          }
          .window-dots, .window-actions .win-btn:not(:last-child) {
            display: none;
          }
          .chat-messages {
            padding: 1rem !important;
          }
          .message-bubble-wrapper {
            max-width: 88% !important;
          }
          .chat-input-area {
            padding: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Mensajes;
