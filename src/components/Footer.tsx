import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaLinkedinIn, FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useTranslation } from "../utils/i18n";
import "./footer.css";
import logo from "../assets/cropped-nouveau_logo.png";

const Footer: React.FC = () => {
  const { t, language } = useTranslation();
  
  return (
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
            <Link to="/aboutus">{t('about')}</Link>
            <Link to="/ourwork">{t('work')}</Link>
            <Link to="/getinvolved">{t('jobOffers')}</Link>
            <Link to="/partners">{t('partners')}</Link>
            <Link to="/contact">{t('contact')}</Link>
          </nav>
        </div>

        {/* Contact */}
        <div className="footer-section">
          <h4>{t('contact')}</h4>
          <p className="footer-contact">
            Bamako-Hamdallaye ACI 2000<br />
            <a href="mailto:imadel@imadel.net">imadel@imadel.net</a><br />
            <a href="tel:+22320799840">+223 20 79 98 40</a>
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
            <a href="#" aria-label="TikTok">
              <FaTiktok />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} IMADEL. {t('allRightsReserved')}.</p>
      </div>
    </footer>
  );
};

export default Footer;
