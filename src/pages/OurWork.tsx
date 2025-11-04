import React, { useState, useRef, useEffect } from 'react';
import './OurWork.css';
import { Link } from "react-router-dom";
import { projects } from '../data/projects';

// Lazy loading hook for images
const useLazyImage = (src: string) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (inView) {
      const img = new Image();
      img.onload = () => setLoaded(true);
      img.src = src;
    }
  }, [inView, src]);

  return { imgRef, loaded, inView };
};

// Lazy image component
const LazyImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
  const { imgRef, loaded, inView } = useLazyImage(src);

  return (
    <img
      ref={imgRef}
      src={inView ? src : undefined}
      alt={alt}
      className={className}
      style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
    />
  );
};

const OurWork: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(projects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = projects.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="our-work-page">
      {/* Projects Section */}
      <section className="projects">
        <div className="projects-grid">
          {currentProjects.map((project) => (
            <Link to={`/project/${project.id}`} key={project.id} className="project-card-link">
              <div className="project-card">
                <LazyImage src={project.images[0]} alt={project.title} className="project-image" />
                <h3>{project.title}</h3>
                <p>{project.description.split('Read more')[0]}</p>
                <span className="read-more">READ MORE DETAILS</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="page-navigation">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={currentPage === page ? 'active' : ''}
            >
              {page}
            </button>
          ))}
          {totalPages > 7 && <span>…</span>}
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            Next page
          </button>
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
