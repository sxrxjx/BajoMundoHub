import { useState, useEffect } from 'react';

function Eventos() {
  const [activeYear, setActiveYear] = useState('2024');

  const events = {
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

  return (
    <div className="eventos-page">
      <header className="event-hero">
        <div className="particles"></div>
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
              {/* Calendar component would go here */}
              <div className="calendar-widget">
                <div className="calendar-header">
                   <span>MARZO 2026</span>
                </div>
                <div className="calendar-days">
                   <span>Lu</span><span>Ma</span><span>Mi</span><span>Ju</span><span>Vi</span><span>Sa</span><span>Do</span>
                   {Array.from({length: 31}).map((_, i) => (
                     <span key={i} className={(i+1 === 10 || i+1 === 25) ? 'has-event' : ''}>{i + 1}</span>
                   ))}
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
            {events[activeYear].map((event, index) => (
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
