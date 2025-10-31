import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
      <div className="logo-container">
        <img src={logo} alt="IMADEL Logo" />
        <span className="logo-text">IMADEL</span>
      </div>

      <nav className={isMenuOpen ? "active" : ""}>
        <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
        <Link to="/aboutus" onClick={() => setIsMenuOpen(false)}>About Us</Link>
        <Link to="/ourwork" onClick={() => setIsMenuOpen(false)}>Our Work</Link>
        <Link to="/getinvolved" onClick={() => setIsMenuOpen(false)}>Get Involved</Link>
        <Link to="/partners" onClick={() => setIsMenuOpen(false)}>Partners</Link>
        <Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link>
      </nav>

      <div className="header-right">
        <Link to="/donate" className="donate-button">Donate</Link>
        <div className="menu-toggle" onClick={toggleMenu}>
          {isMenuOpen ? "✕" : "☰"}
        </div>
      </div>
    </header>
  );
};

export default Header;
