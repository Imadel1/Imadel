import React from 'react';
import './AboutUs.css';

const AboutUs: React.FC = () => {
  return (
    <div className="about-us">
      {/* Hero Section */}
      <section className="about-hero">
        <h1>At the service of local development</h1>
        <p>
          IMADEL (Malian Initiative for Local Development Support) is a non-governmental organization (NGO).
          It contributes to the economic and social development of the world by promoting and supporting actions
          aimed at improving the living conditions of populations (rural, urban and other disadvantaged groups).
        </p>
      </section>

      {/* Mission and Vision */}
      <section className="mission-vision">
        <div className="mission">
          <h2>Our Mission</h2>
          <p>
            IMADEL is the result of the desire of its members to contribute to the economic and social development
            of the population. The members of IMADEL are all actors who have acquired and developed skills in the
            field of local development. These experiences focus on priority sectors such as hydraulics, agriculture,
            livestock, decentralization, capacity building, migration, environment/sanitation, health, education, etc.
            These experiences have been widely shared with vulnerable groups.
          </p>
        </div>
        <div className="vision">
          <h2>Our Vision</h2>
          <p>
            To provide technical, material and financial support to associations or human groups for the improvement
            of their living conditions and their self-promotion; To contribute effectively to the economic, social and
            cultural development of the Malian population, according to the reference frameworks adopted by the Governments.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">15+</div>
            <div className="stat-label">Years</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">50+</div>
            <div className="stat-label">Projects Completed</div>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="activities">
        <h2>Our Activities</h2>
        <p>
          15 years at the service of development. For fifteen years, IMADEL has undertaken actions to accelerate
          the achievement of the Millennium Development Goals. These actions have significantly contributed to
          access to safe drinking water, hygiene and sanitation, food security, education and training in maternal
          and child health through large-scale actions for thousands of men, women and children across Mali.
        </p>
      </section>

      {/* Objectives Section */}
      <section className="objectives">
        <h2>Our Objectives</h2>
        <div className="objectives-list">
          <div className="objective-item">
            <p>Contribute to the capacity building of development actors with a view to accelerating the ownership and ownership of local development;</p>
          </div>
          <div className="objective-item">
            <p>Promote the strengthening of a civil society participating in the formulation and implementation of development policies;</p>
          </div>
          <div className="objective-item">
            <p>Promote democracy, good governance and support the implementation of the decentralization policy in the country;</p>
          </div>
          <div className="objective-item">
            <p>Strengthen the partnership by boosting the efforts of the State and partner NGOs and associations in support of communities;</p>
          </div>
          <div className="objective-item">
            <p>Work for sustainable, equitable and participatory development.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
