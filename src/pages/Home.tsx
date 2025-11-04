import React, { Suspense } from "react";
import "./Home.css";
import { Link } from "react-router-dom";

// Note: Lazy loading hooks and components are prepared for future use when images are added to Home page

const Home: React.FC = () => {

  return (
    <div className="home">
      {/* Below-the-fold sections with Suspense */}
      <Suspense fallback={<div>Loading...</div>}>
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
      </Suspense>
    </div>
  );
};

export default Home;
