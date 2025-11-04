import "./Contact.css";
import { FaFacebookF, FaLinkedinIn, FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function Contact() {
  return (
    <div className="contact-page">
      <div className="contact-content">
        <div className="contact-info">
          <h2>Contact Us</h2>
          <div className="contact-details">
            <div className="contact-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <div className="contact-item-content">
                <h3>Visit Us</h3>
                <p>16-7e Rue Limete Résidentiel<br />
                Kinshasa, RDC</p>
              </div>
            </div>

            <div className="contact-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <div className="contact-item-content">
                <h3>Call Us</h3>
                <p>+243 81 455 1589</p>
              </div>
            </div>

            <div className="contact-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <div className="contact-item-content">
                <h3>Email Us</h3>
                <p>info@imadel.org</p>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="social-media-section">
            <h3>Connect with us on our socials.</h3>
            <div className="social-icons">
              <a href="https://www.facebook.com/ImadelML" aria-label="Facebook"><FaFacebookF /></a>
              <a href="https://www.linkedin.com/company/ong-imadel/" aria-label="FaLinkedinIn">< FaLinkedinIn/></a>
              <a href="https://x.com/ONGImadel" aria-label="Twitter"><FaXTwitter /></a>
              <a href="#" aria-label="TikTok"><FaTiktok /></a>
            </div>
          </div>
        </div>

        <div className="map-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3978.5622136450347!2d15.351721!3d-4.324752!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1a6a33c43f825b3b%3A0x3c5d1c69f7e9ba11!2sLimete%2C%20Kinshasa!5e0!3m2!1sen!2scd!4v1635515234567!5m2!1sen!2scd"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
