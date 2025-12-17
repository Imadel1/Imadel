import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaLinkedinIn, FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaWhatsapp } from "react-icons/fa";
import { useTranslation } from "../utils/i18n";
import { getSettings, subscribeToSettings } from "../utils/settings";
import NewsletterModal from "./NewsletterModal";
import "./footer.css";
import logo from "../assets/cropped-nouveau_logo.png";

const Footer: React.FC = () => {
  const { t, language } = useTranslation();
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false);
  const [settings, setSettings] = useState(getSettings());

  // Load settings and subscribe to updates
  useEffect(() => {
    setSettings(getSettings());
    const unsubscribe = subscribeToSettings((newSettings) => {
      setSettings(newSettings);
    });
    return unsubscribe;
  }, []);
  
  return (
    <>
      <footer className="footer">
      <div className="footer-container">
        {/* Logo and Description */}
        <div className="footer-brand">
          <img src={logo} alt="IMADEL Logo" className="footer-logo" />
          <p className="footer-tagline">
            {language === 'fr' ? 'Autonomiser les communautés grâce au développement durable' : 'Empowering communities through sustainable development'}
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section quick-links-section">
          <h4>{t('quickLinks')}</h4>
          <nav className="footer-nav" role="navigation" aria-label="Navigation pied de page">
            <Link to="/a-propos">{t('about')}</Link>
            <Link to="/nos-projets">{t('work')}</Link>
            <Link to="/actualites">Actualités</Link>
            <Link to="/s-engager">{t('jobOffers')}</Link>
            <Link to="/partenaires">{t('partners')}</Link>
            <Link to="/contact">{t('contact')}</Link>
          </nav>
        </div>

        {/* Contact */}
        <div className="footer-section">
          <h4>{t('contact')}</h4>
          <p className="footer-contact">
            Bamako-Hamdallaye ACI 2000<br />
            <a href="mailto:imadel@imadel.net">imadel@imadel.net</a><br />
            <a href="mailto:imadel@imadel-mali.org">imadel@imadel-mali.org</a><br />
            <a href="mailto:imadelmopti@imadel-mali.org">imadelmopti@imadel-mali.org</a><br />
            <a href={`tel:${settings.phoneNumber.replace(/\s/g, '')}`}>{settings.phoneNumber}</a><br />
            <a href={`tel:${settings.orangeMoney.replace(/\s/g, '')}`}>{settings.orangeMoney}</a><br />
            <a href={`tel:${settings.malitel.replace(/\s/g, '')}`}>{settings.malitel}</a><br />
            <a href="tel:+22375221808">+223 75 22 18 08</a><br />
            <a href="tel:+22394941313">+223 94 94 13 13</a>
          </p>
        </div>

        {/* Social */}
        <div className="footer-section">
          <h4>{t('followUs')}</h4>
          <div className="social-icons">
            <a href="https://www.facebook.com/ImadelML" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <FaFacebookF />
            </a>
            <a href="https://www.linkedin.com/company/ong-imadel/" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
              <FaLinkedinIn />
            </a>
            <a href="https://x.com/ONGImadel" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
              <FaXTwitter />
            </a>
            <a href="https://wa.me/22375221808" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
              <FaWhatsapp />
            </a>
            <a href="#" aria-label="TikTok">
              <FaTiktok />
            </a>
          </div>
          <button 
            className="footer-newsletter-btn"
            onClick={() => setIsNewsletterModalOpen(true)}
            aria-label="S'abonner à la newsletter"
          >
            S'abonner à la newsletter
          </button>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} IMADEL. {t('allRightsReserved')}.</p>
      </div>
    </footer>
    
    <NewsletterModal 
      isOpen={isNewsletterModalOpen} 
      onClose={() => setIsNewsletterModalOpen(false)} 
    />
    </>
  );
};

export default Footer;
