import Particles from '../components/Particles';

function Artistas() {
  const residents = [
    {
      nombre: "VICKY",
      tag: "DJ RESIDENTE",
      desc: "Define el sonido de casa con sesiones intensas y una selección de Dembow siempre a la última. Vicky es una de las piezas clave del sonido de Bajo Mundo.",
      img: "/img/vicky-artistas.png",
      className: "artist-img-vicky"
    },
    {
      nombre: "DJ CHIEF",
      tag: "DJ RESIDENTE",
      desc: "Cierres impresionantes a altas horas de la madrugada. Lleva el Dembow por bandera. Sus sets se construyen con presión constante y transiciones precisas.",
      img: "/img/chief-artistas.png",
      className: "artist-img-chief"
    }
  ];

  const voteItems = [
    { nombre: "VICKY", img: "/img/vicky-artistas.png" },
    { nombre: "DJ CHIEF", img: "/img/chief-artistas.png" },
    { nombre: "DJ BLAZE", img: "/img/perfil-2.png" },
    { nombre: "LUNA", img: "/img/perfil-3.png" },
    { nombre: "K-FLOW", img: "/img/perfil-4.png" }
  ];

  return (
    <div className="artistas-page">
      <header className="artist-hero">
        <Particles />
        <div className="container">
          <div className="artist-hero-sign">
            <h1 className="artist-hero-text">ARTISTAS</h1>
          </div>
          <p className="artist-hero-desc">NUESTROS RESIDENTES</p>
        </div>
      </header>

      <section className="container section-padding">
        {residents.map((artist, index) => (
          <div className="artist-profile" key={index}>
            <div className="artist-img-container">
              <img src={artist.img} className={artist.className} alt={artist.nombre} />
            </div>
            <div className="artist-info">
              <h2>{artist.nombre}</h2>
              <span className="artist-tag">{artist.tag}</span>
              <h4 className="text-primary mb-1">El Dembow que no descansa</h4>
              <p>{artist.desc}</p>
              <a href="#" className="artist-link">DESCUBRE MÁS <span>&#10140;</span></a>
            </div>
          </div>
        ))}
      </section>

      <section className="section-padding artist-vote-section">
        <div className="container text-center">
          <h2 className="bungee-font mb-2">¿CUÁL ES TU FAVORITO?</h2>
          <p className="vote-desc mb-5">VOTA AL PRÓXIMO PROTAGONISTA</p>
          
          <div className="vote-circles-container">
            {voteItems.map((item, index) => (
              <div className="vote-item" key={index}>
                <div className="vote-circle">
                  <img src={item.img} alt={item.nombre} />
                  <div className="vote-overlay">VOTAR</div>
                </div>
                <h4>{item.nombre}</h4>
              </div>
            ))}
          </div>
          
          <a href="#" className="btn btn-primary btn-vote mt-4">ENVIAR VOTO</a>
        </div>
      </section>
    </div>
  );
}

export default Artistas;
