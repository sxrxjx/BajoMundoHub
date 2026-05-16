import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationsBalloon from '../components/NotificationsBalloon';

function Perfil() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState('/img/perfil-6.png');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followModalType, setFollowModalType] = useState('seguidores');

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const unsubUser = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            setFirstName(data.firstName || '');
            setLastName(data.lastName || '');
            setBio(data.bio || '');
            if (data.profilePic) setProfilePic(data.profilePic);
            
            // Cargar seguidores y seguidos reales
            const followersIds = data.followers || [];
            const followingIds = data.following || [];
            
            const fetchUsers = async (ids) => {
              const users = [];
              for (const id of ids) {
                const uDoc = await getDoc(doc(db, 'users', id));
                if (uDoc.exists()) {
                  users.push({ id, ...uDoc.data() });
                }
              }
              return users;
            };
            
            fetchUsers(followersIds).then(setFollowers);
            fetchUsers(followingIds).then(setFollowing);
          }
        });
      } else {
        navigate('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleFollowToggle = async (targetUser) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      const targetId = targetUser.id;
      const isFollowing = following.some(u => u.id === targetId);

      const myDocRef = doc(db, 'users', user.uid);
      const targetDocRef = doc(db, 'users', targetId);
      
      if (isFollowing) {
        // UNFOLLOW
        await updateDoc(myDocRef, { following: arrayRemove(targetId) });
        await updateDoc(targetDocRef, { followers: arrayRemove(user.uid) });
        
        setFollowing(prev => prev.filter(u => u.id !== targetId));
      } else {
        // FOLLOW
        const notif = {
          id: Date.now().toString(),
          type: 'follow',
          user: userData?.firstName || 'Alguien',
          text: 'te ha empezado a seguir',
          time: Date.now(),
          img: userData?.profilePic || '/img/perfil-6.png',
          active: true
        };
        await updateDoc(myDocRef, { following: arrayUnion(targetId) });
        await updateDoc(targetDocRef, { 
          followers: arrayUnion(user.uid),
          notifications: arrayUnion(notif)
        });
        
        setFollowing(prev => [...prev, targetUser]);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      setMessage({ type: 'error', text: 'Error al cambiar seguimiento.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Por favor, sube solo imágenes.' });
      return;
    }

    // Límite para asegurar que el string Base64 quepa en un documento de Firestore (1MB total)
    if (file.size > 800 * 1024) {
      setMessage({ type: 'error', text: 'La imagen es muy pesada. Usa una de menos de 800KB.' });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: 'Optimizando imagen...' });

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Crear un canvas para redimensionar la imagen
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a JPEG comprimido
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setProfilePic(dataUrl);
        setUploading(false);
        setMessage({ type: 'success', text: '¡Imagen optimizada! Dale a GUARDAR CAMBIOS.' });
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      setUploading(false);
      setMessage({ type: 'error', text: 'Error al procesar la imagen.' });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const notif = {
          id: Date.now().toString(),
          type: 'alert',
          user: 'Sistema',
          text: 'Has actualizado tu identidad',
          time: Date.now(),
          img: '/img/logo.png',
          active: true
        };
        await updateDoc(docRef, {
          firstName,
          lastName,
          bio,
          profilePic,
          notifications: arrayUnion(notif)
        });
        setMessage({ type: 'success', text: '¡Perfil actualizado con éxito!' });
        setTimeout(() => setIsEditing(false), 1500);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: 'error', text: 'Error al actualizar el perfil.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">CARGANDO...</div>;

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-profile">
          <div className="profile-img-container">
            <img src={profilePic} alt="Profile" className="profile-img" />
          </div>
          <h2 className="profile-name">
            {firstName ? (
              <>{firstName.toUpperCase()}<br />{lastName?.toUpperCase()}</>
            ) : (
              <>BAJO<br />MUNDO</>
            )}
          </h2>
          <p className="profile-email">{userData?.email}</p>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li><Link to="/dashboard-usuario"><span className="icon">🏠</span> Inicio</Link></li>
            <li className="active"><Link to="/perfil"><span className="icon">👤</span> Perfil</Link></li>
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
                onClick={() => setShowNotifications(!showNotifications)}
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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="profile-content-wrapper"
          style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}
        >
          <header className="profile-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 className="bungee-font" style={{ fontSize: '3rem', color: 'var(--lemon)', textShadow: '3px 3px 0px var(--primary)', marginBottom: '0.5rem' }}>MI PERFIL</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontWeight: '700' }}>{isEditing ? 'Editando tu identidad' : 'Tu ficha en el Bajo Mundo'}</p>
            </div>
            {!isEditing && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary"
                  style={{ padding: '0.8rem 1.5rem', fontSize: '0.9rem' }}
                >
                  EDITAR PERFIL
                </button>
                <button 
                  onClick={() => auth.signOut()}
                  className="btn"
                  style={{ 
                    padding: '0.8rem 1.5rem', 
                    fontSize: '0.9rem', 
                    background: 'rgba(255, 60, 0, 0.1)', 
                    border: '1px solid var(--primary)',
                    color: 'white' 
                  }}
                >
                  CERRAR SESIÓN
                </button>
              </div>
            )}
          </header>

          {!isEditing ? (
            /* VISTA PREVIA (FICHA) */
            <div className="widget-box" style={{ background: '#1a0a04', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '3rem' }}>
              <div className="profile-preview-card" style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
                <div className="profile-pic-preview">
                  <div className="profile-img-container" style={{ width: '220px', height: '220px', border: '5px solid var(--lemon)', boxShadow: '0 0 30px rgba(239, 255, 0, 0.2)' }}>
                    <img src={profilePic} alt="Preview" className="profile-img" />
                  </div>
                </div>
                <div className="profile-info-preview" style={{ flex: 1 }}>
                  <h2 className="bungee-font" style={{ fontSize: '2.5rem', color: 'white', marginBottom: '0.5rem' }}>
                    {firstName || 'BAJO'} {lastName || 'MUNDO'}
                  </h2>
                  <div style={{ display: 'inline-block', background: 'var(--primary)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '5px', fontSize: '0.8rem', fontWeight: '900', marginBottom: '1.5rem' }}>
                    USUARIO VERIFICADO
                  </div>
                  <div className="bio-container" style={{ position: 'relative', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '15px', borderLeft: '4px solid var(--lemon)' }}>
                    <span style={{ position: 'absolute', top: '-10px', left: '20px', background: '#1a0a04', padding: '0 10px', color: 'var(--lemon)', fontSize: '0.7rem', fontWeight: '900' }}>BIOGRAFÍA</span>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.6', fontStyle: 'italic', color: 'rgba(255,255,255,0.9)' }}>
                      {bio || "Este usuario aún no ha escrito su biografía. ¡Seguro que tiene mucho flow que contar!"}
                    </p>
                  </div>
                </div>
              </div>

              {/* PANELES DE SEGUIDORES Y SEGUIDOS */}
              <div className="stats-container" style={{ display: 'flex', gap: '2rem', marginTop: '3rem' }}>
                <div 
                  className="stat-panel"
                  onClick={() => { setFollowModalType('seguidores'); setShowFollowModal(true); }}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '15px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.3s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'var(--lemon)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                >
                  <h3 style={{ fontSize: '3rem', color: 'var(--lemon)', marginBottom: '0.5rem', fontFamily: 'Bungee' }}>{followers.length}</h3>
                  <p style={{ fontWeight: '900', letterSpacing: '2px', color: 'rgba(255,255,255,0.6)' }}>SEGUIDORES</p>
                </div>
                <div 
                  className="stat-panel"
                  onClick={() => { setFollowModalType('seguidos'); setShowFollowModal(true); }}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '15px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.3s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'var(--lemon)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                >
                  <h3 style={{ fontSize: '3rem', color: 'var(--lemon)', marginBottom: '0.5rem', fontFamily: 'Bungee' }}>{following.length}</h3>
                  <p style={{ fontWeight: '900', letterSpacing: '2px', color: 'rgba(255,255,255,0.6)' }}>SEGUIDOS</p>
                </div>
              </div>
            </div>
          ) : (
            /* VISTA DE EDICIÓN (FORMULARIO) */
            <div className="widget-box" style={{ background: '#1a0a04', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
              <form onSubmit={handleSave}>
                <div className="profile-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                  
                  {/* Lado izquierdo: Foto */}
                  <div className="profile-pic-edit" style={{ textAlign: 'center' }}>
                    <div className="profile-img-container" style={{ width: '180px', height: '180px', margin: '0 auto 1rem', position: 'relative' }}>
                      <img src={profilePic} alt="Edit Profile" className="profile-img" />
                      {uploading && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '900' }}>
                          SUBIENDO...
                        </div>
                      )}
                    </div>
                    
                    <label className="btn" style={{ 
                      background: 'var(--lemon)', 
                      color: 'black', 
                      fontSize: '0.7rem', 
                      padding: '0.5rem 1rem', 
                      cursor: 'pointer',
                      display: 'inline-block',
                      marginBottom: '1rem'
                    }}>
                      SUBIR FOTO
                      <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                    </label>

                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>O elige un avatar rápido:</p>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      {['/img/perfil-1.png', '/img/perfil-2.png', '/img/perfil-6.png'].map(img => (
                        <img 
                          key={img} 
                          src={img} 
                          onClick={() => setProfilePic(img)}
                          style={{ 
                            width: '35px', 
                            height: '35px', 
                            borderRadius: '50%', 
                            cursor: 'pointer', 
                            border: profilePic === img ? '2px solid var(--lemon)' : '2px solid transparent' 
                          }} 
                        />
                      ))}
                    </div>
                  </div>

                  {/* Lado derecho: Datos */}
                  <div className="profile-fields">
                    <div className="form-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ color: 'var(--lemon)' }}>Nombre</label>
                        <input 
                          type="text" 
                          value={firstName} 
                          onChange={(e) => setFirstName(e.target.value)} 
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ color: 'var(--lemon)' }}>Apellidos</label>
                        <input 
                          type="text" 
                          value={lastName} 
                          onChange={(e) => setLastName(e.target.value)} 
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label style={{ color: 'var(--lemon)' }}>Biografía</label>
                      <textarea 
                        value={bio} 
                        onChange={(e) => setBio(e.target.value)} 
                        placeholder="Cuéntanos quién eres, tu flow, tu calle..."
                        rows="4"
                        style={{ 
                          width: '100%', 
                          padding: '1.2rem', 
                          background: 'rgba(255,255,255,0.05)', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          color: 'white',
                          borderRadius: '15px',
                          fontFamily: 'Inter, sans-serif',
                          resize: 'none'
                        }}
                      />
                    </div>

                    {message.text && (
                      <div style={{ 
                        padding: '1rem', 
                        borderRadius: '10px', 
                        marginBottom: '1rem',
                        background: message.type === 'success' ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)',
                        color: message.type === 'success' ? '#4ade80' : '#f87171',
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        textAlign: 'center'
                      }}>
                        {message.text}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button 
                        type="button" 
                        onClick={() => setIsEditing(false)}
                        className="btn"
                        style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: 'white' }}
                      >
                        CANCELAR
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={saving}
                        style={{ flex: 2, padding: '1.2rem', fontSize: '1.1rem' }}
                      >
                        {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}
        </motion.div>

        {/* MODAL DE SEGUIDORES / SEGUIDOS */}
        <AnimatePresence>
          {showFollowModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
              onClick={() => setShowFollowModal(false)}
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
                    {followModalType === 'seguidores' ? 'SEGUIDORES' : 'SEGUIDOS'}
                  </h3>
                  <button onClick={() => setShowFollowModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '1.5rem', cursor: 'pointer', transition: '0.3s' }}>×</button>
                </div>
                <div style={{ padding: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                  {(followModalType === 'seguidores' ? followers : following).length === 0 && (
                    <p style={{ textAlign: 'center', color: 'gray', padding: '2rem 0' }}>No hay usuarios en esta lista aún.</p>
                  )}
                  {(followModalType === 'seguidores' ? followers : following).map(user => (
                    <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', transition: '0.2s', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.02)' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <img src={user.profilePic || '/img/perfil-6.png'} alt={user.firstName} style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <strong style={{ display: 'block', color: 'white', fontSize: '0.9rem' }}>{user.firstName} {user.lastName}</strong>
                        <span style={{ color: 'var(--lemon)', fontSize: '0.75rem' }}>@{user.firstName?.toLowerCase() || 'usuario'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/mensajes', { state: { openChatId: user.id } });
                          }}
                          style={{ background: 'var(--lemon)', border: 'none', color: 'black', padding: '0.5rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '900', transition: 'all 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          CHATEAR 💬
                        </button>
                        {user.id !== auth.currentUser?.uid && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollowToggle(user);
                            }}
                            style={{ 
                              background: following.some(u => u.id === user.id) ? 'rgba(255,60,0,0.1)' : 'var(--lemon)', 
                              border: following.some(u => u.id === user.id) ? '1px solid rgba(255,60,0,0.5)' : 'none', 
                              color: following.some(u => u.id === user.id) ? '#ff5f56' : 'black', 
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
                            title={following.some(u => u.id === user.id) ? 'Dejar de seguir' : 'Seguir'}
                          >
                            {following.some(u => u.id === user.id) ? 'X' : '+'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default Perfil;
