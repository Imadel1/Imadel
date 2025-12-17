import React, { useState, useRef, useEffect } from 'react';
import './Partners.css';
import { partnersApi } from '../services/api';

// Import partner logos
import careLogo from '../assets/partners/care.svg';
import unicefLogo from '../assets/partners/unicef.png';
import actionAidLogo from '../assets/partners/actionaid.png';
import planLogo from '../assets/partners/plan.png';
import redCrossLogo from '../assets/partners/redcross.svg';
import andorraLogo from '../assets/partners/andorra.avif';
import sossahelLogo from '../assets/partners/sossahel.webp';
import ioumLogo from '../assets/partners/ioum.webp';
import unescoLogo from '../assets/partners/unesco.jpg';
import snvLogo from '../assets/partners/snv.jpg';
import prapsLogo from '../assets/partners/Praps.jpeg';
import fhi360Logo from '../assets/partners/fhi360.svg';
import wfpLogo from '../assets/partners/wfp.jpg';
import undpLogo from '../assets/partners/undp.svg';
import ircLogo from '../assets/partners/international-rescue-committee-seeklogo.svg';
import drcLogo from '../assets/partners/drc-300x300.jpg';
import minusmaLogo from '../assets/partners/MINUSMA.png';
import usaidLogo from '../assets/partners/USAID (1).png';
import dhappLogo from '../assets/partners/DHAPP.jpg';
import croixRougeMaliLogo from '../assets/partners/60-ANS-CROIX-ROUGE-MALI.png';

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
      description: 'Organisation humanitaire mondiale luttant contre la pauvreté et l’injustice sociale'
    },
    {
      name: 'UNICEF',
      image: unicefLogo || 'https://www.unicef.org/themes/custom/unicef/images/logo.svg',
      link: 'https://www.unicef.org',
      description: 'Agence des Nations Unies œuvrant pour les droits et le bien-être des enfants dans le monde'
    },
    {
      name: 'ActionAid',
      image: actionAidLogo || 'https://www.actionaid.org/sites/default/files/actionaid_logo.svg',
      link: 'https://www.actionaid.org',
      description: 'Agence internationale de lutte contre la pauvreté œuvrant à son éradication'
    },
    {
      name: 'Plan International',
      image: planLogo || 'https://plan-international.org/themes/custom/plan/logo.svg',
      link: 'https://plan-international.org',
      description: 'Organisation de développement et humanitaire œuvrant pour les droits des enfants'
    },
    {
      name: 'Red Cross',
      image: redCrossLogo || 'https://www.icrc.org/themes/custom/icrc/logo.svg',
      link: 'https://www.icrc.org',
      description: 'Organisation humanitaire internationale apportant une assistance en temps de conflit'
    },
    {
      name: 'IOM – UN Migration',
      image: ioumLogo || 'https://www.iom.int/profiles/iom_cms/themes/iom/logo.svg',
      link: 'https://www.iom.int',
      description: 'Organisation internationale pour les migrations'
    },
    {
      name: 'SNV (Netherlands Development Organisation)',
      image: snvLogo || 'https://www.snv.org/themes/custom/snv/logo.svg',
      link: 'https://www.snv.org',
      description: 'Organisation néerlandaise de développement'
    },
    {
      name: 'PRAPS – Projet Régional d’Appui au Pastoralisme au Sahel',
      image: prapsLogo,
      link: 'https://www.praps-sahel.org/',
      description: 'Projet régional d’appui au pastoralisme au Sahel'
    },
    {
      name: 'UNESCO',
      image: unescoLogo || 'https://en.unesco.org/themes/education-21st-century/unesco-logo-en.svg',
      link: 'https://www.unesco.org',
      description: 'Organisation des Nations Unies pour l’éducation, la science et la culture'
    },
    {
      name: 'Visit Andorra',
      image: andorraLogo,
      link: 'https://visitandorra.com/en/',
      description: 'Site officiel du tourisme en Andorre'
    },
    {
      name: 'Croix-Rouge Malienne',
      image: croixRougeMaliLogo || 'https://media.ifrc.org/ifrc/wp-content/uploads/sites/5/2018/03/red-cross-red-crescent.png',
      link: 'https://croix-rouge.ml',
      description: 'Croix-Rouge malienne'
    },
    {
      name: 'MINUSMA',
      image: minusmaLogo || 'https://minusma.unmissions.org/themes/custom/unnew/logo.svg',
      link: 'https://minusma.unmissions.org',
      description: 'Mission multidimensionnelle intégrée des Nations Unies pour la stabilisation au Mali'
    },
    {
      name: 'SOS Sahel',
      image: sossahelLogo,
      link: 'https://www.sossahel.org',
      description: 'Organisation luttant contre la désertification au Sahel'
    },
    {
      name: 'U.S. Department of Defense',
      image: dhappLogo || 'https://www.defense.gov/themes/defense2020/images/logo.svg',
      link: 'https://www.defense.gov',
      description: 'Programme du Département de la Défense des États‑Unis pour la prévention du VIH/sida'
    },
    {
      name: 'FHI 360',
      image: fhi360Logo || 'https://www.fhi360.org/themes/custom/fhi360/logo.svg',
      link: 'https://www.fhi360.org',
      description: 'Organisation à but non lucratif dédiée au développement humain'
    },
    {
      name: 'USAID',
      image: usaidLogo || 'https://www.usaid.gov/themes/custom/usaid_uswds/logo.svg',
      link: 'https://www.usaid.gov',
      description: 'Agence des États‑Unis pour le développement international'
    },
    {
      name: 'WFP (World Food Programme)',
      image: wfpLogo || 'https://www.wfp.org/themes/custom/wfp/assets/img/logos/wfp-logo-standard-blue-en.svg',
      link: 'https://www.wfp.org',
      description: 'Programme alimentaire mondial des Nations Unies'
    },
    {
      name: 'UNDP',
      image: undpLogo || 'https://www.undp.org/themes/custom/undp/logo.svg',
      link: 'https://www.undp.org',
      description: 'Programme des Nations Unies pour le développement'
    },
    {
      name: 'International Rescue Committee',
      image: ircLogo || 'https://www.rescue.org/themes/custom/rescue/logo.svg',
      link: 'https://www.rescue.org',
      description: 'Organisation d’aide humanitaire'
    },
    {
      name: 'Danish Red Cross',
      image: drcLogo || 'https://www.rodekors.dk/themes/custom/redcross/logo.svg',
      link: 'https://www.rodekors.dk',
      description: 'Croix-Rouge danoise'
    }
  ];

  // Load partners from Firestore (admin panel), merged with default hard-coded partners
  useEffect(() => {
    const loadPartners = async () => {
      try {
        const response = await partnersApi.getAll();

        const raw =
          (response as any).partners ||
          (response as any).data ||
          response;

        let dynamicPartners: Partner[] = [];

        if (response.success !== false && Array.isArray(raw)) {
          dynamicPartners = raw.map((p: any) => ({
            name: p.name || 'Partenaire',
            image:
              p.logo ||
              (Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null) ||
              null,
            link: p.website || '#',
            description: p.description || '',
          }));
        }

        // Always show hard-coded partners first, then dynamic Firestore partners
        setPartnersData([...defaultPartners, ...dynamicPartners]);
      } catch (error) {
        console.error('Error loading partners from Firestore:', error);
        // Fallback to hard-coded partners only
        setPartnersData(defaultPartners);
      }
    };

    void loadPartners();

    // Listen for updates from admin panel to refresh the list
    const handleUpdate = () => {
      void loadPartners();
    };
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
