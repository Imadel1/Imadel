import React from 'react';
import { Link } from 'react-router-dom';
import './AboutUs.css';
import aboutHeroImage from '../assets/imadel-5.jpg';
import missionImage from '../assets/imadel-7.jpg';
import activitiesImage from '../assets/p2imadel 3.jpg';

// Images from assets
const ABOUT_HERO_IMAGE = aboutHeroImage;
const MISSION_IMAGE = missionImage;
const ACTIVITIES_IMAGE = activitiesImage;

const OBJECTIVES = [
  "Contribuer au renforcement des capacités des acteurs de développement en vue d'accélérer la prise en main et l'appropriation du développement local",
  "Favoriser le renforcement d'une société civile participant à la formulation et à la mise en œuvre des politiques de développement",
  "Promouvoir la démocratie, la bonne gouvernance et accompagner la mise en œuvre de la politique de décentralisation dans le pays",
  "Renforcer le partenariat en dynamisant les efforts de l'État et des ONG et associations partenaires en appui aux communautés",
  "Œuvrer pour un développement durable, équitable et participatif"
];

const AboutUs: React.FC = () => {
  return (
    <div className="about-us">
      {/* Hero Section */}
      <section className="about-hero" aria-labelledby="about-hero-heading">
        <div 
          className="hero-background" 
          style={{ backgroundImage: `url(${ABOUT_HERO_IMAGE})` }}
          aria-hidden="true"
        />
        <div className="hero-overlay" aria-hidden="true" />
        <div className="hero-content">
          <h1 id="about-hero-heading">Au service du développement local</h1>
          <p>
            IMADEL (Initiative Malienne d'Appui au Développement Local) est une organisation non gouvernementale (ONG).
            Elle contribue au développement économique et social du monde en favorisant et en soutenant des actions
            visant à améliorer les conditions de vie des populations (rurales, urbaines et autres groupes défavorisés).
          </p>
        </div>
      </section>

      {/* Mission and Vision */}
      <section className="mission-vision" aria-labelledby="mission-vision-heading">
        <div className="container">
          <div className="mission-vision-grid">
            <div className="mission">
              <div className="mission-image">
                <img 
                  src={MISSION_IMAGE} 
                  alt="Équipe IMADEL travaillant sur des projets de développement communautaire"
                  loading="lazy"
                  width={600}
                  height={400}
                />
              </div>
              <div className="mission-content">
                <h2 id="mission-vision-heading">Notre Mission</h2>
                <p>
                  IMADEL est le fruit de la volonté de ses membres de contribuer au développement économique et social
                  de la population. Les membres d'IMADEL sont tous des acteurs ayant acquis et développé des compétences dans le
                  domaine du développement local. Ces expériences portent sur des secteurs prioritaires tels que l'hydraulique, l'agriculture,
                  l'élevage, la décentralisation, le renforcement des capacités, la migration, l'environnement/assainissement, la santé, l'éducation, etc.
                  Ces expériences ont été largement partagées avec les groupes vulnérables.
                </p>
              </div>
            </div>
            <div className="vision">
              <h2>Notre Vision</h2>
              <p>
                Apporter un appui technique, matériel et financier aux associations ou groupements humains pour l'amélioration
                de leurs conditions de vie et leur auto-promotion ; Contribuer efficacement au développement économique, social et
                culturel de la population malienne, selon les cadres de référence adoptés par les Gouvernements.
              </p>
              <p>
                Depuis quinze ans, IMADEL a entrepris des actions pour accélérer l'atteinte des Objectifs du Millénaire pour le Développement.
                Ces actions ont contribué de manière significative à l'accès à l'eau potable, à l'hygiène et à l'assainissement,
                à la sécurité alimentaire, à l'éducation et à la formation en santé maternelle et infantile par des actions de grande envergure pour des milliers
                d'hommes, de femmes et d'enfants à travers le Mali.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section" aria-label="Statistiques de l'organisation">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item" role="region" aria-label="Plus de 15 ans d'expérience">
              <div className="stat-number" aria-label="15 plus">15+</div>
              <div className="stat-label">Années</div>
            </div>
            <div className="stat-item" role="region" aria-label="Plus de 50 projets réalisés">
              <div className="stat-number" aria-label="50 plus">50+</div>
              <div className="stat-label">Projets Réalisés</div>
            </div>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="activities" aria-labelledby="activities-heading">
        <div className="container">
          <div className="activities-content">
            <div className="activities-text">
              <h2 id="activities-heading">Nos Activités</h2>
              <p>
                15 ans au service du développement. Depuis quinze ans, IMADEL a entrepris des actions pour accélérer
                l'atteinte des Objectifs du Millénaire pour le Développement. Ces actions ont contribué de manière significative à
                l'accès à l'eau potable, à l'hygiène et à l'assainissement, à la sécurité alimentaire, à l'éducation et à la formation en santé maternelle
                et infantile par des actions de grande envergure pour des milliers d'hommes, de femmes et d'enfants à travers le Mali.
              </p>
              <p>
                Nos activités couvrent de nombreux secteurs, notamment l'hydraulique rurale et urbaine, la décentralisation,
                l'hygiène et l'assainissement, l'éducation, la formation, le plaidoyer et le lobbying, l'environnement, la santé et le développement local.
              </p>
              <Link to="/ourwork" className="btn-primary">
                Voir Nos Projets
              </Link>
            </div>
            <div className="activities-image">
              <img 
                src={ACTIVITIES_IMAGE} 
                alt="Activités et projets IMADEL dans les communautés à travers le Mali"
                loading="lazy"
                width={600}
                height={400}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Objectives Section */}
      <section className="objectives" aria-labelledby="objectives-heading">
        <div className="container">
          <h2 id="objectives-heading">Nos Objectifs</h2>
          <div className="objectives-list" role="list">
            {OBJECTIVES.map((objective, index) => (
              <div key={index} className="objective-item" role="listitem">
                <div className="objective-icon" aria-hidden="true">✓</div>
                <p>{objective}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section" aria-labelledby="cta-heading">
        <div className="container">
          <h2 id="cta-heading">Rejoignez-nous dans notre mission</h2>
          <p>Participez à notre voyage pour créer un développement durable, équitable et participatif à travers le Mali.</p>
          <div className="cta-buttons">
            <Link to="/getinvolved" className="btn-primary">
              S'impliquer
            </Link>
            <Link to="/donate" className="btn-secondary">
              Faire un Don
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
