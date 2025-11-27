import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
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
        <img src={logo} alt="IMADEL Logo" width="55" height="55" />
        <span className="logo-text">IMADEL</span>
      </div>

      <nav className={isMenuOpen ? "active" : ""}>
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          onClick={() => setIsMenuOpen(false)}
        >
          Home
        </NavLink>
        <NavLink
          to="/aboutus"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          onClick={() => setIsMenuOpen(false)}
        >
          About Us
        </NavLink>
        <NavLink
          to="/ourwork"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          onClick={() => setIsMenuOpen(false)}
        >
          Our Work
        </NavLink>
        <NavLink
          to="/getinvolved"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          onClick={() => setIsMenuOpen(false)}
        >
          Get Involved
        </NavLink>
        <NavLink
          to="/partners"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          onClick={() => setIsMenuOpen(false)}
        >
          Partners
        </NavLink>
        <NavLink
          to="/contact"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          onClick={() => setIsMenuOpen(false)}
        >
          Contact
        </NavLink>
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
