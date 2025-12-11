import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "../utils/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import "./Header.css";
import logo from "../assets/cropped-nouveau_logo.png";

const Header = () => {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  // On non-home pages, always show the solid (scrolled) style
  const headerClass = !isHome || scrolled ? "scrolled" : "";

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
          to="/aboutus"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          onClick={() => setIsMenuOpen(false)}
        >
          {t('about')}
        </NavLink>
        <NavLink
          to="/ourwork"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          onClick={() => setIsMenuOpen(false)}
        >
          {t('work')}
        </NavLink>
        <NavLink
          to="/getinvolved"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          onClick={() => setIsMenuOpen(false)}
        >
          {t('getInvolved')}
        </NavLink>
        <NavLink
          to="/partners"
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
        <LanguageSwitcher />
        <Link to="/donate" className="donate-button">{t('donate')}</Link>
        <div className="menu-toggle" onClick={toggleMenu}>
          {isMenuOpen ? "✕" : "☰"}
        </div>
      </div>
    </header>
  );
};

export default Header;
