import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { FaBullseye, FaGlobeAmericas, FaDumbbell, FaHandshake, FaLandmark, FaSeedling } from "react-icons/fa";
import "./Home.css";
import { projectsApi } from "../services/api";

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
const HERO_IMAGE = "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=1600&auto=format&fit=crop";
const ABOUT_IMAGE = "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200&auto=format&fit=crop";

const AREAS_OF_INTERVENTION = [
  "Rural and urban hydraulics",
  "Decentralization",
  "Hygiene/sanitation",
  "Education",
  "Formation",
  "Advocacy/lobbying",
  "Environment",
  "Health",
  "Local development"
];

const OBJECTIVES: Objective[] = [
  {
    id: "1",
    icon: "target",
    title: "Support Communities",
    description: "To provide technical, material and financial support to associations or human groups for the improvement of their living conditions and their self-promotion"
  },
  {
    id: "2",
    icon: "globe",
    title: "Economic & Social Development",
    description: "To contribute effectively to the economic, social and cultural development of the Malian population, according to the reference frameworks adopted by the Governments"
  },
  {
    id: "3",
    icon: "dumbbell",
    title: "Capacity Building",
    description: "Contribute to the capacity building of development actors with a view to accelerating the ownership and ownership of local development"
  },
  {
    id: "4",
    icon: "handshake",
    title: "Civil Society",
    description: "Promote the strengthening of a civil society participating in the formulation and implementation of development policies"
  },
  {
    id: "5",
    icon: "landmark",
    title: "Governance",
    description: "Promote democracy, good governance and support the implementation of the decentralization policy in the country"
  },
  {
    id: "6",
    icon: "partnership",
    title: "Partnership",
    description: "Strengthen the partnership by boosting the efforts of the State and partner NGOs and associations in support of communities"
  },
  {
    id: "7",
    icon: "seedling",
    title: "Sustainable Development",
    description: "Work for sustainable, equitable and participatory development"
  }
];

// Icon mapping function
const getObjectiveIcon = (iconName: string) => {
  const iconProps = { size: 48, color: 'var(--primary, #FF6B00)' };
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
  return (
    <article className="news-card">
      <div className="news-image">
        <LazyImage
          src={news.image || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?q=80&w=800&auto=format&fit=crop"}
          alt={news.title}
          width={350}
          height={200}
          className="news-img"
        />
      </div>
      <div className="news-content">
        <h3>{news.title}</h3>
        <Link to={`/news/${news.id}`} className="read-more" aria-label={`Read more about ${news.title}`}>
          READ MORE
        </Link>
      </div>
    </article>
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
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [projects, setProjects] = useState<NewsItem[]>([]);

  // Load newsletters from admin panel (keeping localStorage for now until backend adds newsletter content endpoints)
  useEffect(() => {
    const loadNewsletters = () => {
      try {
        const stored = localStorage.getItem('imadel_admin_newsletters');
        if (stored) {
          const newsletters = JSON.parse(stored);
          // Filter only published newsletters and map to news format
          const publishedNews = newsletters
            .filter((n: any) => n.published)
            .map((n: any) => ({
              id: n.id,
              title: n.title,
              description: n.content ? n.content.substring(0, 150) + '...' : '',
              image: n.images && n.images[0] ? n.images[0] : 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?q=80&w=800&auto=format&fit=crop',
              badge: 'NEWS',
              link: `/news/${n.id}`,
              date: n.date
            }));
          
          // Use admin newsletters if available, otherwise use defaults
          if (publishedNews.length > 0) {
            setNewsItems(publishedNews);
          }
        }
      } catch (error) {
        console.error('Error loading newsletters:', error);
      }
    };

    loadNewsletters();

    // Listen for updates from admin panel
    const handleUpdate = () => loadNewsletters();
    window.addEventListener('imadel:newsletters:updated', handleUpdate);

    return () => {
      window.removeEventListener('imadel:newsletters:updated', handleUpdate);
    };
  }, []);

  // Load projects from API
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await projectsApi.getAll({ published: true });

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
              badge: p.location || 'PROJECT',
              link: `/project/${p._id || p.id}`,
            }));
          
          setProjects(mappedProjects);
        }
      } catch (error) {
        console.error('Error loading projects from API:', error);
        // Do not fall back to localStorage – show only live backend data
        setProjects([]);
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

  return (
    <div className="home">
      <main>
        {/* Hero Section */}
        <section className="hero-section" aria-label="Hero section">
          <div 
            className="hero-background" 
            style={{ backgroundImage: `url(${HERO_IMAGE})` }}
            aria-hidden="true"
          />
          <div className="hero-overlay" aria-hidden="true" />
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Empowering Communities,<br />Building <span className="hero-highlight">Lasting Change</span>
              </h1>
              <p className="hero-tagline">
                Transforming lives across Mali through sustainable development initiatives in health, education, water access, and community empowerment.
              </p>
              <div className="hero-actions">
                <Link to="/getinvolved" className="btn-secondary" aria-label="Get involved with IMADEL">
                  Become a Volunteer
                </Link>
                <Link to="/donate" className="btn-primary" aria-label="Donate to IMADEL">
                  Donate Now
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats Section */}
        <section className="quick-stats" aria-label="Our Impact Over the Years">
          <div className="container">
            <h2 className="stats-heading">Our Impact Over the Years</h2>
            <div className="stats-inner">
              <div className="stat" role="region" aria-label="15 plus years of experience">
                <div className="num" aria-label="15 plus">
                  <AnimatedCounter end={15} suffix="+" duration={2000} />
                </div>
                <div className="label">Years of Service</div>
              </div>
              <div className="stat" role="region" aria-label="2000 plus lives touched">
                <div className="num" aria-label="2000 plus">
                  <AnimatedCounter end={2000} suffix="+" duration={2500} />
                </div>
                <div className="label">Lives Touched</div>
              </div>
              <div className="stat" role="region" aria-label="50 plus projects completed">
                <div className="num" aria-label="50 plus">
                  <AnimatedCounter end={50} suffix="+" duration={2200} />
                </div>
                <div className="label">Projects Completed</div>
              </div>
              <div className="stat" role="region" aria-label="100 plus communities served">
                <div className="num" aria-label="100 plus">
                  <AnimatedCounter end={100} suffix="+" duration={2300} />
                </div>
                <div className="label">Communities Served</div>
              </div>
              <div className="stat" role="region" aria-label="20 plus partners">
                <div className="num" aria-label="20 plus">
                  <AnimatedCounter end={20} suffix="+" duration={2100} />
                </div>
                <div className="label">Active Partners</div>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Updates Section - News & Projects */}
        <section className="latest-updates-section" aria-labelledby="updates-heading">
          <div className="container">
            <h2 id="updates-heading">Latest News & Projects</h2>

            {newsItems.length === 0 && projects.length === 0 ? (
              <p
                style={{
                  marginTop: '1.5rem',
                  textAlign: 'center',
                  color: 'var(--text-secondary, #616161)',
                }}
              >
                No recent news or projects are available at the moment. Please check back soon.
              </p>
            ) : (
              <div className="updates-grid" role="list" aria-label="Latest news and projects">
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

        {/* About IMADEL Section */}
        <section className="about-section" aria-labelledby="about-heading">
          <div className="container">
            <div className="about-content">
              <div className="about-text">
                <h2 id="about-heading">About IMADEL</h2>
                <p>
                  IMADEL is the result of the desire of its members to contribute to the economic and social development 
                  of the population. The members of IMADEL are all actors who have acquired and developed skills in the 
                  field of local development. These experiences focus on priority sectors such as hydraulics, agriculture, 
                  livestock, decentralization, capacity building, migration, environment/sanitation, health, education, etc. 
                  These experiences have been widely shared with vulnerable groups.
                </p>
                <p>
                  For fifteen years, IMADEL has undertaken actions to accelerate the achievement of the Millennium Development 
                  Goals. These actions have significantly contributed to access to safe drinking water, hygiene and sanitation, 
                  food security, education and training in maternal and child health through large-scale actions for thousands 
                  of men, women and children across Mali.
                </p>
              </div>
              <div className="about-image">
                <LazyImage
                  src={ABOUT_IMAGE}
                  alt="IMADEL team members working on local development projects in Mali"
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
            <h2 id="mission-heading">Our Mission & Objectives</h2>
            <div className="objectives-grid" role="list" aria-label="Organizational objectives">
              {OBJECTIVES.map((objective) => (
                <ObjectiveCard key={objective.id} objective={objective} />
              ))}
                </div>
                </div>
        </section>

        {/* Areas of Intervention Section */}
        <section className="areas-section" aria-labelledby="areas-heading">
          <div className="container">
            <h2 id="areas-heading">Areas of Intervention</h2>
            <div className="areas-grid" role="list" aria-label="Areas of intervention">
              {AREAS_OF_INTERVENTION.map((area, index) => (
                <div key={index} className="area-item" role="listitem">
                  {area}
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* Partners Preview Section */}
        <section className="partners-preview-section" aria-labelledby="partners-heading">
          <div className="container">
            <h2 id="partners-heading">Our Partners</h2>
            <p className="partners-subtitle">Working together for local development</p>
            <Link to="/partners" className="btn-outline" aria-label="View all partners">
              View All Partners
            </Link>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="cta-section" aria-labelledby="cta-heading">
          <div className="container">
            <h2 id="cta-heading">Together, let's make a difference!</h2>
            <p>Every day, IMADEL acts on the ground to help the most vulnerable populations. Join us in our mission to create sustainable, equitable and participatory development.</p>
            <div className="cta-buttons">
              <Link to="/getinvolved" className="btn-primary" aria-label="Get involved with IMADEL">
                Get Involved
              </Link>
              <Link to="/donate" className="btn-secondary" aria-label="Donate to IMADEL">
                Donate
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
