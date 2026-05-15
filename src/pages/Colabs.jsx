import Particles from '../components/Particles';

function Colabs() {
  const projects = [
    {
      id: 1,
      title: "BAJO MUNDO X VANDAL TOYS",
      tag: "Evento especial Release Party por el drop limitado de Merchandising.",
      desc: "Nuestra fiesta se unió con Vandal Toys para crear una experiencia única que combinó música, estilo y comunidad. Durante el evento, los asistentes pudieron adquirir camisetas de merchandising exclusivas de Bajo Mundo.",
      img: "/img/12.png"
    },
    {
      id: 2,
      title: "BAJO MUNDO X LA CLÍNICA",
      tag: "Barbería instantánea en uno de los eventos Bajo Mundo.",
      desc: "Hicimos algo diferente junto a La Clínica, la barbería de Almería, durante la noche. Los asistentes pudieron recibir rapados y cortes de forma totalmente gratuita mientras bailaban y disfrutaban de la música.",
      img: "/img/23.png"
    }
  ];

  return (
    <div className="colabs-page">
      <header className="colab-hero">
        <Particles />
        <div className="container">
          <div className="colab-hero-sign">
            <h1 className="colab-hero-text">COLABS</h1>
          </div>
          <p className="colab-hero-desc">Nuestros proyectos van más allá.</p>
          <a href="#" className="btn btn-primary btn-white mt-2">CUÉNTANOS LA TUYA</a>
        </div>
      </header>

      {projects.map((project, index) => (
        <section className="colab-project" key={project.id}>
          <div className="container">
            <div className="colab-grid">
              <div className="colab-content">
                <h2>PROYECTO {project.id}:<br />{project.title}</h2>
                <p className="colab-project-tag">{project.tag}</p>
                <p>{project.desc}</p>
              </div>
              <div className="colab-img">
                <img src={project.img} alt={project.title} />
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

export default Colabs;
