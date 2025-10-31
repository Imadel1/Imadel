import './Donate.css';

const Donate = () => {
  return (
    <div className="donate-page">
      <div className="donate-hero">
        <h1>Support Our Mission</h1>
        <p>Your contribution helps us create lasting change in communities across Ghana</p>
      </div>

      <div className="donate-container">
        <div className="donation-methods">
          <div className="bank-transfer">
            <h2>Bank Transfer</h2>
            <div className="bank-details">
              <div className="bank-info">
                <h3>Ghana Bank Account</h3>
                <ul>
                  <li>
                    <span className="label">Bank Name:</span>
                    <span className="value">Ghana Commercial Bank</span>
                  </li>
                  <li>
                    <span className="label">Account Name:</span>
                    <span className="value">IMaDEL Foundation</span>
                  </li>
                  <li>
                    <span className="label">Account Number:</span>
                    <span className="value">1234567890</span>
                  </li>
                  <li>
                    <span className="label">Branch:</span>
                    <span className="value">Accra Main Branch</span>
                  </li>
                  <li>
                    <span className="label">Swift Code:</span>
                    <span className="value">GHCBGHAC</span>
                  </li>
                </ul>
              </div>

              <div className="bank-info">
                <h3>International Bank Account</h3>
                <ul>
                  <li>
                    <span className="label">Bank Name:</span>
                    <span className="value">Standard Chartered Bank</span>
                  </li>
                  <li>
                    <span className="label">Account Name:</span>
                    <span className="value">IMaDEL International</span>
                  </li>
                  <li>
                    <span className="label">Account Number:</span>
                    <span className="value">0987654321</span>
                  </li>
                  <li>
                    <span className="label">IBAN:</span>
                    <span className="value">GB29 NWBK 6016 1331 9268 19</span>
                  </li>
                  <li>
                    <span className="label">Swift Code:</span>
                    <span className="value">SCBLGB2L</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="donation-note">
            <h3>Important Note</h3>
            <p>Please include your name and "Donation" in the transfer description for proper tracking of your contribution.</p>
            <p>For donation receipts or any questions, please contact our finance team at:</p>
            <a href="mailto:donations@imadel.org">donations@imadel.org</a>
          </div>

          <div className="tax-info">
            <h3>Tax Benefits</h3>
            <p>IMaDEL is a registered non-profit organization. Your donations may be tax-deductible in your country of residence.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;