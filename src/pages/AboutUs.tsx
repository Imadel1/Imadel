import React from 'react';
import { Link } from 'react-router-dom';
import './AboutUs.css';

// Dummy images
const ABOUT_HERO_IMAGE = "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1600&auto=format&fit=crop";
const MISSION_IMAGE = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop";
const ACTIVITIES_IMAGE = "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=800&auto=format&fit=crop";

const OBJECTIVES = [
  "Contribute to the capacity building of development actors with a view to accelerating the ownership and ownership of local development",
  "Promote the strengthening of a civil society participating in the formulation and implementation of development policies",
  "Promote democracy, good governance and support the implementation of the decentralization policy in the country",
  "Strengthen the partnership by boosting the efforts of the State and partner NGOs and associations in support of communities",
  "Work for sustainable, equitable and participatory development"
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
          <h1 id="about-hero-heading">At the service of local development</h1>
          <p>
            IMADEL (Malian Initiative for Local Development Support) is a non-governmental organization (NGO).
            It contributes to the economic and social development of the world by promoting and supporting actions
            aimed at improving the living conditions of populations (rural, urban and other disadvantaged groups).
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
                  alt="IMADEL team working on community development projects"
                  loading="lazy"
                  width={600}
                  height={400}
                />
              </div>
              <div className="mission-content">
                <h2 id="mission-vision-heading">Our Mission</h2>
                <p>
                  IMADEL is the result of the desire of its members to contribute to the economic and social development
                  of the population. The members of IMADEL are all actors who have acquired and developed skills in the
                  field of local development. These experiences focus on priority sectors such as hydraulics, agriculture,
                  livestock, decentralization, capacity building, migration, environment/sanitation, health, education, etc.
                  These experiences have been widely shared with vulnerable groups.
                </p>
              </div>
            </div>
            <div className="vision">
              <h2>Our Vision</h2>
              <p>
                To provide technical, material and financial support to associations or human groups for the improvement
                of their living conditions and their self-promotion; To contribute effectively to the economic, social and
                cultural development of the Malian population, according to the reference frameworks adopted by the Governments.
              </p>
              <p>
                For fifteen years, IMADEL has undertaken actions to accelerate the achievement of the Millennium Development
                Goals. These actions have significantly contributed to access to safe drinking water, hygiene and sanitation,
                food security, education and training in maternal and child health through large-scale actions for thousands
                of men, women and children across Mali.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section" aria-label="Organization statistics">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item" role="region" aria-label="15 plus years of experience">
              <div className="stat-number" aria-label="15 plus">15+</div>
              <div className="stat-label">Years</div>
            </div>
            <div className="stat-item" role="region" aria-label="50 plus projects completed">
              <div className="stat-number" aria-label="50 plus">50+</div>
              <div className="stat-label">Projects Completed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="activities" aria-labelledby="activities-heading">
        <div className="container">
          <div className="activities-content">
            <div className="activities-text">
              <h2 id="activities-heading">Our Activities</h2>
              <p>
                15 years at the service of development. For fifteen years, IMADEL has undertaken actions to accelerate
                the achievement of the Millennium Development Goals. These actions have significantly contributed to
                access to safe drinking water, hygiene and sanitation, food security, education and training in maternal
                and child health through large-scale actions for thousands of men, women and children across Mali.
              </p>
              <p>
                Our activities span across multiple sectors including rural and urban hydraulics, decentralization,
                hygiene and sanitation, education, formation, advocacy and lobbying, environment, health, and local development.
              </p>
              <Link to="/ourwork" className="btn-primary">
                View Our Projects
              </Link>
            </div>
            <div className="activities-image">
              <img 
                src={ACTIVITIES_IMAGE} 
                alt="IMADEL activities and projects in communities across Mali"
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
          <h2 id="objectives-heading">Our Objectives</h2>
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
          <h2 id="cta-heading">Join Us in Our Mission</h2>
          <p>Be part of our journey to create sustainable, equitable and participatory development across Mali.</p>
          <div className="cta-buttons">
            <Link to="/getinvolved" className="btn-primary">
              Get Involved
            </Link>
            <Link to="/donate" className="btn-secondary">
              Donate
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
