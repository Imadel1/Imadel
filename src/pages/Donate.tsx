import React from 'react';
import { Link } from 'react-router-dom';
import './Donate.css';

const Donate: React.FC = () => {
  return (
    <div className="donate-page">
      <div className="donate-hero" aria-labelledby="donate-hero-heading">
        <div className="container">
          <h1 id="donate-hero-heading">Support Our Mission</h1>
          <p>
            Your contribution helps us create lasting change in communities across Mali.
            Every donation makes a difference in the lives of those we serve.
          </p>
        </div>
      </div>

      <div className="donate-container">
        <div className="container">
          <section className="donation-methods" aria-labelledby="donation-methods-heading">
            <h2 id="donation-methods-heading">Ways to Donate</h2>
            
            <div className="bank-transfer">
              <h3>Bank Transfer</h3>
              <div className="bank-details">
                <div className="bank-info">
                  <h4>Mali Bank Account</h4>
                  <dl>
                    <div className="bank-detail-item">
                      <dt>Bank Name:</dt>
                      <dd>Bank of Africa - Mali (BOA)</dd>
                    </div>
                    <div className="bank-detail-item">
                      <dt>Account Name:</dt>
                      <dd>IMADEL (Malian Initiative for Local Development Support)</dd>
                    </div>
                    <div className="bank-detail-item">
                      <dt>Account Number:</dt>
                      <dd>00123456789</dd>
                    </div>
                    <div className="bank-detail-item">
                      <dt>Branch:</dt>
                      <dd>Bamako-Hamdallaye ACI 2000</dd>
                    </div>
                    <div className="bank-detail-item">
                      <dt>Swift Code:</dt>
                      <dd>BOAMMLBM</dd>
                    </div>
                  </dl>
                </div>

                <div className="bank-info">
                  <h4>International Bank Transfer</h4>
                  <dl>
                    <div className="bank-detail-item">
                      <dt>Bank Name:</dt>
                      <dd>Ecobank Mali</dd>
                    </div>
                    <div className="bank-detail-item">
                      <dt>Account Name:</dt>
                      <dd>IMADEL International</dd>
                    </div>
                    <div className="bank-detail-item">
                      <dt>Account Number:</dt>
                      <dd>0987654321</dd>
                    </div>
                    <div className="bank-detail-item">
                      <dt>IBAN:</dt>
                      <dd>ML13 0012 3456 7890 1234 5678 901</dd>
                    </div>
                    <div className="bank-detail-item">
                      <dt>Swift Code:</dt>
                      <dd>ECOMMLBM</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            <div className="donation-note" role="note" aria-labelledby="donation-note-heading">
              <h3 id="donation-note-heading">Important Note</h3>
              <p>
                Please include your name and "Donation" in the transfer description for proper tracking of your contribution.
              </p>
              <p>
                For donation receipts or any questions, please contact our finance team at:
              </p>
              <a href="mailto:imadel@imadel.net" aria-label="Email IMADEL finance team">
                imadel@imadel.net
              </a>
            </div>

            <div className="tax-info" role="note" aria-labelledby="tax-info-heading">
              <h3 id="tax-info-heading">Tax Benefits</h3>
              <p>
                IMADEL is a registered non-governmental organization in Mali. Your donations may be tax-deductible 
                depending on your country of residence and local tax laws. Please consult with a tax advisor for 
                information specific to your situation.
              </p>
            </div>
          </section>

          <section className="impact-section" aria-labelledby="impact-heading">
            <h2 id="impact-heading">Your Donation Makes a Difference</h2>
            <div className="impact-grid">
              <div className="impact-item">
                <div className="impact-icon" aria-hidden="true">
                  <FaTint size={40} color="var(--primary, #FF6B00)" />
                </div>
                <h4>Clean Water</h4>
                <p>Help provide access to safe drinking water for communities</p>
              </div>
              <div className="impact-item">
                <div className="impact-icon" aria-hidden="true">
                  <FaHospital size={40} color="var(--primary, #FF6B00)" />
                </div>
                <h4>Healthcare</h4>
                <p>Support health programs and maternal care initiatives</p>
              </div>
              <div className="impact-item">
                <div className="impact-icon" aria-hidden="true">
                  <FaBook size={40} color="var(--primary, #FF6B00)" />
                </div>
                <h4>Education</h4>
                <p>Fund educational programs and school rehabilitation</p>
              </div>
              <div className="impact-item">
                <div className="impact-icon" aria-hidden="true">
                  <FaSeedling size={40} color="var(--primary, #FF6B00)" />
                </div>
                <h4>Food Security</h4>
                <p>Contribute to food security and nutrition programs</p>
              </div>
            </div>
          </section>

          <section className="cta-section">
            <h2>Get Involved</h2>
            <p>Beyond donations, there are many ways to support our mission.</p>
            <Link to="/getinvolved" className="btn-primary">
              Learn More
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Donate;
