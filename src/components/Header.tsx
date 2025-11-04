import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "./Header.css";
import logo from "../assets/cropped-nouveau_logo.png";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={`${scrolled ? "scrolled" : ""} ${isMenuOpen ? "menu-open" : ""}`}>
      <div className="header-container">
        <NavLink to="/" className="logo-container">
          <img src={logo} alt="IMADEL Logo" />
          <span className="logo-text">IMADEL</span>
        </NavLink>

        <nav className={isMenuOpen ? "active" : ""}>
          <NavLink to="/" onClick={() => setIsMenuOpen(false)}>Home</NavLink>
          <NavLink to="/aboutus" onClick={() => setIsMenuOpen(false)}>About Us</NavLink>
          <NavLink to="/ourwork" onClick={() => setIsMenuOpen(false)}>Our Work</NavLink>
          <NavLink to="/getinvolved" onClick={() => setIsMenuOpen(false)}>Get Involved</NavLink>
          <NavLink to="/partners" onClick={() => setIsMenuOpen(false)}>Partners</NavLink>
          <NavLink to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</NavLink>
        </nav>

        <div className="header-right">
          <NavLink to="/donate" className="donate-button">Donate</NavLink>
          <div className="menu-toggle" onClick={toggleMenu}>
            {isMenuOpen ? "✕" : "☰"}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
