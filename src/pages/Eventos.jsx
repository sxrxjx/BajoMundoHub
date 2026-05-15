import { useState, useEffect } from 'react';
import Particles from '../components/Particles';

function Eventos() {
  const [activeYear, setActiveYear] = useState('2024');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState(null);

  const today = new Date();

  // Datos de los próximos eventos (extraídos de tu scripts.js original)
  const eventsData = {
    10: { title: "Bajo Mundo x Planta", info: "Vicky + Bleggg", img: "/img/prox-1.png" },
    21: { title: "Edición Intensa", info: "Secret Lineup", img: "/img/prox-2.png" },
    28: { title: "Networking DJ", info: "Terraza G10", img: "/img/prox-2.png" }
  };

  const pastEvents = {
    '2023': [
      { img: '/img/past-event-4.png', day: '15', month: 'Enero', year: '2023', dayName: 'Domingo' },
      { img: '/img/past-event-1.png', day: '20', month: 'Mayo', year: '2023', dayName: 'Lunes', primary: true }
    ],
    '2024': [
      { img: '/img/past-event-1.png', day: '09', month: 'Marzo', year: '2024', dayName: 'Viernes' },
      { img: '/img/past-event-2.png', day: '30', month: 'Marzo', year: '2024', dayName: 'Viernes', primary: true },
      { img: '/img/past-event-3.png', day: '26', month: 'Julio', year: '2024', dayName: 'Sábado' }
    ],
    '2025': [
      { img: '/img/past-event-2.png', day: '12', month: 'Diciembre', year: '2025', dayName: 'Martes' },
      { img: '/img/past-event-3.png', day: '12', month: 'Diciembre', year: '2025', dayName: 'Martes' }
    ]
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDay = firstDay === 0 ? 6 : firstDay - 1;
    
    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(<span key={`empty-${i}`} className="calendar-date muted"></span>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const eventInfo = (month === today.getMonth() && year === today.getFullYear()) ? eventsData[i] : null;
      const isToday = i === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      
      days.push(
        <span 
          key={i} 
          className={`calendar-date ${eventInfo ? 'has-event' : ''} ${isToday ? 'is-today active' : ''}`}
          style={{ position: 'relative' }}
          onMouseEnter={() => setHoveredDay(i)}
          onMouseLeave={() => setHoveredDay(null)}
        >
          {i}
          {eventInfo && hoveredDay === i && (
            <div className="calendar-tooltip" style={{ display: 'block', bottom: '120%', left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
              <img src={eventInfo.img} alt="Event" />
              <h4>{eventInfo.title}</h4>
              <p>{eventInfo.info}</p>
            </div>
          )}
        </span>
      );
    }
    return days;
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const monthNames = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];

  return (
    <div className="eventos-page">
      <header className="event-hero">
        <Particles />
        <div className="container">
          <div className="event-logo-sign">
            <h1 className="event-logo-text">EVENTOS</h1>
          </div>
          <p className="event-hero-desc">Explora los próximos eventos y revive ediciones anteriores. No te dejes llevar por la melancolía y apúntate a la siguiente.</p>
          <a href="#" className="btn btn-primary">¡ME APUNTO!</a>
        </div>
      </header>

      <section className="next-events section-padding">
        <div className="container">
          <h2 className="bungee-font text-center mb-4">Próximas<br />Fechas</h2>
          <div className="grid grid-2">
            <div className="events-list">
              <div className="event-card-horizontal">
                <img src="/img/prox-1.png" alt="Bajo Mundo x Planta Baja" />
                <div className="event-card-body">
                  <h3>Bajo Mundo x Planta Baja</h3>
                  <p className="event-card-desc">El clásico, el que no falla. Con nuestra dj residente VICKY y dos special guests: BLEGGG desde Almería y GIGL284 directa de Madrid.</p>
                  <a href="#" className="event-card-link">DESCUBRE LOS DETALLES <span>&#10140;</span></a>
                </div>
              </div>
              <div className="event-card-horizontal">
                <img src="/img/prox-2.png" alt="Bajo Mundo Intenso x G10" />
                <div className="event-card-body">
                  <h3>Bajo Mundo Intenso x G10</h3>
                  <p className="event-card-desc">Para los amantes de lo extremo. Déjate sorprender por nuestra edición intensa. Lineup y artista principal por anunciar.</p>
                  <a href="#" className="event-card-link">MÁS INFORMACIÓN <span>&#10140;</span></a>
                </div>
              </div>
            </div>
            
            <div className="calendar-container">
              <div className="calendar-widget">
                <div className="calendar-header">
                   <button className="calendar-nav-btn" onClick={prevMonth} style={{transform: 'rotate(180deg)'}}>&#10140;</button>
                   <span>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                   <button className="calendar-nav-btn" onClick={nextMonth}>&#10140;</button>
                </div>
                <div className="calendar-days">
                   <span className="day-label">Lu</span><span className="day-label">Ma</span><span className="day-label">Mi</span><span className="day-label">Ju</span><span className="day-label">Vi</span><span className="day-label">Sa</span><span className="day-label">Do</span>
                   {renderCalendar()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="past-events section-padding bg-black">
        <div className="container">
          <h2 className="bungee-font text-center mb-2">Eventos<br />Pasados</h2>
          <div className="past-events-tabs">
            {['2023', '2024', '2025'].map(year => (
              <span 
                key={year} 
                className={`tab-year ${activeYear === year ? 'active' : ''}`}
                onClick={() => setActiveYear(year)}
              >
                {year}
              </span>
            ))}
          </div>

          <div className="past-events-grid">
            {pastEvents[activeYear].map((event, index) => (
              <div className="past-event-card" key={index}>
                <img src={event.img} alt="Evento Pasado" />
                <div className="past-event-overlay">
                  <span className="past-event-day-name">{event.dayName}</span>
                  <h2 className={`past-event-day ${event.primary ? 'primary' : ''}`}>{event.day}</h2>
                  <p className="past-event-month">{event.month} <span className="past-event-year">{event.year}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Eventos;
