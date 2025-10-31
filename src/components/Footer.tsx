import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter, FaTiktok } from "react-icons/fa";
import "./Footer.css";
import logo from "../assets/cropped-nouveau_logo.png";

const Footer: React.FC = () => {
  return (
    <footer>
      <div className="footer-container">
        {/* Logo and Brief */}
        <div className="footer-section">
          <img src={logo} alt="IMaDEL Logo" className="footer-logo" />
          <p>
            IMADEL is dedicated to empowering communities through health,
            education, and sustainable development initiatives across Ghana.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/ourwork">Our Work</Link></li>
            <li><Link to="/getinvolved">Get Involved</Link></li>
            <li><Link to="/partners">Partners</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: info@imadel.org</p>
          <p>Phone: +243 81 455 1589</p>
          <p>16-7e Rue Limete Résidentiel, Kinshasa, RDC</p>
        </div>

        {/* Social Media */}
        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="#" aria-label="Facebook"><FaFacebookF /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="TikTok"><FaTiktok /></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} IMADEL. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
