import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaTint,
  FaHospital,
  FaBook,
  FaSeedling,
  FaUniversity,
  FaMobileAlt
} from "react-icons/fa";
import { getSettings, subscribeToSettings, type Settings } from '../utils/settings';
import { useTranslation } from '../utils/i18n';
import './Donate.css';

const Donate: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'mobile' | 'bank'>('mobile');
  const [settings, setSettings] = useState<Settings>(getSettings());

  // Load settings and subscribe to updates
  useEffect(() => {
    setSettings(getSettings());
    const unsubscribe = subscribeToSettings((newSettings) => {
      setSettings(newSettings);
    });
    return unsubscribe;
  }, []);


  return (
    <div className="donate-page">
      {/* Rest of the component remains the same */}
      <div className="donate-hero" aria-labelledby="donate-hero-heading">
        <div className="container">
          <h1 id="donate-hero-heading">{t('supportOurMission')}</h1>
          <p>
            {t('supportOurMissionDesc')}
          </p>
        </div>
      </div>

      <div className="donate-container">
        <div className="container">
          <section className="donation-methods" aria-labelledby="donation-methods-heading">
            <h2 id="donation-methods-heading">{t('waysToDonate')}</h2>
            
            <div className="donation-tabs" role="tablist" aria-label={t('paymentMethods')}>
              <button
                className={`tab-btn ${activeTab === 'mobile' ? 'active' : ''}`}
                onClick={() => setActiveTab('mobile')}
                role="tab"
                aria-selected={activeTab === 'mobile'}
              >
                <FaMobileAlt size={18} style={{ marginRight: '0.5rem' }} />
                {t('mobileMoney')}
              </button>
              <button
                className={`tab-btn ${activeTab === 'bank' ? 'active' : ''}`}
                onClick={() => setActiveTab('bank')}
                role="tab"
                aria-selected={activeTab === 'bank'}
              >
                <FaUniversity size={18} style={{ marginRight: '0.5rem' }} />
                {t('bankTransfer')}
              </button>
            </div>

            {/* Mobile Money Tab */}
            {activeTab === 'mobile' && (
              <div className="tab-panel" role="tabpanel">
                <div className="mobile-money-section">
                  <h3>{t('mobileMoneyTitle')}</h3>
                  
                  <div className="payment-options">
                    <div className="payment-option">
                      <h4>{t('mobileMoneyTitle')}</h4>
                      <p className="option-description">
                        {t('manualPaymentDesc')}
                      </p>
                      
                      <div className="mobile-money-numbers">
                        <div className="mobile-number-card">
                          <h5>{t('orangeMoney')}</h5>
                          <div className="number-display">
                            <strong>{settings.orangeMoney}</strong>
                          </div>
                          <p className="account-name">{t('accountNameLabel')}: {t('accountNameValue')}</p>
                        </div>
                        
                        <div className="mobile-number-card">
                          <h5>{t('malitel')}</h5>
                          <div className="number-display">
                            <strong>{settings.malitel}</strong>
                          </div>
                          <p className="account-name">{t('accountNameLabel')}: {t('accountNameValue')}</p>
                        </div>
                      </div>

                      <div className="donation-note-inline">
                        <p>
                          {t('afterTransferSendReceipt')} <a href="mailto:imadel@imadel.net">imadel@imadel.net</a> {t('withSubject')} "{t('donationSubject')}".
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bank Transfer Tab */}
            {activeTab === 'bank' && (
              <div className="tab-panel" role="tabpanel">
                <div className="bank-transfer">
                  <h3>{t('bankTransferTitle')}</h3>
                  
                  <div className="bank-details">
                    <div className="bank-info">
                      <h4>{t('bankAccountMali')}</h4>
                      <dl>
                        <div className="bank-detail-item">
                          <dt>{t('bankName')}:</dt>
                          <dd>{settings.bankMali.bankName}</dd>
                        </div>
                        <div className="bank-detail-item">
                          <dt>{t('accountName')}:</dt>
                          <dd>{settings.bankMali.accountName}</dd>
                        </div>
                        <div className="bank-detail-item">
                          <dt>{t('accountNumber')}:</dt>
                          <dd>{settings.bankMali.accountNumber}</dd>
                        </div>
                        <div className="bank-detail-item">
                          <dt>{t('agency')}:</dt>
                          <dd>{settings.bankMali.agency}</dd>
                        </div>
                        <div className="bank-detail-item">
                          <dt>{t('swiftCode')}:</dt>
                          <dd>{settings.bankMali.swiftCode}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="bank-info">
                      <h4>{t('internationalTransfer')}</h4>
                      <dl>
                        <div className="bank-detail-item">
                          <dt>{t('bankName')}:</dt>
                          <dd>{settings.bankInternational.bankName}</dd>
                        </div>
                        <div className="bank-detail-item">
                          <dt>{t('accountName')}:</dt>
                          <dd>{settings.bankInternational.accountName}</dd>
                        </div>
                        <div className="bank-detail-item">
                          <dt>{t('accountNumber')}:</dt>
                          <dd>{settings.bankInternational.accountNumber}</dd>
                        </div>
                        <div className="bank-detail-item">
                          <dt>{t('iban')}:</dt>
                          <dd>{settings.bankInternational.iban}</dd>
                        </div>
                        <div className="bank-detail-item">
                          <dt>{t('swiftCode')}:</dt>
                          <dd>{settings.bankInternational.swiftCode}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div className="donation-note" role="note" aria-labelledby="donation-note-heading">
                    <h3 id="donation-note-heading">{t('importantNote')}</h3>
                    <p>
                      {t('bankTransferNote1')}
                    </p>
                    <p>
                      {t('bankTransferNote2')}
                    </p>
                    <a href="mailto:imadel@imadel.net" aria-label="Email de l'équipe financière IMADEL">
                      imadel@imadel.net
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="tax-info" role="note" aria-labelledby="tax-info-heading">
              <h3 id="tax-info-heading">{t('taxBenefits')}</h3>
              <p>
                {t('taxBenefitsDesc')}
              </p>
            </div>
          </section>

          <section className="impact-section" aria-labelledby="impact-heading">
            <h2 id="impact-heading">{t('yourDonationMakesDifference')}</h2>
            <div className="impact-grid">
              <div className="impact-item">
                <div className="impact-icon" aria-hidden="true">
                  <FaTint size={40} color="var(--primary, #0066CC)" />
                </div>
                <h4>{t('cleanWater')}</h4>
                <p>{t('cleanWaterDesc')}</p>
              </div>
              <div className="impact-item">
                <div className="impact-icon" aria-hidden="true">
                  <FaHospital size={40} color="var(--primary, #0066CC)" />
                </div>
                <h4>{t('healthcareTitle')}</h4>
                <p>{t('healthcareDesc')}</p>
              </div>
              <div className="impact-item">
                <div className="impact-icon" aria-hidden="true">
                  <FaBook size={40} color="var(--primary, #0066CC)" />
                </div>
                <h4>{t('educationTitle')}</h4>
                <p>{t('educationDesc')}</p>
              </div>
              <div className="impact-item">
                <div className="impact-icon" aria-hidden="true">
                  <FaSeedling size={40} color="var(--primary, #0066CC)" />
                </div>
                <h4>{t('foodSecurity')}</h4>
                <p>{t('foodSecurityDesc')}</p>
              </div>
            </div>
          </section>

          <section className="cta-section">
            <h2>{t('getInvolvedTitle')}</h2>
            <p>{t('getInvolvedDesc')}</p>
            <Link to="/s-engager" className="btn-primary">
              {t('learnMore')}
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Donate;
