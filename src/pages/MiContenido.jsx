import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationsBalloon from '../components/NotificationsBalloon';

function MiContenido() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedImg, setSelectedImg] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const unsubUser = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            setGallery(data.gallery || []);
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Por favor, sube solo imágenes.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    // Limitamos el tamaño del archivo original
    if (file.size > 2 * 1024 * 1024) { // 2MB
      setMessage({ type: 'error', text: 'La imagen es muy pesada. Usa una menor a 2MB.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: 'Optimizando imagen para el barrio...' });

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; // Un poco más grande para galería
        const MAX_HEIGHT = 800;
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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // 60% quality para asegurar tamaño

        try {
          const user = auth.currentUser;
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, {
            gallery: arrayUnion(dataUrl)
          });
          
          setMessage({ type: 'success', text: '¡Imagen añadida a tu galería!' });
        } catch (error) {
          console.error("Error guardando foto:", error);
          setMessage({ type: 'error', text: 'Error al subir la imagen.' });
        } finally {
          setUploading(false);
          setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      setUploading(false);
      setMessage({ type: 'error', text: 'Error al leer la imagen.' });
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = async (imgUrl, e) => {
    e.stopPropagation();
    if(window.confirm("¿Seguro que quieres eliminar esta foto de tu galería?")) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const newGallery = gallery.filter(url => url !== imgUrl);
        await updateDoc(userRef, {
          gallery: newGallery
        });
        setMessage({ type: 'success', text: 'Foto eliminada con éxito.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        console.error("Error al borrar foto", error);
        setMessage({ type: 'error', text: 'Error al borrar la foto.' });
      }
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
      <main className="dashboard-main" style={{ padding: '2rem' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="content-header"
          style={{ marginBottom: '2rem' }}
        >
          <h1 style={{ fontFamily: 'Bungee', color: 'var(--lemon)', fontSize: '2.5rem', margin: 0 }}>MI CONTENIDO</h1>
          <p style={{ color: 'var(--text-muted)' }}>Sube y administra las fotos de tu galería personal.</p>
        </motion.div>

        {/* CONTROLES DE SUBIDA */}
        <div style={{ background: '#120804', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ fontFamily: 'Bungee', color: 'white', marginTop: 0 }}>SUBIR NUEVA FOTO</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label 
              style={{ 
                background: 'var(--lemon)', 
                color: 'black', 
                padding: '0.8rem 1.5rem', 
                borderRadius: '10px', 
                fontWeight: 'bold', 
                cursor: 'pointer',
                transition: '0.3s',
                opacity: uploading ? 0.5 : 1
              }}
            >
              {uploading ? 'SUBIENDO...' : 'SELECCIONAR IMAGEN 📷'}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                disabled={uploading}
                style={{ display: 'none' }} 
              />
            </label>
            
            {message.text && (
              <span style={{ color: message.type === 'error' ? '#ff5f56' : 'var(--lemon)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                {message.text}
              </span>
            )}
          </div>
        </div>

        {/* GALERÍA DE IMÁGENES */}
        <div>
          <h3 style={{ fontFamily: 'Bungee', color: 'white', marginBottom: '1.5rem' }}>TU GALERÍA ({gallery.length})</h3>
          
          {gallery.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <p style={{ color: 'gray' }}>Aún no has subido ninguna foto al barrio.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {gallery.map((imgUrl, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedImg(imgUrl)}
                  style={{ 
                    position: 'relative',
                    aspectRatio: '1', 
                    borderRadius: '15px', 
                    overflow: 'hidden', 
                    cursor: 'pointer',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeletePhoto(imgUrl, e); }}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(255, 59, 48, 0.8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10,
                      fontSize: '1.2rem',
                      lineHeight: '1'
                    }}
                    title="Borrar foto"
                  >
                    ×
                  </button>
                  <img src={imgUrl} alt={`Foto ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODAL LIGHTBOX */}
      {selectedImg && (
        <div className="lightbox-overlay" onClick={() => setSelectedImg(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
          <div className="lightbox-content" style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <button className="close-lightbox" style={{ position: 'absolute', top: '-40px', right: 0, background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer' }}>&times;</button>
            <img src={selectedImg} alt="Enlarged view" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '10px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default MiContenido;
