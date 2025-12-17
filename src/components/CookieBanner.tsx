import React, { useEffect, useState } from 'react';
import './CookieBanner.css';

const COOKIE_KEY = 'imadel_cookie_consent_v1';

const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COOKIE_KEY);
      if (!stored) {
        setVisible(true);
      }
    } catch {
      // If localStorage not available, just show banner (no crash)
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      window.localStorage.setItem(COOKIE_KEY, 'accepted');
    } catch {
      // ignore
    }
    setVisible(false);
  };

  const handleMoreInfo = () => {
    // Scroll to contact or open privacy page if you add one later
    const contactSection = document.querySelector('[data-section="contact"]');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-label="Bannière de cookies">
      <div className="cookie-banner-content">
        <p className="cookie-banner-text">
          Nous utilisons des cookies et des technologies similaires pour améliorer votre expérience et analyser le trafic.
          En continuant à naviguer sur ce site, vous acceptez leur utilisation.
        </p>
        <div className="cookie-banner-actions">
          <button
            type="button"
            className="cookie-btn cookie-btn-secondary"
            onClick={handleMoreInfo}
          >
            En savoir plus
          </button>
          <button
            type="button"
            className="cookie-btn cookie-btn-primary"
            onClick={handleAccept}
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;


