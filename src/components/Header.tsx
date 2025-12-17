import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "../utils/i18n";
import "./Header.css";
import logo from "../assets/cropped-nouveau_logo.png";

const Header = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProjectsDropdownOpen, setIsProjectsDropdownOpen] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && !target.closest('nav') && !target.closest('.menu-toggle') && !target.closest('.header-right')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Always use solid (scrolled) style to ensure visibility across pages
  const headerClass = "scrolled";

  return (
    <header className={`${headerClass} ${isMenuOpen ? "menu-open" : ""}`}>
      <Link to="/" className="logo-container" onClick={() => setIsMenuOpen(false)}>
        <img src={logo} alt="IMADEL Logo" width="55" height="55" />
        <span className="logo-text">IMADEL</span>
      </Link>

      <nav className={isMenuOpen ? "active" : ""}>
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          onClick={() => setIsMenuOpen(false)}
        >
          {t('home')}
        </NavLink>
        <NavLink
          to="/a-propos"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          onClick={() => setIsMenuOpen(false)}
        >
          {t('about')}
        </NavLink>
        <div 
          className="nav-dropdown"
          onMouseEnter={() => {
            // Desktop: open dropdown on hover
            if (window.innerWidth > 1024) {
              setIsProjectsDropdownOpen(true);
            }
          }}
          onMouseLeave={() => {
            // Desktop: close dropdown when mouse leaves
            if (window.innerWidth > 1024) {
              setIsProjectsDropdownOpen(false);
            }
          }}
        >
          <NavLink
            to="/nos-projets"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            onClick={(e) => {
              // On mobile/tablet, toggle dropdown instead of navigating
              if (window.innerWidth <= 1024) {
                e.preventDefault();
                setIsProjectsDropdownOpen(!isProjectsDropdownOpen);
              } else {
                setIsMenuOpen(false);
              }
            }}
        >
          {t('work')}
        </NavLink>
          {isProjectsDropdownOpen && (
            <div className="dropdown-menu">
              <Link 
                to="/nos-projets" 
                className="dropdown-item"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsProjectsDropdownOpen(false);
                }}
              >
                Projets
              </Link>
              <Link 
                to="/actualites" 
                className="dropdown-item"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsProjectsDropdownOpen(false);
                }}
              >
                Actualités
              </Link>
            </div>
          )}
        </div>
        <NavLink
          to="/s-engager"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          onClick={() => setIsMenuOpen(false)}
        >
          {t('getInvolved')}
        </NavLink>
        <NavLink
          to="/partenaires"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          onClick={() => setIsMenuOpen(false)}
        >
          {t('partners')}
        </NavLink>
        <NavLink
          to="/contact"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          onClick={() => setIsMenuOpen(false)}
        >
          {t('contact')}
        </NavLink>
      </nav>

      <div className="header-right">
        <Link to="/faire-un-don" className="donate-button">{t('donate')}</Link>
        <div className="menu-toggle" onClick={toggleMenu}>
          {isMenuOpen ? "✕" : "☰"}
        </div>
      </div>
    </header>
  );
};

export default Header;
