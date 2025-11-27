import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaMapMarkerAlt } from 'react-icons/fa';
import './ProjectDetail.css';

interface ContentItem {
  id: string;
  title: string;
  description?: string;
  summary?: string;
  content?: string;
  images?: string[];
  country?: string;
  date?: string;
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = window.location.pathname;
  const navigate = useNavigate();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [allContent, setAllContent] = useState<ContentItem[]>([]);

  // Determine if this is a project or newsletter based on URL
  const isNewsletter = location.includes('/news/');
  const storageKey = isNewsletter ? 'imadel_admin_newsletters' : 'imadel_admin_projects';
  const backLink = isNewsletter ? '/' : '/ourwork';
  const backText = isNewsletter ? 'Back to Home' : 'Back to Projects';
  const contentType = isNewsletter ? 'News' : 'Project';

  // Scroll to top when component mounts or ID changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const loadContent = () => {
      try {
        if (isNewsletter) {
          // For newsletters, only check admin panel
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            const items = JSON.parse(stored);
            const publishedItems = items.filter((item: any) => item.published);
            setAllContent(publishedItems);
            
            const foundItem = publishedItems.find((item: any) => item.id === id);
            if (foundItem) {
              setContent({
                id: foundItem.id,
                title: foundItem.title,
                description: foundItem.description || foundItem.summary || foundItem.content,
                content: foundItem.content,
                images: foundItem.images || ['https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop'],
                country: foundItem.country,
                date: foundItem.date
              });
            }
          }
        } else {
          // For projects, only use dynamic/admin projects (no hardcoded defaults)
          const stored = localStorage.getItem(storageKey);
          let allProjects: ContentItem[] = [];

          if (stored) {
            const adminProjects = JSON.parse(stored);
            const publishedProjects = adminProjects
              .filter((p: any) => p.published)
              .map((p: any) => ({
                id: p.id,
                title: p.title,
                description: p.summary || p.content || p.description,
                content: p.content,
                images: p.images || ['https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop'],
                country: p.country
              }));

            allProjects = publishedProjects;
          }

          setAllContent(allProjects);

          // Find the specific project
          const foundProject = allProjects.find((p: any) => p.id === id);
          if (foundProject) {
            setContent({
              id: foundProject.id,
              title: foundProject.title,
              description: foundProject.description,
              content: foundProject.content || foundProject.description,
              images: foundProject.images || ['https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop'],
              country: foundProject.country
            });
          }
        }
      } catch (error) {
        console.error('Error loading content:', error);
      }
    };

    loadContent();

    // Listen for updates
    const eventName = isNewsletter ? 'imadel:newsletters:updated' : 'imadel:projects:updated';
    const handleUpdate = () => loadContent();
    window.addEventListener(eventName, handleUpdate);

    return () => {
      window.removeEventListener(eventName, handleUpdate);
    };
  }, [id, storageKey, isNewsletter]);

  if (!content) {
    return (
      <div className="project-detail-page">
        <div className="container">
          <div className="error-message" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <h1>{contentType} Not Found</h1>
            <p>The {contentType.toLowerCase()} you're looking for doesn't exist or has been removed.</p>
            <Link to={backLink} className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
              {backText}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = allContent.findIndex(item => item.id === id);
  const nextItem = allContent[currentIndex + 1];
  const prevItem = allContent[currentIndex - 1];

  const handleNext = () => {
    if (nextItem) {
      const path = isNewsletter ? `/news/${nextItem.id}` : `/project/${nextItem.id}`;
      navigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (prevItem) {
      const path = isNewsletter ? `/news/${prevItem.id}` : `/project/${prevItem.id}`;
      navigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const images = content.images || [];
  const hasImages = images.length > 0;

  return (
    <div className="project-detail-page">
      <div className="container" style={{ paddingBottom: 0, marginBottom: 0 }}>
        <nav className="breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>
          <Link to="/">Home</Link>
          <span aria-hidden="true"> / </span>
          {!isNewsletter && (
            <>
              <Link to="/ourwork">Our Work</Link>
              <span aria-hidden="true"> / </span>
            </>
          )}
          <span aria-current="page">{content.title}</span>
        </nav>

        <div className="project-detail-container" style={{ marginBottom: 0, paddingBottom: '2rem' }}>
          <div className="project-detail-content">
            <h1>{content.title}</h1>
            
            {content.date && (
              <p className="content-date" style={{ color: 'var(--text-muted, #9e9e9e)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Published: {new Date(content.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
            
            {content.country && (
              <p className="content-location" style={{ color: 'var(--primary, #FF6B00)', marginBottom: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaMapMarkerAlt /> {content.country}
              </p>
            )}
            
            <div 
              className="project-description" 
              style={{ lineHeight: 1.8, color: 'var(--text-secondary, #616161)', marginBottom: '2rem' }}
              dangerouslySetInnerHTML={{ __html: content.content || content.description || '' }}
            />
            
            <div className="project-navigation" role="navigation" aria-label={`${contentType} navigation`} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
              <button 
                onClick={handlePrev} 
                disabled={!prevItem}
                className="navigation-buttons button"
                aria-label={`Previous ${contentType.toLowerCase()}`}
                style={{ flex: '1', minWidth: '150px' }}
              >
                ← Previous {contentType}
              </button>
              <Link 
                to={backLink} 
                className="navigation-buttons button"
                style={{ flex: '1', minWidth: '150px', textAlign: 'center' }}
              >
                {backText}
              </Link>
              <button 
                onClick={handleNext} 
                disabled={!nextItem}
                className="navigation-buttons button"
                aria-label={`Next ${contentType.toLowerCase()}`}
                style={{ flex: '1', minWidth: '150px' }}
              >
                Next {contentType} →
              </button>
            </div>
          </div>

          {hasImages && (
            <div className="project-images" aria-label={`${contentType} images`}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text, #1a1a2e)' }}>
                Images ({images.length})
              </h2>
              <div className="images-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem'
              }}>
                {images.map((image, index) => (
                  <div 
                    key={index} 
                    className="image-item"
                    style={{
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      cursor: 'pointer',
                      border: '2px solid var(--border-light, #f0f0f0)'
                    }}
                    onClick={() => window.open(image, '_blank')}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        window.open(image, '_blank');
                      }
                    }}
                    aria-label={`View ${content.title} - Image ${index + 1} in full size`}
                  >
                    <img 
                      src={image} 
                      alt={`${content.title} - Image ${index + 1}`}
                      loading={index === 0 ? "eager" : "lazy"}
                      decoding="async"
                      style={{ 
                        width: '100%',
                        height: '250px',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
