import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../firebase';
import { doc, onSnapshot, updateDoc, arrayRemove } from 'firebase/firestore';

function NotificationsBalloon({ isOpen, onClose, onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let unsubscribe = () => {};
    
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        unsubscribe = onSnapshot(docRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const notifs = data.notifications || [];
            // Ordenar por tiempo descendente (más recientes primero)
            notifs.sort((a, b) => b.time - a.time);
            setNotifications(notifs);
            if (onUnreadCountChange) {
              onUnreadCountChange(notifs.filter(n => n.active).length);
            }
          }
        });
      } else {
        setNotifications([]);
        if (onUnreadCountChange) {
          onUnreadCountChange(0);
        }
      }
    });

    return () => {
      unsubAuth();
      unsubscribe();
    };
  }, [onUnreadCountChange]);

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

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(239, 255, 0, 0.2); borderRadius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--lemon); }
      `}</style>
      <AnimatePresence>
      {isOpen && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, zIndex: 998 }} 
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            className="notifications-balloon-premium"
            style={{
              position: 'fixed', // Cambiado a fixed para que no lo corte el sidebar
              left: '280px',
              top: '250px',
              width: '320px', // Un poco más estrecho para evitar cortes en ventana
              background: 'rgba(26, 10, 4, 0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(239, 255, 0, 0.4)',
              borderRadius: '24px',
              boxShadow: '0 40px 100px rgba(0,0,0,0.9), 0 0 30px rgba(239, 255, 0, 0.1)',
              zIndex: 9999,
              overflow: 'hidden'
            }}
          >
            {/* Cabecera */}
            <div style={{ 
              padding: '1.5rem', 
              background: 'rgba(239, 255, 0, 0.05)', 
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <h3 className="bungee-font" style={{ color: 'white', fontSize: '1rem', margin: 0 }}>ALERTAS</h3>
                <span style={{ 
                  background: 'var(--lemon)', 
                  color: 'black', 
                  fontSize: '0.7rem', 
                  padding: '0.2rem 0.6rem', 
                  borderRadius: '10px', 
                  fontWeight: '900' 
                }}>{notifications.filter(n => n.active).length} NUEVAS</span>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '1.5rem' }}>×</button>
            </div>

            {/* Lista de Notificaciones */}
            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '0.5rem', paddingBottom: '1rem' }} className="custom-scrollbar">
              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '2rem 1rem' }}>
                  <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📭</span>
                  No tienes notificaciones
                </div>
              ) : (
                notifications.map((n) => (
                  <motion.div 
                    whileHover={{ background: 'rgba(255,255,255,0.03)', x: 5 }}
                    key={n.id} 
                    style={{ 
                      display: 'flex', 
                      gap: '1rem', 
                      padding: '1.2rem 1rem', 
                      borderRadius: '15px',
                      cursor: 'pointer',
                      position: 'relative',
                      borderBottom: '1px solid rgba(255,255,255,0.02)'
                    }}
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleClear(n); }}
                      style={{ position: 'absolute', top: '5px', right: '5px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '1rem' }}
                    >×</button>

                    <div style={{ position: 'relative' }}>
                      <img src={n.img} alt={n.user} style={{ width: '45px', height: '45px', borderRadius: '12px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                      {n.active && <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '10px', height: '10px', background: 'var(--lemon)', borderRadius: '50%', border: '2px solid #1a0a04' }}></span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)', lineHeight: '1.3' }}>
                        <strong style={{ color: 'white', fontWeight: '800' }}>@{n.user.toUpperCase()}</strong> {n.text}
                      </p>
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.4rem', display: 'block' }}>{getTimeAgo(n.time)}</span>
                    </div>
                    {n.type === 'reward' && <span style={{ fontSize: '1.2rem', opacity: 0.5 }}>🎁</span>}
                  </motion.div>
                ))
              )}
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}

export default NotificationsBalloon;
