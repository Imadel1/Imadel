import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { newsApi } from '../services/api';
import ResponsiveImage from '../components/ResponsiveImage';
import './Actualites.css';

interface NewsItem {
  id: string;
  title: string;
  description?: string;
  image?: string;
  author?: string;
  date?: string;
  isPublished?: boolean;
}

const Actualites: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load news from backend API
  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      try {
        // Load all published news; if collection grows very large, add a limit or pagination
        const response = await newsApi.getAll({ published: true });
        
        const rawNews =
          (response as any).news ||
          (response as any).data ||
          response ||
          [];

        if (response.success !== false && Array.isArray(rawNews)) {
          const mappedNews = rawNews.map((n: any) => ({
            id: n._id || n.id,
            title: n.title,
            description: n.description || '',
            image: n.image || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?q=80&w=800&auto=format&fit=crop',
            author: n.author,
            date: n.date || n.createdAt,
            isPublished: n.isPublished,
          }));
          
          setNewsItems(mappedNews);
        }
      } catch (error) {
        console.error('Error loading news from API:', error);
        setNewsItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadNews();

    // Listen for updates from admin panel
    const handleUpdate = () => loadNews();
    window.addEventListener('imadel:newsletters:updated', handleUpdate);

    return () => {
      window.removeEventListener('imadel:newsletters:updated', handleUpdate);
    };
  }, []);

  if (loading) {
    return (
      <div className="actualites-page">
        <div className="container">
          <div className="loading-container" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '400px',
            gap: '1rem'
          }}>
            <div className="spinner" style={{
              width: '50px',
              height: '50px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid var(--primary, #0066CC)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: 'var(--text-secondary, #616161)', fontSize: '1.1rem' }}>Chargement...</p>
          </div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="actualites-page">
      <section className="actualites-intro">
        <div className="container">
          <h1>Actualités</h1>
          <p>
            Découvrez les dernières actualités et nouvelles d'IMADEL.
          </p>
        </div>
      </section>

      <section className="actualites-content">
        <div className="container">
          {newsItems.length === 0 ? (
            <p style={{ 
              textAlign: 'center', 
              padding: '3rem', 
              color: 'var(--text-secondary, #616161)' 
            }}>
              Aucune actualité disponible pour le moment.
            </p>
          ) : (
            <div className="actualites-grid">
              {newsItems.map((news) => (
                <article key={news.id} className="actualites-card">
                  <Link 
                    to={`/actualite/${news.id}`} 
                    className="actualites-card-link"
                    aria-label={`Voir les détails de ${news.title}`}
                  >
                    <div className="actualites-image">
                      <ResponsiveImage
                        src={news.image || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?q=80&w=800&auto=format&fit=crop'}
                        alt={news.title}
                        aspectRatio="wide"
                        size="medium"
                        loading="lazy"
                        objectFit="cover"
                        className="actualites-img"
                      />
                      <div className="actualites-overlay"></div>
                      <div className="actualites-content-overlay">
                        <h3>{news.title}</h3>
                        {news.date && (
                          <span className="actualites-date">
                            {new Date(news.date).toLocaleDateString('fr-FR', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                        )}
                        <span className="read-more">
                          Lire plus →
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Actualites;

