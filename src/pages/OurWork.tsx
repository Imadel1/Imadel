import React, { useState, useRef, useEffect } from 'react';
import './OurWork.css';
import { Link } from "react-router-dom";
import { projects as defaultProjects } from '../data/projects';

// Lazy Image Component with Intersection Observer
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className, width = 300, height = 200 }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="lazy-image-wrapper" ref={containerRef}>
      {!isLoaded && <div className="image-placeholder" aria-hidden="true" />}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={className}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={(e) => {
            // Hide broken images
            (e.target as HTMLImageElement).style.display = 'none';
          }}
          style={{ opacity: isLoaded ? 1 : 0 }}
        />
      )}
    </div>
  );
};

const OurWork: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [projects, setProjects] = useState(defaultProjects);
  const itemsPerPage = 9;

  // Load projects from admin panel
  useEffect(() => {
    const loadProjects = () => {
      try {
        const stored = localStorage.getItem('imadel_admin_projects');
        if (stored) {
          const adminProjects = JSON.parse(stored);
          // Filter only published projects
          const publishedProjects = adminProjects
            .filter((p: any) => p.published)
            .map((p: any) => ({
              id: p.id,
              title: p.title,
              description: p.summary || p.content || '',
              images: p.images || ['https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop'],
              country: p.country || 'Mali'
            }));
          
          // Use admin projects if available, otherwise use defaults
          if (publishedProjects.length > 0) {
            setProjects(publishedProjects);
          }
        }
      } catch (error) {
        console.error('Error loading projects:', error);
      }
    };

    loadProjects();

    // Listen for updates from admin panel
    const handleUpdate = () => loadProjects();
    window.addEventListener('imadel:projects:updated', handleUpdate);

    return () => {
      window.removeEventListener('imadel:projects:updated', handleUpdate);
    };
  }, []);

  const totalPages = Math.ceil(projects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = projects.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of projects section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="our-work-page">
      {/* Intro Section */}
      <section className="intro" aria-labelledby="intro-heading">
        <div className="container">
          <h1 id="intro-heading">Our Projects</h1>
          <p>
            Discover the impactful projects that IMADEL has undertaken across Mali,
            focusing on sustainable development, community empowerment, and humanitarian aid.
          </p>
          <p className="project-count">
            Showing {currentProjects.length} of {projects.length} projects
          </p>
        </div>
      </section>

      {/* Projects Section */}
      <section className="projects" aria-labelledby="projects-heading">
        <div className="container">
          <h2 id="projects-heading" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', borderWidth: 0 }}>Project List</h2>
          <div className="projects-grid" role="list" aria-label="List of projects">
            {currentProjects.map((project) => (
              <article key={project.id} className="project-card-wrapper" role="listitem">
                <Link 
                  to={`/project/${project.id}`} 
                  className="project-card-link"
                  aria-label={`View details for ${project.title}`}
                >
                  <div className="project-card">
                    <div className="project-image-container">
                      <LazyImage
                        src={project.images[0] || '/placeholder-image.jpg'}
                        alt={project.title}
                        className="project-image"
                        width={350}
                        height={250}
                      />
                    </div>
                    <div className="project-content">
                      <h3>{project.title}</h3>
                      <p>{project.description.split('Read more')[0].trim()}</p>
                      <span className="read-more" aria-hidden="true">
                        READ MORE DETAILS →
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="page-navigation" aria-label="Project pagination">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="pagination-button"
                aria-label="Previous page"
              >
                Previous
              </button>

              <div className="page-numbers" role="list" aria-label="Page numbers">
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="page-ellipsis" aria-hidden="true">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page as number)}
                      className={`page-number ${currentPage === page ? 'active' : ''}`}
                      aria-label={`Go to page ${page}`}
                      aria-current={currentPage === page ? 'page' : undefined}
                      role="listitem"
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="pagination-button"
                aria-label="Next page"
              >
                Next
              </button>
            </nav>
          )}
        </div>
      </section>

      {/* Call To Action Section */}
      <section className="cta" aria-labelledby="cta-heading">
        <div className="container">
          <h2 id="cta-heading">Get involved in our mission</h2>
          <p>Join us in making a difference across communities in Mali</p>
          <Link to="/getinvolved" className="cta-button">
            Get Involved
          </Link>
        </div>
      </section>
    </div>
  );
};

export default OurWork;
