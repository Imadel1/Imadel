import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { useTranslation } from '../utils/i18n';
import { newsApi, projectsApi } from '../services/api';
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
  const [loading, setLoading] = useState<boolean>(true);

  // Determine if this is a project or newsletter based on URL
  const isNewsletter = location.includes('/news/');
  const storageKey = isNewsletter ? 'imadel_admin_newsletters' : 'imadel_admin_projects';
  const { t, language } = useTranslation();
  const backLink = isNewsletter ? '/' : '/ourwork';
  const backText = isNewsletter ? t('backToHome') : t('backToProjects');
  const contentType = isNewsletter ? 'News' : 'Project';

  // Scroll to top when component mounts or ID changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const loadContent = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // Load detail
        if (isNewsletter) {
          const response = await newsApi.getById(id);
          const n = (response as any).news || (response as any).data || response;

          if (response.success !== false && n) {
            setContent({
              id: n._id || n.id,
              title: n.title,
              description: n.description,
              content: n.description,
              images: n.image ? [n.image] : ['https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop'],
              date: n.date || n.createdAt,
            });
            return;
          }
        } else {
          const response = await projectsApi.getById(id);
          const p = (response as any).project || (response as any).data || response;

          if (response.success !== false && p) {
            setContent({
              id: p._id || p.id,
              title: p.title,
              description: p.description || p.fullDescription,
              content: p.fullDescription || p.description,
              images:
                Array.isArray(p.images) && p.images.length
                  ? p.images.map((img: any) => (typeof img === 'string' ? img : img.url || ''))
                  : ['https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop'],
              country: p.location,
            });
            return;
          }
        }

        // Fallback to any locally stored content (legacy)
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
              content: foundItem.content || foundItem.description,
              images: foundItem.images || ['https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop'],
              country: foundItem.country,
              date: foundItem.date,
            });
            return;
          }
        }

        setContent(null);
      } catch (error) {
        console.error('Error loading content:', error);
        setContent(null);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [id, isNewsletter, storageKey]);

  // Load collection for carousel navigation
  useEffect(() => {
    const loadCollection = async () => {
      try {
        if (isNewsletter) {
          const response = await newsApi.getAll({ published: true });
          const raw =
            (response as any).news ||
            (response as any).data ||
            response ||
            [];
          if (response.success !== false && Array.isArray(raw)) {
            const mapped = raw.map((n: any) => ({
              id: n._id || n.id,
              title: n.title,
              description: n.description,
              images: n.image ? [n.image] : undefined,
              date: n.date || n.createdAt,
            }));
            setAllContent(mapped);
            return;
          }
        } else {
          const response = await projectsApi.getAll({ published: true });
          const raw =
            (response as any).projects ||
            (response as any).data ||
            response ||
            [];
          if (response.success !== false && Array.isArray(raw)) {
            const mapped = raw.map((p: any) => ({
              id: p._id || p.id,
              title: p.title,
              description: p.description || p.fullDescription,
              images:
                Array.isArray(p.images) && p.images.length
                  ? p.images.map((img: any) => (typeof img === 'string' ? img : img.url || ''))
                  : undefined,
              country: p.location,
              date: p.date || p.createdAt,
            }));
            setAllContent(mapped);
            return;
          }
        }

        setAllContent([]);
      } catch (error) {
        console.error('Error loading list for navigation:', error);
        setAllContent([]);
      }
    };

    loadCollection();
  }, [isNewsletter]);

  if (loading) {
    return (
      <div className="project-detail-page">
        <div className="container">
          <p style={{ textAlign: 'center', padding: '2rem' }}>{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="project-detail-page">
        <div className="container">
          <div className="error-message" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <h1>{isNewsletter ? 'Actualité introuvable' : 'Projet introuvable'}</h1>
            <p>{isNewsletter ? 'Cette actualité est introuvable ou a été retirée.' : 'Ce projet est introuvable ou a été retiré.'}</p>
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
          <Link to="/">{t('home')}</Link>
          <span aria-hidden="true"> / </span>
          {!isNewsletter && (
            <>
              <Link to="/ourwork">{t('work')}</Link>
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
                {t('publishedOn')}: {new Date(content.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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
                ← {t('previous')} {contentType}
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
                {t('next')} {contentType} →
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
