import React, { useState, useRef, useEffect } from 'react';
import './Partners.css';

// Import partner logos
import careLogo from '../assets/partners/care.svg';
import oxfamLogo from '../assets/partners/oxfam.png';
import saveChildrenLogo from '../assets/partners/savechildren.svg';
import unicefLogo from '../assets/partners/unicef.png';
import worldVisionLogo from '../assets/partners/worldvision.svg';
import actionAidLogo from '../assets/partners/actionaid.png';
import planLogo from '../assets/partners/plan.png';
import redCrossLogo from '../assets/partners/redcross.svg';
import veoliaLogo from '../assets/partners/logo-veolia.png.webp';
import andorraLogo from '../assets/partners/andorra.avif';
import sossahelLogo from '../assets/partners/sossahel.webp';
import fhi360Logo from '../assets/partners/fhi360.svg';
import wfpLogo from '../assets/partners/wfp.svg';
import undpLogo from '../assets/partners/undp.svg';
import ircLogo from '../assets/partners/international-rescue-committee-seeklogo.svg';
import drcLogo from '../assets/partners/drc-300x300.jpg';

interface Partner {
  name: string;
  image: string | null;
  link: string;
  description: string;
}

// Lazy Image Component
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

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

  // Handle SVG loading - SVGs sometimes don't fire onLoad
  useEffect(() => {
    if (isInView && imgRef.current) {
      const img = imgRef.current;
      const isSvg = src.endsWith('.svg') || src.includes('.svg');
      
      // For SVGs, check if already loaded or set a timeout
      if (isSvg) {
        // Check if image is already complete (cached)
        if (img.complete && img.naturalWidth > 0) {
          setIsLoaded(true);
        } else {
          // Fallback: show SVG after a short delay if onLoad doesn't fire
          const timeout = setTimeout(() => {
            setIsLoaded(true);
          }, 200);
          
          return () => clearTimeout(timeout);
        }
      }
    }
  }, [isInView, src]);

  return (
    <div className="lazy-image-wrapper" ref={containerRef}>
      {!isLoaded && <div className="image-placeholder" aria-hidden="true" />}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={className}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={(e) => {
            // Hide broken images
            (e.target as HTMLImageElement).style.display = 'none';
          }}
          style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
        />
      )}
    </div>
  );
};

const Partners: React.FC = () => {
  const [partnersData, setPartnersData] = useState<Partner[]>([]);

  // Default partners array with CDN/Official URLs
  const defaultPartners: Partner[] = [
    {
      name: 'Care International',
      image: careLogo || 'https://www.care-international.org/themes/custom/care/logo.svg',
      link: 'https://www.care-international.org',
      description: 'Global humanitarian organization fighting poverty and social injustice'
    },
    {
      name: 'Oxfam',
      image: oxfamLogo || 'https://www.oxfam.org/themes/custom/oxfam/logo.svg',
      link: 'https://www.oxfam.org',
      description: 'International confederation working to end poverty and injustice'
    },
    {
      name: 'Save the Children',
      image: saveChildrenLogo || 'https://www.savethechildren.org/content/dam/usa/logos/save-the-children-logo.svg',
      link: 'https://www.savethechildren.org',
      description: 'Leading independent organization creating lasting change for children'
    },
    {
      name: 'UNICEF',
      image: unicefLogo || 'https://www.unicef.org/themes/custom/unicef/images/logo.svg',
      link: 'https://www.unicef.org',
      description: 'UN agency working for children\'s rights and well-being worldwide'
    },
    {
      name: 'World Vision',
      image: worldVisionLogo || 'https://www.worldvision.org/wp-content/themes/world-vision/images/wvi-logo.svg',
      link: 'https://www.worldvision.org',
      description: 'Christian humanitarian organization working to create lasting change'
    },
    {
      name: 'ActionAid',
      image: actionAidLogo || 'https://www.actionaid.org/sites/default/files/actionaid_logo.svg',
      link: 'https://www.actionaid.org',
      description: 'International anti-poverty agency working to eradicate poverty'
    },
    {
      name: 'Plan International',
      image: planLogo || 'https://plan-international.org/themes/custom/plan/logo.svg',
      link: 'https://plan-international.org',
      description: 'Development and humanitarian organization working for children\'s rights'
    },
    {
      name: 'Red Cross',
      image: redCrossLogo || 'https://www.icrc.org/themes/custom/icrc/logo.svg',
      link: 'https://www.icrc.org',
      description: 'International humanitarian organization providing assistance in conflicts'
    },
    {
      name: 'IOM – UN Migration',
      image: 'https://www.iom.int/profiles/iom_cms/themes/iom/logo.svg',
      link: 'https://www.iom.int',
      description: 'International Organization for Migration'
    },
    {
      name: 'Fondation Prince Albert II de Monaco',
      image: 'https://www.fpa2.org/app/themes/fpa2/dist/images/logo.svg',
      link: 'https://www.fpa2.org',
      description: 'Foundation dedicated to environmental protection and sustainable development'
    },
    {
      name: 'SNV (Netherlands Development Organisation)',
      image: 'https://www.snv.org/themes/custom/snv/logo.svg',
      link: 'https://www.snv.org',
      description: 'Netherlands Development Organisation'
    },
    {
      name: 'UNESCO',
      image: 'https://en.unesco.org/themes/education-21st-century/unesco-logo-en.svg',
      link: 'https://www.unesco.org',
      description: 'United Nations Educational, Scientific and Cultural Organization'
    },
    {
      name: 'Veolia Eau',
      image: veoliaLogo || 'https://www.veolia.com/themes/custom/veolia/logo.svg',
      link: 'https://www.veolia.com',
      description: 'Global leader in optimized resource management'
    },
    {
      name: 'Visit Andorra',
      image: andorraLogo,
      link: 'https://visitandorra.com/en/',
      description: 'Official tourism website of Andorra'
    },
    {
      name: 'Croix-Rouge Malienne',
      image: 'https://media.ifrc.org/ifrc/wp-content/uploads/sites/5/2018/03/red-cross-red-crescent.png',
      link: 'https://croix-rouge.ml',
      description: 'Malian Red Cross'
    },
    {
      name: 'MINUSMA',
      image: 'https://minusma.unmissions.org/themes/custom/unnew/logo.svg',
      link: 'https://minusma.unmissions.org',
      description: 'UN mission in Mali'
    },
    {
      name: 'SOS Sahel',
      image: sossahelLogo,
      link: 'https://www.sossahel.org',
      description: 'Organization fighting desertification in Sahel'
    },
    {
      name: 'U.S. Department of Defense',
      image: 'https://www.defense.gov/themes/defense2020/images/logo.svg',
      link: 'https://www.defense.gov',
      description: 'US DoD HIV/AIDS prevention'
    },
    {
      name: 'FHI 360',
      image: fhi360Logo || 'https://www.fhi360.org/themes/custom/fhi360/logo.svg',
      link: 'https://www.fhi360.org',
      description: 'Non-profit human development organization'
    },
    {
      name: 'USAID',
      image: 'https://www.usaid.gov/themes/custom/usaid_uswds/logo.svg',
      link: 'https://www.usaid.gov',
      description: 'US Agency for International Development'
    },
    {
      name: 'WFP (World Food Programme)',
      image: wfpLogo || 'https://www.wfp.org/themes/custom/wfp/assets/img/logos/wfp-logo-standard-blue-en.svg',
      link: 'https://www.wfp.org',
      description: 'World Food Programme'
    },
    {
      name: 'UNDP',
      image: undpLogo || 'https://www.undp.org/themes/custom/undp/logo.svg',
      link: 'https://www.undp.org',
      description: 'United Nations Development Programme'
    },
    {
      name: 'International Rescue Committee',
      image: ircLogo || 'https://www.rescue.org/themes/custom/rescue/logo.svg',
      link: 'https://www.rescue.org',
      description: 'Humanitarian aid organization'
    },
    {
      name: 'Danish Red Cross',
      image: drcLogo || 'https://www.rodekors.dk/themes/custom/redcross/logo.svg',
      link: 'https://www.rodekors.dk',
      description: 'Danish Red Cross'
    }
  ];

  // Load partners from admin panel
  useEffect(() => {
    const loadPartners = () => {
      try {
        const stored = localStorage.getItem('imadel_admin_partners');
        if (stored) {
          const adminPartners = JSON.parse(stored);
          const formattedPartners = adminPartners.map((p: any) => ({
            name: p.name,
            image: p.logo || null,
            link: p.website || '#',
            description: p.description || ''
          }));
          
          // Use admin partners if available, otherwise use defaults
          if (formattedPartners.length > 0) {
            setPartnersData(formattedPartners);
          } else {
            setPartnersData(defaultPartners);
          }
        } else {
          setPartnersData(defaultPartners);
        }
      } catch (error) {
        console.error('Error loading partners:', error);
        setPartnersData(defaultPartners);
      }
    };

    loadPartners();

    // Listen for updates from admin panel
    const handleUpdate = () => loadPartners();
    window.addEventListener('imadel:partners:updated', handleUpdate);

    return () => {
      window.removeEventListener('imadel:partners:updated', handleUpdate);
    };
  }, []);

  return (
    <div className="partners">
      {/* Hero Section */}
      <section className="partners-hero" aria-labelledby="partners-hero-heading">
        <div className="container">
          <h1 id="partners-hero-heading">Nos Partenaires</h1>
          <p>
            Nous sommes fiers de collaborer avec ces organisations exceptionnelles qui partagent notre engagement
            à créer un changement durable et à améliorer la vie des communautés au Mali et au-delà.
          </p>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="partners-section" aria-labelledby="partners-section-heading">
        <div className="container">
          <h2 id="partners-section-heading" className="sr-only">Organisations Partenaires</h2>
          <div className="partners-grid" role="list" aria-label="Liste des organisations partenaires">
            {partnersData.map((partner, index) => (
              <a
                key={index}
                href={partner.link}
                target="_blank"
                rel="noopener noreferrer"
                className="partner-card"
                role="listitem"
                aria-label={`${partner.name} - ${partner.description}. Ouvre dans une nouvelle fenêtre.`}
              >
                <div className="partner-logo-container">
                  {partner.image ? (
                    <LazyImage
                      src={partner.image}
                      alt={`Logo ${partner.name}`}
                      className="partner-logo"
                    />
                  ) : (
                    <div className="partner-placeholder" aria-hidden="true">
                      <span>{partner.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="partner-info">
                  <h3 className="partner-name">{partner.name}</h3>
                  <p className="partner-description">{partner.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Partners;
