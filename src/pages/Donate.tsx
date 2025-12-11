import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  FaTint,
  FaHospital,
  FaBook,
  FaSeedling,
  FaCreditCard,
  FaUniversity,
  FaMobileAlt
} from "react-icons/fa";
import { donationsApi } from '../services/api';
import DonationForm from '../components/DonationForm';
import { getSettings, subscribeToSettings, type Settings } from '../utils/settings';
import { useTranslation } from '../utils/i18n';
import './Donate.css';

interface MobileMoneyFormData {
  phoneNumber: string;
  provider: 'orange' | 'malitel';
  amount: string;
  currency: string;
  purpose: string;
  donorName: string;
  donorEmail: string;
}

// Remove the DonationResponse interface - we'll use the API's return type directly

const Donate: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'mobile' | 'bank' | 'card'>('mobile');
  const [settings, setSettings] = useState<Settings>(getSettings());
  const [mobileMoneyForm, setMobileMoneyForm] = useState<MobileMoneyFormData>({
    phoneNumber: '',
    provider: 'orange',
    amount: '',
    currency: 'XOF',
    purpose: 'general',
    donorName: '',
    donorEmail: '',
  });
  const [isProcessingMobile, setIsProcessingMobile] = useState(false);
  const [mobileError, setMobileError] = useState<string | null>(null);

  // Load settings and subscribe to updates
  useEffect(() => {
    setSettings(getSettings());
    const unsubscribe = subscribeToSettings((newSettings) => {
      setSettings(newSettings);
    });
    return unsubscribe;
  }, []);

  const handleMobileMoneySubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMobileError(null);
    setIsProcessingMobile(true);

    try {
      const amountNum = parseFloat(mobileMoneyForm.amount);
      if (isNaN(amountNum) || amountNum < 100) {
        setMobileError(t('minimumAmountError'));
        setIsProcessingMobile(false);
        return;
      }

      // Initialize donation with mobile money - don't specify type, let TypeScript infer
      const response = await donationsApi.initialize({
        donorName: mobileMoneyForm.donorName,
        donorEmail: mobileMoneyForm.donorEmail,
        donorPhone: mobileMoneyForm.phoneNumber,
        amount: amountNum,
        currency: mobileMoneyForm.currency as any,
        message: `Mobile Money - ${mobileMoneyForm.provider === 'orange' ? 'Orange Money' : 'Malitel'}`,
        isAnonymous: false,
        purpose: mobileMoneyForm.purpose as any,
      });

      // Check if response is successful and has authorization_url
      if (response.success && response.data) {
        // Type assertion to access authorization_url
        const data = response.data as any;
        if (data.authorization_url) {
          window.location.href = data.authorization_url;
        } else {
          setMobileError(response.message || 'Erreur lors de l\'initialisation du paiement');
        }
      } else {
        setMobileError(response.message || t('paymentInitError'));
      }
    } catch (err: any) {
      console.error('Mobile Money error:', err);
      setMobileError(err.message || t('genericError'));
    } finally {
      setIsProcessingMobile(false);
    }
  };

  const purposeOptions = [
    { value: 'general', label: t('generalDonation') },
    { value: 'education', label: t('education') },
    { value: 'healthcare', label: t('healthcare') },
    { value: 'water', label: t('water') },
    { value: 'emergency', label: t('emergency') },
    { value: 'other', label: t('other') },
  ];

  const currencyOptions = [
    { value: 'XOF', label: 'XOF (Franc CFA)' },
    { value: 'GHS', label: 'GHS (Ghana Cedi)' },
    { value: 'NGN', label: 'NGN (Naira)' },
    { value: 'USD', label: 'USD (US Dollar)' },
    { value: 'EUR', label: 'EUR (Euro)' },
  ];

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
              <button
                className={`tab-btn ${activeTab === 'card' ? 'active' : ''}`}
                onClick={() => setActiveTab('card')}
                role="tab"
                aria-selected={activeTab === 'card'}
              >
                <FaCreditCard size={18} style={{ marginRight: '0.5rem' }} />
                {t('cardPayment')}
              </button>
            </div>

            {/* Mobile Money Tab */}
            {activeTab === 'mobile' && (
              <div className="tab-panel" role="tabpanel">
                <div className="mobile-money-section">
                  <h3>{t('mobileMoneyTitle')}</h3>
                  
                  <div className="payment-options">
                    <div className="payment-option">
                      <h4>{t('option1ManualPayment')}</h4>
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

                    <div className="divider">
                      <span>{t('or')}</span>
                    </div>

                    <div className="payment-option">
                      <h4>{t('option2AutomaticPayment')}</h4>
                      <p className="option-description">
                        {t('automaticPaymentDesc')}
                      </p>
                      
                      <form className="donation-form" onSubmit={handleMobileMoneySubmit}>
                        {mobileError && (
                          <div className="donation-form-error" role="alert">
                            {mobileError}
                          </div>
                        )}

                        <div className="form-group">
                          <label htmlFor="mobile-donorName">
                            {t('fullName')} <span className="required">{t('required')}</span>
                          </label>
                          <input
                            type="text"
                            id="mobile-donorName"
                            value={mobileMoneyForm.donorName}
                            onChange={(e) => setMobileMoneyForm({ ...mobileMoneyForm, donorName: e.target.value })}
                            required
                            placeholder={t('fullNamePlaceholder')}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="mobile-donorEmail">
                            {t('email')} <span className="required">{t('required')}</span>
                          </label>
                          <input
                            type="email"
                            id="mobile-donorEmail"
                            value={mobileMoneyForm.donorEmail}
                            onChange={(e) => setMobileMoneyForm({ ...mobileMoneyForm, donorEmail: e.target.value })}
                            required
                            placeholder={t('emailPlaceholder')}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="mobile-phoneNumber">
                            {t('phoneNumberLabel')} <span className="required">{t('required')}</span>
                          </label>
                          <input
                            type="tel"
                            id="mobile-phoneNumber"
                            value={mobileMoneyForm.phoneNumber}
                            onChange={(e) => setMobileMoneyForm({ ...mobileMoneyForm, phoneNumber: e.target.value })}
                            required
                            placeholder={t('phoneNumberPlaceholder')}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="mobile-provider">{t('provider')}</label>
                          <select
                            id="mobile-provider"
                            value={mobileMoneyForm.provider}
                            onChange={(e) => setMobileMoneyForm({ ...mobileMoneyForm, provider: e.target.value as 'orange' | 'malitel' })}
                          >
                            <option value="orange">{t('orangeMoney')}</option>
                            <option value="malitel">{t('malitel')}</option>
                          </select>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="mobile-amount">
                              {t('amountLabel')} <span className="required">{t('required')}</span>
                            </label>
                            <input
                              type="number"
                              id="mobile-amount"
                              value={mobileMoneyForm.amount}
                              onChange={(e) => setMobileMoneyForm({ ...mobileMoneyForm, amount: e.target.value })}
                              required
                              min="100"
                              step="1"
                              placeholder={t('amountPlaceholder')}
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="mobile-currency">{t('currencyLabel')}</label>
                            <select
                              id="mobile-currency"
                              value={mobileMoneyForm.currency}
                              onChange={(e) => setMobileMoneyForm({ ...mobileMoneyForm, currency: e.target.value })}
                            >
                              {currencyOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="mobile-purpose">{t('purposeOfDonation')}</label>
                          <select
                            id="mobile-purpose"
                            value={mobileMoneyForm.purpose}
                            onChange={(e) => setMobileMoneyForm({ ...mobileMoneyForm, purpose: e.target.value })}
                          >
                            {purposeOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="submit"
                          className="btn-donate"
                          disabled={isProcessingMobile}
                        >
                          {isProcessingMobile ? t('processing') : t('processPayment')}
                        </button>
                      </form>
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

                  <div className="divider">
                    <span>{t('or')}</span>
                  </div>

                  <div className="payment-option">
                    <h4>{t('onlinePayment')}</h4>
                    <p className="option-description">
                      {t('onlinePaymentDesc')}
                    </p>
                    <DonationForm defaultPaymentMethod="bank" />
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

            {/* Card Payment Tab */}
            {activeTab === 'card' && (
              <div className="tab-panel" role="tabpanel">
                <div className="card-payment-section">
                  <h3>{t('cardPaymentTitle')}</h3>
                  <p className="option-description">
                    {t('cardPaymentDesc')}
                  </p>
                  <DonationForm defaultPaymentMethod="card" />
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
                  <FaTint size={40} color="var(--primary, #FF6B00)" />
                </div>
                <h4>{t('cleanWater')}</h4>
                <p>{t('cleanWaterDesc')}</p>
              </div>
              <div className="impact-item">
                <div className="impact-icon" aria-hidden="true">
                  <FaHospital size={40} color="var(--primary, #FF6B00)" />
                </div>
                <h4>{t('healthcareTitle')}</h4>
                <p>{t('healthcareDesc')}</p>
              </div>
              <div className="impact-item">
                <div className="impact-icon" aria-hidden="true">
                  <FaBook size={40} color="var(--primary, #FF6B00)" />
                </div>
                <h4>{t('educationTitle')}</h4>
                <p>{t('educationDesc')}</p>
              </div>
              <div className="impact-item">
                <div className="impact-icon" aria-hidden="true">
                  <FaSeedling size={40} color="var(--primary, #FF6B00)" />
                </div>
                <h4>{t('foodSecurity')}</h4>
                <p>{t('foodSecurityDesc')}</p>
              </div>
            </div>
          </section>

          <section className="cta-section">
            <h2>{t('getInvolvedTitle')}</h2>
            <p>{t('getInvolvedDesc')}</p>
            <Link to="/getinvolved" className="btn-primary">
              {t('learnMore')}
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Donate;