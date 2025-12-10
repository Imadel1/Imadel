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
        setMobileError('Le montant minimum est de 100 XOF');
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
        setMobileError(response.message || 'Erreur lors de l\'initialisation du paiement');
      }
    } catch (err: any) {
      console.error('Mobile Money error:', err);
      setMobileError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
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
                  <h3>Mobile Money</h3>
                  
                  <div className="payment-options">
                    <div className="payment-option">
                      <h4>Option 1: Paiement Manuel</h4>
                      <p className="option-description">
                        Effectuez un virement manuel vers l'un de nos numéros Mobile Money, puis envoyez votre reçu.
                      </p>
                      
                      <div className="mobile-money-numbers">
                        <div className="mobile-number-card">
                          <h5>Orange Money</h5>
                          <div className="number-display">
                            <strong>{settings.orangeMoney}</strong>
                          </div>
                          <p className="account-name">Nom du compte: IMADEL</p>
                        </div>
                        
                        <div className="mobile-number-card">
                          <h5>Malitel</h5>
                          <div className="number-display">
                            <strong>{settings.malitel}</strong>
                          </div>
                          <p className="account-name">Nom du compte: IMADEL</p>
                        </div>
                      </div>

                      <div className="donation-note-inline">
                        <p>
                          Après votre virement, envoyez votre reçu à <a href="mailto:imadel@imadel.net">imadel@imadel.net</a> avec l'objet "Don Mobile Money".
                        </p>
                      </div>
                    </div>

                    <div className="divider">
                      <span>OU</span>
                    </div>

                    <div className="payment-option">
                      <h4>Option 2: Paiement Automatique</h4>
                      <p className="option-description">
                        Paiement sécurisé et instantané en ligne. Entrez vos informations et vous serez redirigé vers la page de paiement sécurisée.
                      </p>
                      
                      <form className="donation-form" onSubmit={handleMobileMoneySubmit}>
                        {mobileError && (
                          <div className="donation-form-error" role="alert">
                            {mobileError}
                          </div>
                        )}

                        <div className="form-group">
                          <label htmlFor="mobile-donorName">
                            Nom complet <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            id="mobile-donorName"
                            value={mobileMoneyForm.donorName}
                            onChange={(e) => setMobileMoneyForm({ ...mobileMoneyForm, donorName: e.target.value })}
                            required
                            placeholder="Votre nom complet"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="mobile-donorEmail">
                            Email <span className="required">*</span>
                          </label>
                          <input
                            type="email"
                            id="mobile-donorEmail"
                            value={mobileMoneyForm.donorEmail}
                            onChange={(e) => setMobileMoneyForm({ ...mobileMoneyForm, donorEmail: e.target.value })}
                            required
                            placeholder="votre@email.com"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="mobile-phoneNumber">
                            Numéro de téléphone <span className="required">*</span>
                          </label>
                          <input
                            type="tel"
                            id="mobile-phoneNumber"
                            value={mobileMoneyForm.phoneNumber}
                            onChange={(e) => setMobileMoneyForm({ ...mobileMoneyForm, phoneNumber: e.target.value })}
                            required
                            placeholder="+223 XX XX XX XX"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="mobile-provider">Opérateur</label>
                          <select
                            id="mobile-provider"
                            value={mobileMoneyForm.provider}
                            onChange={(e) => setMobileMoneyForm({ ...mobileMoneyForm, provider: e.target.value as 'orange' | 'malitel' })}
                          >
                            <option value="orange">Orange Money</option>
                            <option value="malitel">Malitel</option>
                          </select>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="mobile-amount">
                              Montant <span className="required">*</span>
                            </label>
                            <input
                              type="number"
                              id="mobile-amount"
                              value={mobileMoneyForm.amount}
                              onChange={(e) => setMobileMoneyForm({ ...mobileMoneyForm, amount: e.target.value })}
                              required
                              min="100"
                              step="1"
                              placeholder="100"
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="mobile-currency">Devise</label>
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
                          <label htmlFor="mobile-purpose">Objectif du don</label>
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
                          {isProcessingMobile ? 'Traitement...' : 'Traiter le Paiement'}
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
                  <h3>Virement Bancaire</h3>
                  
              <div className="bank-details">
                <div className="bank-info">
                      <h4>Compte Bancaire au Mali</h4>
                  <dl>
                    <div className="bank-detail-item">
                          <dt>Nom de la Banque:</dt>
                      <dd>{settings.bankMali.bankName}</dd>
                    </div>
                    <div className="bank-detail-item">
                          <dt>Nom du Compte:</dt>
                          <dd>{settings.bankMali.accountName}</dd>
                    </div>
                    <div className="bank-detail-item">
                          <dt>Numéro de Compte:</dt>
                      <dd>{settings.bankMali.accountNumber}</dd>
                    </div>
                    <div className="bank-detail-item">
                          <dt>Agence:</dt>
                      <dd>{settings.bankMali.agency}</dd>
                    </div>
                    <div className="bank-detail-item">
                          <dt>Code Swift:</dt>
                      <dd>{settings.bankMali.swiftCode}</dd>
                    </div>
                  </dl>
                </div>

                <div className="bank-info">
                      <h4>Virement International</h4>
                  <dl>
                    <div className="bank-detail-item">
                          <dt>Nom de la Banque:</dt>
                      <dd>{settings.bankInternational.bankName}</dd>
                    </div>
                    <div className="bank-detail-item">
                          <dt>Nom du Compte:</dt>
                      <dd>{settings.bankInternational.accountName}</dd>
                    </div>
                    <div className="bank-detail-item">
                          <dt>Numéro de Compte:</dt>
                      <dd>{settings.bankInternational.accountNumber}</dd>
                    </div>
                    <div className="bank-detail-item">
                      <dt>IBAN:</dt>
                      <dd>{settings.bankInternational.iban}</dd>
                    </div>
                    <div className="bank-detail-item">
                          <dt>Code Swift:</dt>
                      <dd>{settings.bankInternational.swiftCode}</dd>
                    </div>
                  </dl>
                </div>
              </div>

                  <div className="divider">
                    <span>OU</span>
                  </div>

                  <div className="payment-option">
                    <h4>Paiement en Ligne</h4>
                    <p className="option-description">
                      Vous pouvez aussi payer en ligne en sélectionnant "Virement via passerelle" dans le formulaire ci-dessous.
                    </p>
                    <DonationForm defaultPaymentMethod="bank" />
            </div>

            <div className="donation-note" role="note" aria-labelledby="donation-note-heading">
                    <h3 id="donation-note-heading">Note Importante</h3>
              <p>
                      Veuillez inclure votre nom et "Don" dans la description du virement pour un suivi correct de votre contribution.
              </p>
              <p>
                      Pour les reçus de dons ou toute question, veuillez contacter notre équipe financière à :
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
                  <h3>Carte Bancaire</h3>
                  <p className="option-description">
                    Paiement sécurisé par carte bancaire (Visa, Mastercard). Entrez vos informations et vous serez redirigé vers la page de paiement sécurisée.
                  </p>
                  <DonationForm defaultPaymentMethod="card" />
                </div>
              </div>
            )}

            <div className="tax-info" role="note" aria-labelledby="tax-info-heading">
              <h3 id="tax-info-heading">Avantages Fiscaux</h3>
              <p>
                IMADEL est une organisation non gouvernementale enregistrée au Mali. Vos dons peuvent être déductibles des impôts
                selon votre pays de résidence et les lois fiscales locales. Veuillez consulter un conseiller fiscal pour
                des informations spécifiques à votre situation.
              </p>
            </div>
          </section>

          <section className="impact-section" aria-labelledby="impact-heading">
            <h2 id="impact-heading">Votre Don Fait la Différence</h2>
            <div className="impact-grid">
              <div className="impact-item">
                <div className="impact-icon" aria-hidden="true">
                  <FaTint size={40} color="var(--primary, #FF6B00)" />
                </div>
                <h4>Eau Propre</h4>
                <p>Aidez à fournir un accès à l'eau potable pour les communautés</p>
              </div>
              <div className="impact-item">
                <div className="impact-icon" aria-hidden="true">
                  <FaHospital size={40} color="var(--primary, #FF6B00)" />
                </div>
                <h4>Soins de Santé</h4>
                <p>Soutenez les programmes de santé et les initiatives de soins maternels</p>
              </div>
              <div className="impact-item">
                <div className="impact-icon" aria-hidden="true">
                  <FaBook size={40} color="var(--primary, #FF6B00)" />
                </div>
                <h4>Éducation</h4>
                <p>Financez des programmes éducatifs et la réhabilitation d'écoles</p>
              </div>
              <div className="impact-item">
                <div className="impact-icon" aria-hidden="true">
                  <FaSeedling size={40} color="var(--primary, #FF6B00)" />
                </div>
                <h4>Sécurité Alimentaire</h4>
                <p>Contribuez aux programmes de sécurité alimentaire et de nutrition</p>
              </div>
            </div>
          </section>

          <section className="cta-section">
            <h2>Impliquez-vous</h2>
            <p>Au-delà des dons, il existe de nombreuses façons de soutenir notre mission.</p>
            <Link to="/getinvolved" className="btn-primary">
              En Savoir Plus
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Donate;