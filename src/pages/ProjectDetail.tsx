import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projects } from '../data/projects';
import './ProjectDetail.css';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const project = projects.find(p => p.id === id);

  if (!project) {
    return <div>Project not found</div>;
  }

  const currentIndex = projects.findIndex(p => p.id === id);
  const nextProject = projects[currentIndex + 1];
  const prevProject = projects[currentIndex - 1];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [visibleImages, setVisibleImages] = useState<string[]>(project.images.slice(0, 5));
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleImages.length < project.images.length) {
          setVisibleImages((prev) => [
            ...prev,
            ...project.images.slice(prev.length, prev.length + 5)
          ]);
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [visibleImages, project.images]);

  const handleNext = () => {
    if (nextProject) {
      navigate(`/project/${nextProject.id}`);
    }
  };

  const handlePrev = () => {
    if (prevProject) {
      navigate(`/project/${prevProject.id}`);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % project.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + project.images.length) % project.images.length);
  };

  return (
    <div className="project-detail-page">
      <div className="project-detail-container">
        <div className="project-detail-content">
          <h1>{project.title}</h1>
          <p>{project.description}</p>
          <div className="navigation-buttons">
            <button onClick={handlePrev} disabled={!prevProject}>
              Previous Project
            </button>
            <button onClick={handleNext} disabled={!nextProject}>
              Next Project
            </button>
          </div>
        </div>
        <div className="project-images">
          <img src={project.images[currentImageIndex]} alt={project.title} className="project-detail-image" />
          {project.images.length > 1 && (
            <div className="image-navigation">
              <button onClick={prevImage} className="image-nav-btn">‹</button>
              <div className="image-indicators">
                {project.images.map((_, index) => (
                  <span
                    key={index}
                    className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
              <button onClick={nextImage} className="image-nav-btn">›</button>
            </div>
          )}
          {visibleImages.length < project.images.length && (
            <div ref={loadMoreRef} style={{ height: '20px', background: 'transparent' }}></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
