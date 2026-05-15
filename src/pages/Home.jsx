import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Particles from '../components/Particles';

function Home() {
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });

  useEffect(() => {
    const targetDate = new Date('2026-06-10T23:59:59').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0'),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0'),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0'),
        seconds: Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0')
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-page">
      <header className="hero">
        <Particles />
        <img src="/img/fondo-platano.png" alt="Platano" className="hanging-platano" />
        <img src="/img/fondo-bolsa.png" alt="Bolsa" className="hanging-bolsa" />

        <div className="container hero-container">
          <img src="/img/Banner-Logo.png" alt="Bajo Mundo Hub Logo" className="hero-logo" />

          <div className="cta-container">
            <Link to="/eventos" className="btn btn-primary btn-hero">PRÓXIMOS EVENTOS &#10140;</Link>
          </div>

          <div className="countdown-container countdown-wrapper">
            <div className="countdown-grid">
              <div className="countdown-unit">
                <span className="countdown-number">{timeLeft.days}</span>
                <span className="countdown-label">DÍAS</span>
              </div>
              <div className="countdown-separator">:</div>
              <div className="countdown-unit">
                <span className="countdown-number">{timeLeft.hours}</span>
                <span className="countdown-label">HORAS</span>
              </div>
              <div className="countdown-separator">:</div>
              <div className="countdown-unit">
                <span className="countdown-number">{timeLeft.minutes}</span>
                <span className="countdown-label">MINUTOS</span>
              </div>
              <div className="countdown-separator">:</div>
              <div className="countdown-unit">
                <span className="countdown-number">{timeLeft.seconds}</span>
                <span className="countdown-label">SEGUNDOS</span>
              </div>
            </div>
          </div>

          <div className="hero-info">
            <h3>¿Te vas a perder nuestro próximo evento?</h3>
            <p className="text-muted">Comprueba cómo de cerca estás de poder disfrutar de una experiencia única con nosotros</p>
            <Link to="/eventos" className="link-primary">PRÓXIMOS EVENTOS <span>&#10140;</span></Link>
          </div>
        </div>
      </header>

      <div className="marquee">
        <div className="marquee-content">
          <Link to="/eventos" className="marquee-item">Eventos</Link>
          <Link to="/comunidad" className="marquee-item">Comunidad</Link>
          <Link to="/artistas" className="marquee-item">Artistas</Link>
          <Link to="/about" className="marquee-item">About</Link>
          <Link to="/colabs" className="marquee-item">Colabs</Link>
          <a href="#" className="marquee-item">Contacto</a>
          {/* Repeat for loop */}
          <Link to="/eventos" className="marquee-item">Eventos</Link>
          <Link to="/comunidad" className="marquee-item">Comunidad</Link>
          <Link to="/artistas" className="marquee-item">Artistas</Link>
          <Link to="/about" className="marquee-item">About</Link>
          <Link to="/colabs" className="marquee-item">Colabs</Link>
          <a href="#" className="marquee-item">Contacto</a>
        </div>
      </div>

      <section className="playlists section-padding">
        <div className="container">
          <div className="grid grid-2">
            <div className="playlists-content">
              <h2 className="bungee-font playlist-heading">Últimas<br />Playlists</h2>

              <div className="playlist-card card">
                <img src="/img/Portada-bandidaje.png" alt="Bandidaje Intenso" className="playlist-img" />
                <div className="playlist-info">
                  <h4 className="playlist-title">Bandidaje Intenso</h4>
                  <p className="playlist-desc">@bajomundo__ • Dembow duro</p>
                  <p className="playlist-text">La selección definitiva para el perreo más oscuro y el dembow que retumba en los callejones.</p>
                </div>
              </div>

              <div className="playlist-card card">
                <img src="/img/Portada-sufridos.png" alt="Para Sufridos" className="playlist-img" />
                <div className="playlist-info">
                  <h4 className="playlist-title">Para Sufridos</h4>
                  <p className="playlist-desc">@bajomundo__ • Bachata & Perreo</p>
                  <p className="playlist-text">Cuando el corazón duele pero el cuerpo pide movimiento. El balance perfecto entre bachata y sentimiento.</p>
                </div>
              </div>

              <Link to="/comunidad" className="link-primary link-left">DESCUBRE MÁS <span>&#10140;</span></Link>
            </div>

            <div className="gallery-preview">
              <h2 className="bungee-font gallery-heading">Nuestra<br />Galería</h2>
              <div className="gallery-container card">
                <img src="/img/2.png" alt="Nuestra Galería" className="gallery-img" />
                <div className="gallery-overlay">
                  <Link to="/comunidad" className="btn btn-primary">Sube la tuya &rarr;</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-banner section-padding cta-section">
        <div className="container cta-container-centered">
          <h2 className="bungee-font cta-heading cta-heading-black">Únete a nosotros</h2>
          <p className="cta-subtext">CONECTA con el flow del Bajo Mundo</p>

          <div className="grid grid-3">
            <div className="feature-card">
              <div className="feature-icon"><img src="/img/descuentos.png" alt="Descuentos" /></div>
              <p className="feature-text">Accede a descuentos exclusivos y recibe invitaciones especiales</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><img src="/img/niveles.png" alt="Niveles" /></div>
              <p className="feature-text">Participa, gana visibilidad y desbloquea nuevos niveles</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><img src="/img/conecta.png" alt="Conecta" /></div>
              <p className="feature-text">Conecta con artistas, DJs y gente de la escena que mueve la cultura actual</p>
            </div>
          </div>

          <Link to="/login" className="btn btn-primary btn-hero">ÚNETE A NUESTRA COMUNIDAD &#10140;</Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
