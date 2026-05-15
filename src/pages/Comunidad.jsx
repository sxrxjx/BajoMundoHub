import { Link } from 'react-router-dom';
import Particles from '../components/Particles';

function Comunidad() {
  return (
    <div className="comunidad-page">
      <header className="comunidad-hero">
        <Particles />
        <div className="container">
          <div className="comunidad-hero-sign">
            <h1 className="comunidad-hero-text">COMUNIDAD</h1>
          </div>
          <p className="comunidad-hero-desc">Mucho más que una fiesta. Una cultura movida por la pasión.</p>
          <Link to="/login" className="btn btn-primary mt-2">ÚNETE A NOSOTROS</Link>
        </div>
      </header>

      <section className="section-padding bg-dark">
        <div className="container">
          <h2 className="bungee-font text-center mb-4" style={{ color: 'var(--lemon)' }}>Ranking de DJs<br />Emergentes</h2>
          <div className="ranking-container">
            <div className="ranking-podium">
              <div className="podium-card silver">
                <div className="podium-badge">2º</div>
                <img src="/img/perfil-2.png" alt="YUNI" />
                <h4>YUNI</h4>
                <p>Reggaetonero clásico</p>
              </div>
              <div className="podium-card gold">
                <div className="winner-particles"></div>
                <div className="podium-badge">1º</div>
                <img src="/img/perfil-1.png" alt="VICKY" />
                <h4>VICKY</h4>
                <p>Cuero poderoso al mando</p>
              </div>
              <div className="podium-card bronze">
                <div className="podium-badge">3º</div>
                <img src="/img/perfil-3.png" alt="GIGL284" />
                <h4>GIGL284</h4>
                <p>La tía del dembow pesado</p>
              </div>
            </div>

            <div className="ranking-list-container">
              <ul className="ranking-list">
                <li className="ranking-item">
                  <span className="ranking-num">4</span>
                  <img src="/img/perfil-4.png" alt="BLEGGG" />
                  <div className="ranking-info">
                    <h5>BLEGGG</h5>
                    <p>Flow Almería</p>
                  </div>
                  <div className="ranking-votes">2.4k votos</div>
                </li>
                <li className="ranking-item">
                  <span className="ranking-num">5</span>
                  <img src="/img/perfil-5.png" alt="DJ CHUCKY" />
                  <div className="ranking-info">
                    <h5>DJ CHUCKY</h5>
                    <p>Terror en la pista</p>
                  </div>
                  <div className="ranking-votes">1.8k votos</div>
                </li>
              </ul>
            </div>
            
            <div className="text-center mt-4">
              <a href="#" className="link-primary">¿QUIERES SER EL SIGUIENTE? <span>&#10140;</span></a>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          <h2 className="bungee-font text-center mb-4">Galería<br />Multimedia</h2>
          <div className="comunidad-gallery-grid">
            <div className="gallery-item large">
              <img src="/img/hero-eventos.gif" alt="Gallery" />
              <div className="gallery-overlay-text">
                <h3>AFTERMOVIES</h3>
                <p>Revive las mejores noches</p>
              </div>
            </div>
            <div className="gallery-item">
              <img src="/img/chief-artistas-set-1.gif" alt="Gallery" />
              <div className="gallery-overlay-text">
                <h3>DJ SETS</h3>
              </div>
            </div>
            <div className="gallery-item">
              <img src="/img/4.png" alt="Gallery" />
              <div className="gallery-overlay-text">
                <h3>BACKSTAGE</h3>
              </div>
            </div>
            <div className="gallery-item full-width">
              <img src="/img/1.png" alt="Gallery" />
              <div className="gallery-overlay-text">
                <h3>FANS</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-black reporte-section">
        <div className="container">
          <div className="text-center mb-4">
            <img src="/img/reporte.png" alt="El Reporte" className="reporte-title" style={{ maxWidth: '400px', height: 'auto' }} />
          </div>
          <div className="grid grid-2">
            <div className="reporte-card">
              <img src="/img/a.png" alt="Daddy Yankee" />
              <div className="reporte-card-content">
                <span className="reporte-tag">CULTURA</span>
                <h4>DADDY YANKEE ICONO CULTURAL</h4>
                <p>Según el senado de PR, Daddy Yankee es el máximo exponente del género y un pilar fundamental en la historia de la música urbana.</p>
                <a href="#" className="reporte-link">LEER MÁS <span>&#10140;</span></a>
              </div>
            </div>
            <div className="reporte-card">
              <img src="/img/b.png" alt="Francis El Más Viral" />
              <div className="reporte-card-content">
                <span className="reporte-tag">EMERGENTE</span>
                <h4>FRANCIS EL MÁS VIRAL</h4>
                <p>El joven talento necesita el apoyo de los grandes artistas para llevar su propuesta al siguiente nivel. Su viralidad es solo el comienzo.</p>
                <a href="#" className="reporte-link">LEER MÁS <span>&#10140;</span></a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Comunidad;
