import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { FaBullseye, FaGlobeAmericas, FaDumbbell, FaHandshake, FaLandmark, FaSeedling } from "react-icons/fa";
import { useTranslation } from "../utils/i18n";
import "./Home.css";
import { projectsApi, newsApi } from "../services/api";
import ResponsiveImage from "../components/ResponsiveImage";
import { getImageSources } from "../utils/imageUtils";
import { apiCache } from "../utils/cache";
import LazySection from "../components/LazySection";

// Types
interface NewsItem {
  id: string;
  title: string;
  content?: string;
  description?: string;
  image?: string;
  badge?: string;
  link?: string;
  date?: string;
  published?: boolean;
}

interface Objective {
  id: string;
  icon: string;
  title: string;
  description: string;
}

// Constants
import heroImage from '../assets/imadel 1.jpg';
import aboutImage from '../assets/imadel-2.jpg';
import { mediaApi, type SiteImages } from '../services/api';

const FALLBACK_HERO_IMAGE = heroImage;
const FALLBACK_ABOUT_IMAGE = aboutImage;

// These will be generated dynamically based on language
const getAreasOfIntervention = (language: string) => [
  language === 'fr' ? "Eaux, Hygiène et Assainissement" : "Water, Hygiene & Sanitation",
  language === 'fr' ? "Décentralisation" : "Decentralization",
  language === 'fr' ? "Éducation" : "Education",
  language === 'fr' ? "Renforcement de capacités" : "Capacity building",
  language === 'fr' ? "Plaidoyer / Lobbyisme" : "Advocacy / Lobbying",
  language === 'fr' ? "Environnement" : "Environment",
  language === 'fr' ? "Santé et Nutrition" : "Health & Nutrition",
  language === 'fr' ? "Services Sociaux et Résilience" : "Social services & resilience",
  language === 'fr' ? "Protection" : "Protection",
  language === 'fr' ? "COOP" : "Cooperation (COOP)",
];

const getObjectives = (t: any): Objective[] => [
  {
    id: "1",
    icon: "target",
    title: t('objective1Title'),
    description: t('objective1Desc')
  },
  {
    id: "2",
    icon: "globe",
    title: t('objective2Title'),
    description: t('objective2Desc')
  },
  {
    id: "3",
    icon: "dumbbell",
    title: t('objective3Title'),
    description: t('objective3Desc')
  },
  {
    id: "4",
    icon: "handshake",
    title: t('objective4Title'),
    description: t('objective4Desc')
  },
  {
    id: "5",
    icon: "landmark",
    title: t('objective5Title'),
    description: t('objective5Desc')
  },
  {
    id: "6",
    icon: "partnership",
    title: t('objective6Title'),
    description: t('objective6Desc')
  },
  {
    id: "7",
    icon: "seedling",
    title: t('objective7Title'),
    description: t('objective7Desc')
  }
];

// Icon mapping function
const getObjectiveIcon = (iconName: string) => {
  const iconProps = { size: 48, color: 'var(--primary, #0066CC)' };
  switch (iconName) {
    case 'target': return <FaBullseye {...iconProps} />;
    case 'globe': return <FaGlobeAmericas {...iconProps} />;
    case 'dumbbell': return <FaDumbbell {...iconProps} />;
    case 'handshake': return <FaHandshake {...iconProps} />;
    case 'partnership': return <FaHandshake {...iconProps} />;
    case 'landmark': return <FaLandmark {...iconProps} />;
    case 'seedling': return <FaSeedling {...iconProps} />;
    default: return <FaBullseye {...iconProps} />;
  }
};

// Note: News items are sourced from admin-managed newsletters only (no hardcoded news)

// Lazy Image Component with Intersection Observer
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className, width = 800, height = 600 }) => {
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
    <div 
      className="lazy-image-wrapper" 
      ref={containerRef}
      style={{
        width: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {!isLoaded && <div className="image-placeholder" aria-hidden="true" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--panel, #f9fafc)'
      }} />}
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
          style={{ 
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}
    </div>
  );
};

// News Card Component
interface NewsCardProps {
  news: NewsItem;
}

const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  const { t, language } = useTranslation();
  const targetLink =
    news.link ||
    (news.badge === t('news')
      ? `/actualite/${news.id}`
      : `/projet/${news.id}`);
  return (
    <Link to={targetLink} className="news-card-link" aria-label={language === 'fr' ? `Voir les détails de ${news.title}` : `View details of ${news.title}`}>
      <article className="news-card">
        <div className="news-image">
          <ResponsiveImage
            src={news.image || aboutImage}
            alt={news.title}
            aspectRatio="wide"
            size="large"
            loading="lazy"
            objectFit="cover"
            className="news-img"
          />
          <div className="news-overlay"></div>
          <div className="news-content-overlay">
            <h3>{news.title}</h3>
            <span className="read-more">
              {t('readMore')} →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};

// Objective Card Component
interface ObjectiveCardProps {
  objective: Objective;
}

const ObjectiveCard: React.FC<ObjectiveCardProps> = ({ objective }) => {
  return (
    <div className="objective-card" role="article" aria-labelledby={`objective-${objective.id}`}>
      <div className="objective-header">
        <div className="objective-icon" aria-hidden="true">
          {getObjectiveIcon(objective.icon)}
        </div>
        <h3 id={`objective-${objective.id}`}>{objective.title}</h3>
      </div>
      <p>{objective.description}</p>
    </div>
  );
};

// Animated Counter Component with smooth easing
interface CounterProps {
  end: number;
  suffix?: string;
  duration?: number;
}

const AnimatedCounter: React.FC<CounterProps> = ({ end, suffix = '', duration = 2500 }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true);
          setHasAnimated(true);
        }
      },
      { threshold: 0.3, rootMargin: '0px 0px -50px 0px' }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Custom easing: combination of easeOutCubic and easeOutQuint for ultra smooth
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentCount = Math.floor(easeOutExpo * end);
      
      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end); // Ensure we hit the exact number
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isVisible, end, duration]);

  return (
    <span 
      ref={counterRef} 
      className="animated-counter"
    >
      {count}{suffix}
    </span>
  );
};

// Main Home Component
const Home: React.FC = () => {
  const { t, language } = useTranslation();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [projects, setProjects] = useState<NewsItem[]>([]);
  const [siteImages, setSiteImages] = useState<SiteImages>({});
  
  const AREAS_OF_INTERVENTION = getAreasOfIntervention(language);
  const OBJECTIVES = getObjectives(t);

  // Load site images (hero, about) from Firestore
  useEffect(() => {
    const loadSiteImages = async () => {
      // Check cache first
      const cacheKey = 'site-images';
      const cached = apiCache.get<SiteImages>(cacheKey);
      if (cached) {
        setSiteImages(cached);
        return;
      }

      const images = await mediaApi.getSiteImages();
      setSiteImages(images);
      // Cache for 10 minutes (site images don't change often)
      apiCache.set(cacheKey, images, 10 * 60 * 1000);
    };
    loadSiteImages();
  }, []);

  // Load news from backend API - Defer loading until needed (lazy loaded section)
  const [shouldLoadNews, setShouldLoadNews] = useState(false);
  
  useEffect(() => {
    const loadNews = async () => {
      if (!shouldLoadNews) return; // Don't load until section is in view
      
      try {
        // Check cache first
        const cacheKey = 'news-home-published-true-limit-4';
        const cached = apiCache.get<NewsItem[]>(cacheKey);
        if (cached) {
          setNewsItems(cached);
          return;
        }

        // Fetch news (actualités) collection - limit to a few items for performance
        const response = await newsApi.getAll({ published: true, limit: 4 });

        const rawNews =
          (response as any)?.news ||
          (response as any)?.data ||
          response ||
          [];

        const list = Array.isArray(rawNews) ? rawNews : [];

        const publishedNews = list
          .slice(0, 2) // Show up to 2 news items
          .map((n: any) => ({
            id: n._id || n.id,
            title: n.title,
            description: n.description
              ? n.description.substring(0, 150) + '...'
              : '',
            image:
              n.image ||
              (n.images && n.images.length > 0 && (n.images[0].url || n.images[0])) ||
              'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?q=80&w=800&auto=format&fit=crop',
            badge: t('news'),
            link: `/actualite/${n._id || n.id}`,
            date: n.date || n.createdAt,
          }));

        setNewsItems(publishedNews);
        // Cache the result
        apiCache.set(cacheKey, publishedNews, 5 * 60 * 1000); // 5 minutes
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error loading news from API:', error);
        }
        setNewsItems([]); // Graceful fallback: show no news instead of error
      }
    };

    loadNews();

    // Listen for updates from admin panel
    const handleUpdate = () => {
      apiCache.clear('news-home-published-true-limit-4');
      loadNews();
    };
    window.addEventListener('imadel:newsletters:updated', handleUpdate);

    return () => {
      window.removeEventListener('imadel:newsletters:updated', handleUpdate);
    };
  }, [shouldLoadNews]); // Load when section comes into view

  // Load projects from API - Defer loading until needed (lazy loaded section)
  const [shouldLoadProjects, setShouldLoadProjects] = useState(false);
  
  useEffect(() => {
    const loadProjects = async () => {
      if (!shouldLoadProjects) return; // Don't load until section is in view
      
      try {
        // Check cache first
        const cacheKey = 'projects-home-published-true-limit-8';
        const cached = apiCache.get<NewsItem[]>(cacheKey);
        if (cached) {
          setProjects(cached);
          return;
        }

        // Limit to a few latest projects for homepage
        const response = await projectsApi.getAll({ published: true, limit: 8 });

        const rawProjects =
          (response as any).projects ||
          (response as any).data ||
          response;

        if (response.success !== false && Array.isArray(rawProjects)) {
          const mappedProjects = rawProjects
            .slice(0, 6)
            .map((p: any) => ({
              id: p._id || p.id,
              title: p.title,
              description: p.description || (p.fullDescription ? p.fullDescription.substring(0, 150) + '...' : ''),
              image: p.images && p.images.length > 0 && p.images[0].url 
                ? p.images[0].url 
                : 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop',
              badge: p.location || t('projects'),
              link: `/projet/${p._id || p.id}`,
            }));
          
          setProjects(mappedProjects);
          // Cache the result
          apiCache.set(cacheKey, mappedProjects, 5 * 60 * 1000); // 5 minutes
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error loading projects from API:', error);
        }
        setProjects([]);
      }
    };

    loadProjects();

    // Listen for updates from admin panel
    const handleUpdate = () => {
      apiCache.clear('projects-home-published-true-limit-8');
      loadProjects();
    };
    window.addEventListener('imadel:projects:updated', handleUpdate);

    return () => {
      window.removeEventListener('imadel:projects:updated', handleUpdate);
    };
  }, [shouldLoadProjects]); // Load when section comes into view

  // Preload hero image for better LCP - prioritize fallback image immediately
  useEffect(() => {
    // Preload fallback image immediately (before Firestore image loads)
    const preloadFallback = () => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = FALLBACK_HERO_IMAGE;
      link.setAttribute('fetchpriority', 'high');
      document.head.appendChild(link);
    };
    
    preloadFallback();
    
    // If Firestore has a different image, preload that too
    if (siteImages.heroHomeUrl && siteImages.heroHomeUrl !== FALLBACK_HERO_IMAGE) {
      const { webp, fallback } = getImageSources(siteImages.heroHomeUrl);
      
      // Preload WebP if available
      if (webp && webp !== fallback) {
        const webpLink = document.createElement('link');
        webpLink.rel = 'preload';
        webpLink.as = 'image';
        webpLink.href = webp;
        webpLink.type = 'image/webp';
        webpLink.setAttribute('fetchpriority', 'high');
        document.head.appendChild(webpLink);
      }
      
      // Preload Firestore image
      const firestoreLink = document.createElement('link');
      firestoreLink.rel = 'preload';
      firestoreLink.as = 'image';
      firestoreLink.href = fallback;
      firestoreLink.setAttribute('fetchpriority', 'high');
      document.head.appendChild(firestoreLink);
    }
  }, [siteImages.heroHomeUrl]);

  return (
    <div className="home">
      <main>
        {/* Hero Section */}
        <section className="hero-section" aria-label="Hero section">
          {(() => {
            const heroImageUrl = siteImages.heroHomeUrl || FALLBACK_HERO_IMAGE;
            const { webp, fallback } = getImageSources(heroImageUrl);
            
            return (
              <picture>
                {/* Try WebP first if available */}
                {webp && webp !== fallback && (
                  <source
                    srcSet={webp}
                    type="image/webp"
                  />
                )}
                {/* Fallback to original format */}
                <img
                  src={fallback}
                  alt=""
                  className="hero-background-img"
                  fetchPriority="high"
                  loading="eager"
                  width={1920}
                  height={1080}
                  aria-hidden="true"
                />
              </picture>
            );
          })()}
          <div className="hero-overlay" aria-hidden="true" />
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                {t('heroTitle')} <br /><span className="hero-highlight">{t('heroTitleHighlight')}</span>
              </h1>
              <p className="hero-tagline">
                {t('heroTagline')}
              </p>
              <div className="hero-actions">
                <Link to="/s-engager" className="btn-outline-hero" aria-label={t('becomeVolunteer')}>
                  {t('becomeVolunteer')}
                </Link>
                <Link to="/faire-un-don" className="btn-primary-hero" aria-label={t('donateNow')}>
                  {t('donateNow')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats Section */}
        <section className="quick-stats" aria-label="Notre Impact au Fil des Ans">
          <div className="container">
            <h2 className="stats-heading">{t('ourImpact')}</h2>
            <div className="stats-inner">
              <div className="stat" role="region" aria-label={language === 'fr' ? "Plus de 15 ans d'expérience" : "Over 15 years of experience"}>
                <div className="num" aria-label="15 plus">
                  <AnimatedCounter end={15} suffix="+" duration={2000} />
                </div>
                <div className="label">{t('yearsOfService')}</div>
              </div>
              <div className="stat" role="region" aria-label={language === 'fr' ? "Plus de 2000 vies touchées" : "Over 2000 lives touched"}>
                <div className="num" aria-label="2000 plus">
                  <AnimatedCounter end={2000} suffix="+" duration={2500} />
                </div>
                <div className="label">{t('livesTouched')}</div>
              </div>
              <div className="stat" role="region" aria-label={language === 'fr' ? "Plus de 50 projets réalisés" : "Over 50 projects completed"}>
                <div className="num" aria-label="50 plus">
                  <AnimatedCounter end={50} suffix="+" duration={2200} />
                </div>
                <div className="label">{t('projectsCompleted')}</div>
              </div>
              <div className="stat" role="region" aria-label={language === 'fr' ? "Plus de 100 communautés servies" : "Over 100 communities served"}>
                <div className="num" aria-label="100 plus">
                  <AnimatedCounter end={100} suffix="+" duration={2300} />
                </div>
                <div className="label">{t('communitiesServed')}</div>
              </div>
              <div className="stat" role="region" aria-label={language === 'fr' ? "Plus de 20 partenaires" : "Over 20 partners"}>
                <div className="num" aria-label="20 plus">
                  <AnimatedCounter end={20} suffix="+" duration={2100} />
                </div>
                <div className="label">{t('partnersCount')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Updates Section - News & Projects - Lazy Loaded */}
        <LazySection
          fallback={
            <section className="latest-updates-section" aria-labelledby="updates-heading" style={{ minHeight: '400px' }}>
              <div className="container">
                <h2 id="updates-heading">{t('latestNews')}</h2>
              </div>
            </section>
          }
          rootMargin="300px"
          onVisible={() => {
            setShouldLoadNews(true);
            setShouldLoadProjects(true);
          }}
        >
          <section className="latest-updates-section" aria-labelledby="updates-heading">
            <div className="container">
              <h2 id="updates-heading">{t('latestNews')}</h2>

              {newsItems.length === 0 && projects.length === 0 ? (
                <p
                  style={{
                    marginTop: '1.5rem',
                    textAlign: 'center',
                    color: 'var(--text-secondary, #616161)',
                  }}
                >
                  {language === 'fr' ? "Aucune actualité ou projet récent n'est disponible pour le moment. Veuillez revenir bientôt." : "No recent news or projects are available at the moment. Please check back soon."}
                </p>
              ) : (
                <div className="updates-grid" role="list" aria-label="Dernières actualités et projets">
                  {/* Show up to 2 news items */}
                  {newsItems.slice(0, 2).map((news) => (
                    <NewsCard key={news.id} news={news} />
                  ))}
                  {/* Show up to 4 projects (total 6 items) */}
                  {projects.slice(0, 4).map((project) => (
                    <NewsCard key={project.id} news={project} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </LazySection>

        {/* About IMADEL Section */}
        <section className="about-section" aria-labelledby="about-heading">
          <div className="container">
            <div className="about-content">
              <div className="about-text">
                <h2 id="about-heading">À Propos d'IMADEL</h2>
                <p>
                  IMADEL est le fruit de la volonté de ses membres de contribuer au développement économique et social 
                  de la population. Les membres d'IMADEL sont tous des acteurs ayant acquis et développé des compétences dans le 
                  domaine du développement local. Ces expériences portent sur des secteurs prioritaires tels que l'hydraulique, l'agriculture, 
                  l'élevage, la décentralisation, le renforcement des capacités, la migration, l'environnement/assainissement, la santé, l'éducation, etc. 
                  Ces expériences ont été largement partagées avec les groupes vulnérables.
                </p>
                <p>
                  Depuis quinze ans, IMADEL a entrepris des actions pour accélérer l'atteinte des Objectifs du Millénaire pour le Développement. 
                  Ces actions ont contribué de manière significative à l'accès à l'eau potable, à l'hygiène et à l'assainissement, 
                  à la sécurité alimentaire, à l'éducation et à la formation en santé maternelle et infantile par des actions de grande envergure pour des milliers 
                  d'hommes, de femmes et d'enfants à travers le Mali.
                </p>
              </div>
              <div className="about-image">
                <LazyImage
                  src={siteImages.aboutHomeUrl || FALLBACK_ABOUT_IMAGE}
                  alt="Membres de l'équipe IMADEL travaillant sur des projets de développement local au Mali"
                  width={600}
                  height={400}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mission/Objectives Section */}
        <section className="mission-section" aria-labelledby="mission-heading">
          <div className="container">
            <h2 id="mission-heading">{t('missionObjectives')}</h2>
            <div className="objectives-grid" role="list" aria-label="Objectifs de l'organisation">
              {OBJECTIVES.map((objective) => (
                <ObjectiveCard key={objective.id} objective={objective} />
              ))}
            </div>
          </div>
        </section>

        {/* Areas of Intervention Section */}
        <section className="areas-section" aria-labelledby="areas-heading">
          <div className="container">
            <h2 id="areas-heading">{t('areasOfIntervention')}</h2>
            <div className="areas-grid" role="list" aria-label="Domaines d'intervention">
              {AREAS_OF_INTERVENTION.map((area, index) => (
                <Link
                  key={index}
                  to={`/nos-projets?area=${encodeURIComponent(area)}`}
                  className="area-item"
                  role="listitem"
                >
                  <span className="area-text">{area}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>


        {/* Partners Preview Section */}
        <section className="partners-preview-section" aria-labelledby="partners-heading">
          <div className="container">
            <h2 id="partners-heading">{t('partnersPreview')}</h2>
            <p className="partners-subtitle">{language === 'fr' ? "Travailler ensemble pour le développement local" : "Working together for local development"}</p>
            <Link to="/partenaires" className="btn-outline" aria-label={language === 'fr' ? "Voir tous les partenaires" : "See all partners"}>
              {t('seeAllPartners')}
            </Link>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="cta-section" aria-labelledby="cta-heading">
          <div className="container">
            <h2 id="cta-heading">{t('ctaTitle')}</h2>
            <p>{t('ctaDescription')}</p>
            <div className="cta-buttons">
              <Link to="/s-engager" className="btn-primary" aria-label={t('getInvolved')}>
                {t('getInvolved')}
              </Link>
              <Link to="/faire-un-don" className="btn-secondary" aria-label={t('donate')}>
                {t('donate')}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
