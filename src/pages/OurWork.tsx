import React from 'react';
import './OurWork.css';
import { Link } from "react-router-dom";

interface Project {
  id: number;
  title: string;
  description: string;
  link: string;
}

const OurWork: React.FC = () => {
  const projects: Project[] = [
    {
      id: 1,
      title: 'Hand in hand, for a better future!',
      description:
        '#IMADEL provided support on 24/09 to 125 households through food and nutritional assistance. This action, rendered by the S...',
      link: '#',
    },
    {
      id: 2,
      title: 'Distribution of NFI kits to IDPs!',
      description:
        'IMADEL has provided support to 10 IDP households in Medina Coura (Mopti) through the distribution of essential kits for the elderly.',
      link: '#',
    },
    {
      id: 3,
      title: 'Training to protect, raising awareness to act.',
      description:
        'As part of its fight against Gender-Based Violence (GBV), #IMADEL in partnership with #ActionAid trained a group of women who have been working on GBV prevention and advocacy...',
      link: '#',
    },
    {
      id: 4,
      title: 'Support today, to rebuild tomorrow!',
      description:
        'IMADEL has provided support to 85 displaced households through the distribution of kits to the São Paulo S...',
      link: '#',
    },
    {
      id: 5,
      title: 'Solidarity in action, to restore hope and dignity!',
      description:
        'As part of its humanitarian commitment, #IMADEL carried out humanitarian and cultural activities in the United States to restore hope and dignity.',
      link: '#',
    },
    {
      id: 6,
      title: 'Awareness of #VBG',
      description:
        '#IMADEL conducted awareness sessions on Gender-Based Violence (GBV) and disaster-related shocks in the region.',
      link: '#',
    },
    {
      id: 7,
      title: 'Assistance to IDPs',
      description:
        'IMADEL, in partnership with Action Aid International, has assisted 125 internally displaced households (750 beneficiaries) at the S... site.',
      link: '#',
    },
    {
      id: 8,
      title: 'Local development',
      description:
        'Under the Top Up NGO project, #IMADEL with support from #ActionAid International Mali promotes sustainable local development and empowerment.',
      link: '#',
    },
    {
      id: 9,
      title: 'Humanitarian assistance',
      description:
        'On June 16, 2025, #IMADEL, as a partner of #UNICEF, organized a humanitarian distribution activity in support of vulnerable families.',
      link: '#',
    },
    {
      id: 10,
      title: 'Child protection',
      description:
        'Because every child matters — IMADEL works to ensure that each need receives a dignified and timely response in vulnerable communities.',
      link: '#',
    },
    {
      id: 11,
      title: 'Cooking demonstration',
      description:
        'In Dimbal, Bankass circle, IMADEL and Plan International organized a nutritional cooking demonstration to promote healthy eating.',
      link: '#',
    },
    {
      id: 12,
      title: 'Fight against malnutrition',
      description:
        '#IMADEL and partners are implementing actions and strategies to combat malnutrition and improve food security for families.',
      link: '#',
    },
  ];

  return (
    <div className="our-work-page">
      {/* Hero Section */}
      <section className="hero">
        <h1>Our Work</h1>
        <div className="hero-domains">
          HUMANITARIAN AID – FOOD SECURITY – NUTRITION – EDUCATION – HEALTH – LOCAL DEVELOPMENT – CLIMATE CHANGE – GOVERNANCE
        </div>
      </section>

      {/* Intro Section */}
      <section className="intro">
        <h2>Committed to improving livelihoods</h2>
        <p>
          Through partnerships and field-based initiatives, IMADEL is committed to improving livelihoods, promoting
          resilience, and ensuring equitable access to basic services. Below are some of our recent actions and
          humanitarian projects.
        </p>
      </section>

      {/* Projects Section */}
      <section className="projects">
        <div className="projects-grid">
          {projects.map((project) => (
            <div className="project-card" key={project.id}>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <Link to="#" className="read-more">READ MORE DETAILS</Link>
            </div>
          ))}
        </div>
      </section>

      {/* Call To Action Section */}
      <section className="cta">
        <h2>Get involved in our mission</h2>
        <p>Join us in making a difference</p>
        <Link to="/getinvolved">
          <button>Get Involved</button>
        </Link>
      </section>
    </div>
  );
};

export default OurWork;
