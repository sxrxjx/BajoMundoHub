import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

function DashboardUsuario() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
            <img src="/img/perfil-6.png" alt="Profile" className="profile-img" />
          </div>
          <h2 className="profile-name">SARA<br />JIMÉNEZ</h2>
          <p className="profile-email">{userData?.email || 'saraj@gmail.com'}</p>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li className="active"><Link to="/"><span className="icon">🏠</span> Inicio</Link></li>
            <li><Link to="/perfil"><span className="icon">👤</span> Perfil</Link></li>
            <li><Link to="/mensajes"><span className="icon">💬</span> Mensajes</Link></li>
            <li><Link to="/notificaciones"><span className="icon">🔔</span> Notificaciones</Link></li>
            <li><Link to="/ajustes"><span className="icon">⚙️</span> Ajustes</Link></li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <img src="/img/logo.png" alt="Logo" className="sidebar-logo" />
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
                  const hasEvent = dayNum === 10 || dayNum === 21 || dayNum === 28;
                  
                  return (
                    <span key={dayNum} className={`mini-date ${isToday ? 'is-today' : ''} ${hasEvent ? 'has-event' : ''}`}>
                      {dayNum}
                    </span>
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
                <div className="level-progress" style={{width: '70%'}}></div>
                <div className="level-badge">Lv 10</div>
              </div>
              <h4 className="level-status">¡ESO ESTÁ PELUCHE!</h4>
              <p>Estás on fire, no te pierdes ni una, ¡qué bacano!</p>
              <button className="btn-widget">FORMULARIO DE ASISTENCIA &#10140;</button>
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
              <div className="connection-item">
                <img src="/img/perfil-1.png" alt="Olivia" />
                <div className="conn-info">
                  <strong>OLIVIA</strong>
                  <span>Artista</span>
                </div>
                <button className="btn-connect">+</button>
              </div>
              <div className="connection-item">
                <img src="/img/perfil-2.png" alt="Weso" />
                <div className="conn-info">
                  <strong>WESO</strong>
                  <span>Organizador</span>
                </div>
                <button className="btn-connect">+</button>
              </div>
            </div>
            <button className="btn-text">DESCUBRE MÁS &#10140;</button>
          </div>

          {/* RECOMPENSAS */}
          <div className="widget-box rewards-box">
            <div className="widget-header">
              <h3>RECOMPENSAS</h3>
              <span className="widget-icon">🔖</span>
            </div>
            <div className="rewards-list">
              <div className="reward-card">
                <img src="/img/prox-1.png" alt="Pase" />
                <div className="reward-info">
                  <h4>PASE GRATIS</h4>
                  <p>Pasa gratis hasta las 1:00</p>
                  <button className="btn-mini">DESCARGAR INVITACIÓN &#10140;</button>
                </div>
              </div>
              <div className="reward-card">
                <img src="/img/prox-2.png" alt="Código" />
                <div className="reward-info">
                  <h4>CÓDIGO DE DESCUENTO</h4>
                  <p>Canjea este código en tu próxima entrada</p>
                  <button className="btn-mini">CANJEAR CÓDIGO &#10140;</button>
                </div>
              </div>
            </div>
            <button className="btn-text">TODAS LAS RECOMPENSAS &#10140;</button>
          </div>

          {/* MI GALERÍA */}
          <div className="widget-box gallery-box">
            <div className="widget-header">
              <h3>MI GALERÍA</h3>
              <span className="widget-icon">🖼️</span>
            </div>
            <div className="gallery-mosaic">
              <img src="/img/1.png" alt="1" className="mos-1" />
              <img src="/img/2.png" alt="2" className="mos-2" />
              <img src="/img/4.png" alt="3" className="mos-3" />
              <img src="/img/perfil-1.png" alt="4" className="mos-4" />
              <img src="/img/perfil-2.png" alt="5" className="mos-5" />
              <img src="/img/perfil-3.png" alt="6" className="mos-6" />
            </div>
            <button className="btn-text">MI CONTENIDO &#10140;</button>
          </div>

        </div>
      </main>
    </div>
  );
}

export default DashboardUsuario;
