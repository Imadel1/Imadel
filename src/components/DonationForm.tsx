import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { donationsApi } from '../services/api';
import './DonationForm.css';

interface DonationFormData {
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  amount: string;
  currency: string;
  purpose: string;
  message: string;
  isAnonymous: boolean;
  paymentMethod: string;
}

interface DonationFormProps {
  defaultPaymentMethod?: 'card' | 'momo' | 'bank';
}

// Remove the DonationResponse interface - let TypeScript infer the API return type

const DonationForm: React.FC<DonationFormProps> = ({ defaultPaymentMethod = 'card' }) => {
  const [formData, setFormData] = useState<DonationFormData>({
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    amount: '',
    currency: 'XOF',
    purpose: 'general',
    message: '',
    isAnonymous: false,
    paymentMethod: defaultPaymentMethod,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setFormData(prev => ({ ...prev, paymentMethod: defaultPaymentMethod }));
  }, [defaultPaymentMethod]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      // Validate amount
      const amountNum = parseFloat(formData.amount);
      if (isNaN(amountNum) || amountNum < 100) {
        setError('Le montant minimum est de 100 XOF');
        setIsSubmitting(false);
        return;
      }

      const methodLabel =
        formData.paymentMethod === 'card'
          ? 'Carte bancaire'
          : formData.paymentMethod === 'momo'
          ? 'Mobile Money'
          : 'Virement via passerelle';

      const combinedMessage =
        formData.message && formData.message.trim().length > 0
          ? `${formData.message} | Méthode: ${methodLabel}`
          : `Méthode de paiement choisie: ${methodLabel}`;

      // Initialize donation - let TypeScript infer the response type
      const response = await donationsApi.initialize({
        donorName: formData.donorName,
        donorEmail: formData.donorEmail,
        donorPhone: formData.donorPhone || undefined,
        amount: amountNum,
        currency: formData.currency as any,
        message: combinedMessage,
        isAnonymous: formData.isAnonymous,
        purpose: formData.purpose as any,
      });

      // Check response and redirect
      if (response.success && response.data) {
        // Type assertion to access authorization_url
        const data = response.data as any;
        if (data.authorization_url) {
          window.location.href = data.authorization_url;
        } else {
          setError(response.message || 'Erreur lors de l\'initialisation du paiement');
        }
      } else {
        setError(response.message || 'Erreur lors de l\'initialisation du paiement');
      }
    } catch (err: any) {
      console.error('Donation error:', err);
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const purposeOptions = [
    { value: 'general', label: 'Don général' },
    { value: 'education', label: 'Éducation' },
    { value: 'healthcare', label: 'Santé' },
    { value: 'water', label: 'Eau potable' },
    { value: 'emergency', label: 'Urgence' },
    { value: 'other', label: 'Autre' },
  ];

  const currencyOptions = [
    { value: 'XOF', label: 'XOF (Franc CFA)' },
    { value: 'GHS', label: 'GHS (Ghana Cedi)' },
    { value: 'NGN', label: 'NGN (Naira)' },
    { value: 'USD', label: 'USD (US Dollar)' },
    { value: 'EUR', label: 'EUR (Euro)' },
  ];

  if (success) {
    return (
      <div className="donation-form-success">
        <h3>Merci pour votre générosité!</h3>
        <p>Vous allez être redirigé vers la page de paiement...</p>
      </div>
    );
  }

  return (
    <form className="donation-form" onSubmit={handleSubmit}>
      <h3>Faire un don en ligne</h3>

      {error && (
        <div className="donation-form-error" role="alert">
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="donorName">
          Nom complet <span className="required">*</span>
        </label>
        <input
          type="text"
          id="donorName"
          name="donorName"
          value={formData.donorName}
          onChange={handleInputChange}
          required
          placeholder="Votre nom complet"
        />
      </div>

      <div className="form-group">
        <label htmlFor="donorEmail">
          Email <span className="required">*</span>
        </label>
        <input
          type="email"
          id="donorEmail"
          name="donorEmail"
          value={formData.donorEmail}
          onChange={handleInputChange}
          required
          placeholder="votre@email.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="donorPhone">Téléphone</label>
        <input
          type="tel"
          id="donorPhone"
          name="donorPhone"
          value={formData.donorPhone}
          onChange={handleInputChange}
          placeholder="+223 XX XX XX XX"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="amount">
            Montant <span className="required">*</span>
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            required
            min="100"
            step="1"
            placeholder="100"
          />
        </div>

        <div className="form-group">
          <label htmlFor="currency">Devise</label>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleInputChange}
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
        <label htmlFor="purpose">Objectif du don</label>
        <select
          id="purpose"
          name="purpose"
          value={formData.purpose}
          onChange={handleInputChange}
        >
          {purposeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {!defaultPaymentMethod && (
        <div className="form-group">
          <label>Méthode de paiement</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={formData.paymentMethod === 'card'}
                onChange={handleInputChange}
              />
              Carte bancaire
            </label>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="momo"
                checked={formData.paymentMethod === 'momo'}
                onChange={handleInputChange}
              />
              Mobile Money
            </label>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="bank"
                checked={formData.paymentMethod === 'bank'}
                onChange={handleInputChange}
              />
              Virement via passerelle
            </label>
          </div>
        </div>
      )}
      {defaultPaymentMethod && (
        <input type="hidden" name="paymentMethod" value={formData.paymentMethod} />
      )}

      <div className="form-group">
        <label htmlFor="message">Message (optionnel)</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          rows={3}
          placeholder="Un message pour l'équipe IMADEL..."
        />
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            name="isAnonymous"
            checked={formData.isAnonymous}
            onChange={handleInputChange}
          />
          <span>Faire un don anonyme</span>
        </label>
      </div>

      <button
        type="submit"
        className="btn-donate"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Traitement...' : 'Continuer vers le paiement'}
      </button>

      <p className="donation-form-note">
        <small>
          Paiement sécurisé. Vous serez redirigé vers une page de paiement sécurisée.
        </small>
      </p>
    </form>
  );
};

export default DonationForm;