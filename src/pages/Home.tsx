import React, { useState, useEffect } from "react";
import "./Home.css";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  const [yearsCount, setYearsCount] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);

  useEffect(() => {
    const animateCounter = (target: number, setCount: (value: number) => void, duration: number = 1500) => {
      const start = 0;
      const increment = target / (duration / 16); // 60fps
      let current = start;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, 16);
    };

    // Start animations when component mounts - reduced delay for better LCP
    const timer = setTimeout(() => {
      animateCounter(15, setYearsCount);
      animateCounter(50, setProjectsCount);
    }, 100); // Reduced from 500ms to 100ms

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <h1>Local development, our priority</h1>
        <div className="hero-domains">
          WASH – HEALTH – FOOD SECURITY – NUTRITION – EDUCATION – CONFLICT MANAGEMENT – GOVERNANCE – CLIMATE CHANGE – LOCAL DEVELOPMENT
        </div>
      </section>

      {/* About Section */}
      <section className="about">
        <h2>In service of local development</h2>
        <p>
          IMADEL (Initiative Malienne d'Appui au Développement Local) is a non-governmental organization (NGO).
          It contributes to the economic and social development of the World by promoting and supporting actions aimed
          at improving the living conditions of populations (rural, urban and other disadvantaged groups).
        </p>
        
        <div className="stats-section">
          <div className="stat-item">
            <span className="stat-number">{yearsCount}+</span>
            <span className="stat-label">Years</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{projectsCount}+</span>
            <span className="stat-label">Projects completed</span>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="experience">
        <h2>15 years in service of development</h2>
        <p>
          For fifteen years, IMADEL has undertaken actions to accelerate the achievement of the Millennium
          Development Goals. These actions have significantly contributed to access to drinking water, hygiene and
          sanitation, food security, education and maternal and child health training through large-scale actions
          for thousands of men, women and children across Mali.
        </p>
      </section>

      {/* Domains Section */}
      <section className="domains">
        <h2>Areas of intervention</h2>
        <div className="domains-grid">
          <div className="domain-item">Rural and urban hydraulics</div>
          <div className="domain-item">Decentralization</div>
          <div className="domain-item">Hygiene/sanitation</div>
          <div className="domain-item">Education</div>
          <div className="domain-item">Training</div>
          <div className="domain-item">Advocacy/lobbying</div>
          <div className="domain-item">Environment</div>
          <div className="domain-item">Health</div>
          <div className="domain-item">Local development</div>
        </div>
      </section>

      {/* News Section */}
      <section className="news">
        <h2>Latest News</h2>
        <div className="news-grid">
          <article className="news-card">
            <h3>Hand in hand, for a better future!</h3>
            <p>IMADEL provided support on 24/09 to 125 households through food assistance...</p>
            <Link to="/actualites/1" className="read-more">READ MORE DETAILS</Link>
          </article>
          {/* Add more news items */}
        </div>
      </section>

      {/* Call To Action Section */}
      <section className="cta">
        <h2>Join our mission</h2>
        <p>Together, let's build a better future for Mali</p>
        <Link to="/contact">
          <button>Contact us</button>
        </Link>
      </section>
    </div>
  );
};

export default Home;
