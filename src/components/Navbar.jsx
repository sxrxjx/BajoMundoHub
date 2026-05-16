import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const unsubUser = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        });
        return () => unsubUser();
      } else {
        setUserData(null);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  return (
    <nav className={`navbar-main ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <img src="/img/logo.png" alt="Bajo Mundo Hub" className="logo-base" />
          <img src="/img/logo_grad.png" alt="Bajo Mundo Hub" className="logo-hover" />
        </Link>
        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✖' : '☰'}
        </button>
        <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <Link to="/eventos" onClick={() => setMenuOpen(false)}>Eventos</Link>
          <Link to="/comunidad" onClick={() => setMenuOpen(false)}>Comunidad</Link>
          <Link to="/artistas" onClick={() => setMenuOpen(false)}>Artistas</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
          <Link to="/colabs" onClick={() => setMenuOpen(false)}>Colabs</Link>
          {currentUser ? (
            <Link to="/dashboard-usuario" onClick={() => setMenuOpen(false)} className="nav-profile-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.3rem 1rem 0.3rem 0.3rem', borderRadius: '30px', textDecoration: 'none', transition: '0.3s' }}>
              <img 
                src={userData?.profilePic || "/img/perfil-6.png"} 
                alt="Profile" 
                style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--lemon)' }}
              />
              <span style={{ color: 'white', fontFamily: 'Bungee', fontSize: '0.9rem' }}>
                {userData?.firstName ? userData.firstName.toUpperCase() : 'PANEL'}
              </span>
            </Link>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="login-btn">Log In</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
