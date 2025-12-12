import React, { useState, useEffect } from 'react';
import { newslettersApi } from '../services/api';
import './NewsletterModal.css';

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewsletterModal: React.FC<NewsletterModalProps> = ({ isOpen, onClose }) => {
  const [subscriptionEmail, setSubscriptionEmail] = useState('');
  const [subscriptionPreferences, setSubscriptionPreferences] = useState<{
    jobs: boolean;
    projects: boolean;
    news: boolean;
    all: boolean;
  }>({
    jobs: false,
    projects: false,
    news: false,
    all: false,
  });
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [subscriptionError, setSubscriptionError] = useState('');

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSubscriptionEmail('');
      setSubscriptionPreferences({ jobs: false, projects: false, news: false, all: false });
      setSubscriptionStatus('idle');
      setSubscriptionError('');
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubscriptionChange = (type: 'jobs' | 'projects' | 'news' | 'all') => {
    if (type === 'all') {
      const newValue = !subscriptionPreferences.all;
      setSubscriptionPreferences({
        jobs: newValue,
        projects: newValue,
        news: newValue,
        all: newValue,
      });
    } else {
      const newPreferences = {
        ...subscriptionPreferences,
        [type]: !subscriptionPreferences[type],
      };
      // If all individual options are checked, check "all" too
      newPreferences.all = newPreferences.jobs && newPreferences.projects && newPreferences.news;
      setSubscriptionPreferences(newPreferences);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subscriptionEmail.trim()) {
      setSubscriptionError('L\'email est requis');
      setSubscriptionStatus('error');
      return;
    }

    if (!validateEmail(subscriptionEmail)) {
      setSubscriptionError('Veuillez entrer une adresse email valide');
      setSubscriptionStatus('error');
      return;
    }

    if (!subscriptionPreferences.jobs && !subscriptionPreferences.projects && !subscriptionPreferences.news && !subscriptionPreferences.all) {
      setSubscriptionError('Veuillez sélectionner au moins un type de mise à jour');
      setSubscriptionStatus('error');
      return;
    }

    setIsSubscribing(true);
    setSubscriptionStatus('idle');
    setSubscriptionError('');

    try {
      await newslettersApi.subscribe(subscriptionEmail);
      
      setSubscriptionStatus('success');
      setSubscriptionEmail('');
      setSubscriptionPreferences({ jobs: false, projects: false, news: false, all: false });
      
      // Close modal after 2 seconds on success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      setSubscriptionStatus('error');
      setSubscriptionError(error.message || 'Une erreur s\'est produite lors de l\'abonnement. Veuillez réessayer.');
    } finally {
      setIsSubscribing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="newsletter-modal-overlay" onClick={onClose}>
      <div className="newsletter-modal-content" onClick={(e) => e.stopPropagation()}>
        <button 
          className="newsletter-modal-close" 
          onClick={onClose}
          aria-label="Fermer"
        >
          ×
        </button>

        <div className="newsletter-modal-header">
          <h2>Abonnez-vous à notre newsletter</h2>
          <p>Recevez les dernières actualités, projets et offres d'emploi directement dans votre boîte de réception.</p>
        </div>

        <form className="newsletter-modal-form" onSubmit={handleSubscribe} noValidate>
          <div className="form-group">
            <label htmlFor="modal-subscription-email">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="modal-subscription-email"
              value={subscriptionEmail}
              onChange={(e) => {
                setSubscriptionEmail(e.target.value);
                if (subscriptionError) {
                  setSubscriptionError('');
                  setSubscriptionStatus('idle');
                }
              }}
              placeholder="votre.email@exemple.com"
              required
              disabled={isSubscribing}
              aria-invalid={subscriptionError ? 'true' : 'false'}
            />
          </div>

          <div className="subscription-preferences">
            <label className="preferences-label">
              Je souhaite recevoir des mises à jour sur :
            </label>
            <div className="preferences-checkboxes">
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={subscriptionPreferences.all}
                  onChange={() => handleSubscriptionChange('all')}
                  disabled={isSubscribing}
                />
                <span>Tout</span>
              </label>
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={subscriptionPreferences.jobs}
                  onChange={() => handleSubscriptionChange('jobs')}
                  disabled={isSubscribing}
                />
                <span>Offres d'emploi</span>
              </label>
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={subscriptionPreferences.projects}
                  onChange={() => handleSubscriptionChange('projects')}
                  disabled={isSubscribing}
                />
                <span>Projets</span>
              </label>
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={subscriptionPreferences.news}
                  onChange={() => handleSubscriptionChange('news')}
                  disabled={isSubscribing}
                />
                <span>Actualités</span>
              </label>
            </div>
          </div>

          {subscriptionStatus === 'success' && (
            <div className="success-message" role="alert">
              ✓ Merci pour votre abonnement ! Vous recevrez bientôt nos mises à jour.
            </div>
          )}

          {subscriptionStatus === 'error' && subscriptionError && (
            <div className="error-message" role="alert">
              {subscriptionError}
            </div>
          )}

          <div className="modal-form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isSubscribing}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-subscribe"
              disabled={isSubscribing}
            >
              {isSubscribing ? 'Abonnement...' : 'S\'abonner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewsletterModal;

