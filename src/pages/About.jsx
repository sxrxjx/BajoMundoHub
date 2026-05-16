import { useState } from 'react';
import Particles from '../components/Particles';

function About() {
  const [selectedLetter, setSelectedLetter] = useState('A');
  
  const glossary = {
    'A': [
      { term: 'Acitunaíto', def: 'Persona que tiene un color de piel aceitunado o bronceado.' },
      { term: 'A fuego', def: 'Algo que está muy bien, excelente o intenso.' }
    ],
    'B': [
      { term: 'Bebecita', def: 'Término cariñoso para referirse a una mujer.' },
      { term: 'Bandidaje', def: 'Actitud rebelde o de calle.' }
    ],
    'C': [
      { term: 'Capea el Dough', def: 'Referencia a la mítica serie de colaboraciones del rap dominicano.' },
      { term: 'Chucky', def: 'Estar en modo rebelde, con mucha energía o "ready" para la acción.' },
      { term: 'Cero Coro', def: 'No querer saber de alguien o cortar toda relación.' }
    ],
    'D': [
      { term: 'Dembow', def: 'El ritmo que nos mueve. Género urbano rey de la República Dominicana.' },
      { term: 'De lo mío', def: 'Expresión para referirse a un amigo cercano o alguien de confianza.' }
    ],
    'E': [
      { term: 'En alta', def: 'Estar en el mejor momento, con la energía al máximo.' }
    ],
    'G': [
      { term: 'Gatillero', def: 'Alguien que lanza rimas pesadas o tiene un flow agresivo.' }
    ],
    'H': [
      { term: 'Heavy', def: 'Algo que es genial, cool o está muy bien.' }
    ],
    'J': [
      { term: 'Jevito', def: 'Persona que viste con estilo, a la moda urbana.' },
      { term: 'Jevo/a', def: 'Pareja o persona que te gusta.' }
    ],
    'K': [
      { term: 'Klk', def: '¿Qué lo que? El saludo universal del Bajo Mundo.' }
    ],
    'L': [
      { term: 'La Pampara', def: 'Tener el brillo, el éxito o estar en lo más alto.' }
    ],
    'M': [
      { term: 'Montra', def: 'Persona con un talento o habilidad fuera de lo común.' }
    ],
    'P': [
      { term: 'Pila', def: 'Significa "mucho". Tener pila de energía, pila de gente.' },
      { term: 'Popi', def: 'Persona de clase alta o que aparenta tener mucho dinero.' }
    ],
    'R': [
      { term: 'Ranqueao', def: 'Alguien con estatus, respeto y trayectoria en la calle.' },
      { term: 'Rulay', def: 'Estar de fiesta, relajado y pasándola bien.' }
    ],
    'T': [
      { term: 'Tigueraje', def: 'La astucia y sabiduría que solo se aprende en la calle.' },
      { term: 'Tiguere', def: 'Persona astuta, sagaz y con mundo.' }
    ],
    'W': [
      { term: 'Wawawa', def: 'La esencia del barrio, la gente humilde y auténtica de la calle.' }
    ]
  };

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className="about-page">
      <header className="about-hero">
        <Particles />
        <div className="container">
          <div className="about-hero-sign">
            <h1 className="about-hero-text">ABOUT</h1>
          </div>
          <p className="about-hero-desc">Más que fiestas, creamos experiencias. Aquí está la historia, la visión y la filosofía que dan la nota.</p>
        </div>
      </header>

      <section className="section-padding">
        <div className="container">
          <h2 className="manifesto-title">MANIFIESTO<br /><span>CULTURAL</span></h2>
          <div className="manifesto-grid">
            <div className="manifesto-card">
              <span className="manifesto-num">01</span>
              <p>Bajo Mundo nace de la calle, del pulso urbano y de la música que conecta a la gente más allá de la pista. Cada noche que organizamos es un espacio de libertad, creatividad y encuentro.</p>
            </div>
            <div className="manifesto-card highlights">
              <span className="manifesto-num">02</span>
              <p>Nuestra misión es que cada persona que entra a Bajo Mundo sienta que forma parte de algo más grande. No buscamos ser una fiesta más: buscamos un lugar donde la identidad se mezcle.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-black-alt">
        <div className="container">
          <h2 className="manifesto-title">GLOSARIO<br /><span>NUESTRA JERGA</span></h2>
          <div className="alphabet-nav">
            {alphabet.map(letter => (
              <button 
                key={letter} 
                className={`letter-btn ${selectedLetter === letter ? 'active' : ''}`}
                onClick={() => setSelectedLetter(letter)}
              >
                {letter}
              </button>
            ))}
          </div>

          <div className="glossary-grid">
            {glossary[selectedLetter] ? glossary[selectedLetter].map((item, index) => (
              <div className="glossary-item-card" key={index}>
                <h3 className="glossary-term">{item.term}</h3>
                <p className="glossary-definition">{item.def}</p>
              </div>
            )) : (
              <p className="text-muted">No hay términos para esta letra todavía.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
