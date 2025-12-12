import React, { useState, useEffect, type FormEvent } from 'react';
import { getSettings, subscribeToSettings } from '../utils/settings';
import NewsletterModal from '../components/NewsletterModal';
import './Contact.css';

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });

  const [settings, setSettings] = useState(getSettings());
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false);

  // Load settings and subscribe to updates
  useEffect(() => {
    setSettings(getSettings());
    const unsubscribe = subscribeToSettings((newSettings) => {
      setSettings(newSettings);
    });
    return unsubscribe;
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Veuillez entrer une adresse email valide';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Le message est requis';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Le message doit contenir au moins 10 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // TODO: Integrate with backend/email service (Firebase, Formspree, or API endpoint)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubscriptionChange = (preference: 'jobs' | 'projects' | 'news' | 'all') => {
    if (preference === 'all') {
      const newAllValue = !subscriptionPreferences.all;
      setSubscriptionPreferences({
        jobs: newAllValue,
        projects: newAllValue,
        news: newAllValue,
        all: newAllValue,
      });
    } else {
      const newPreferences = {
        ...subscriptionPreferences,
        [preference]: !subscriptionPreferences[preference],
      };
      // If all individual checkboxes are checked, check "all" too
      if (newPreferences.jobs && newPreferences.projects && newPreferences.news) {
        newPreferences.all = true;
      } else {
        newPreferences.all = false;
      }
      setSubscriptionPreferences(newPreferences);
    }
  };

  const handleSubscribe = async (e: FormEvent<HTMLFormElement>) => {
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
      // Subscribe to newsletter via API
      await newslettersApi.subscribe(subscriptionEmail);
      
      setSubscriptionStatus('success');
      setSubscriptionEmail('');
      setSubscriptionPreferences({ jobs: false, projects: false, news: false, all: false });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubscriptionStatus('idle');
      }, 5000);
    } catch (error: any) {
      setSubscriptionStatus('error');
      setSubscriptionError(error.message || 'Une erreur s\'est produite lors de l\'abonnement. Veuillez réessayer.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-content">
        <div className="contact-info">
          <h1>Contactez-nous</h1>
          <p className="contact-intro">
            Entrez en contact avec IMADEL. Nous serions ravis de vous entendre et de répondre à toutes vos questions.
          </p>

          <div className="contact-details">
            <h2>Siège au Mali</h2>
            <address>
              <p>
                <strong>Adresse:</strong><br />
                Bamako-Hamdallaye ACI 2000<br />
                Côté ouest cimetière de Lafiabougou<br />
                Bamako, Mali
              </p>
              <p>
                <strong>Téléphone:</strong><br />
                <a href={`tel:${settings.phoneNumber.replace(/\s/g, '')}`}>{settings.phoneNumber}</a><br />
                <a href={`tel:${settings.orangeMoney.replace(/\s/g, '')}`}>{settings.orangeMoney}</a><br />
                <a href={`tel:${settings.malitel.replace(/\s/g, '')}`}>{settings.malitel}</a>
              </p>
              <p>
                <strong>Email:</strong><br />
                <a href="mailto:imadel@imadel.net">imadel@imadel.net</a><br />
                <a href="mailto:imadel@imadel-mali.org">imadel@imadel-mali.org</a>
              </p>
            </address>
          </div>

          <div className="country-offices">
            <h2>Bureaux Régionaux</h2>
            <ul>
              <li>
                <strong>Mauritanie:</strong>{' '}
                <span className="country-placeholder">Adresse à venir</span>
              </li>
              <li>
                <strong>Sénégal:</strong>{' '}
                <span className="country-placeholder">Adresse à venir</span>
              </li>
              <li>
                <strong>Cameroun:</strong>{' '}
                <span className="country-placeholder">Adresse à venir</span>
              </li>
            </ul>
            {/* TODO: Fetch and render country data dynamically from backend (Firestore or API) */}
          </div>
        </div>

        <div className="contact-form-container">
          <h2>Envoyez-nous un Message</h2>
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="name">
                Nom & Prénom <span className="required" aria-label="requis">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Votre nom et prénom"
                required
                aria-invalid={errors.name ? 'true' : 'false'}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <span id="name-error" className="error-message" role="alert">
                  {errors.name}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email <span className="required" aria-label="requis">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="votre.email@exemple.com"
                required
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <span id="email-error" className="error-message" role="alert">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="message">
                Message <span className="required" aria-label="requis">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Votre message..."
                rows={6}
                required
                aria-invalid={errors.message ? 'true' : 'false'}
                aria-describedby={errors.message ? 'message-error' : undefined}
              />
              {errors.message && (
                <span id="message-error" className="error-message" role="alert">
                  {errors.message}
                </span>
              )}
            </div>

            {submitStatus === 'success' && (
              <div className="success-message" role="alert">
                Merci pour votre message ! Nous vous répondrons bientôt.
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="error-message" role="alert">
                Une erreur s'est produite lors de l'envoi de votre message. Veuillez réessayer ou nous contacter directement.
              </div>
            )}

            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
              aria-label={isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
            >
              {isSubmitting ? 'Envoi...' : 'Envoyer le Message'}
            </button>
          </form>

          {/* Newsletter Subscription Section */}
          <div className="newsletter-subscription">
            <h3>Restez informé</h3>
            <p className="newsletter-description">
              Abonnez-vous à notre newsletter pour recevoir les dernières actualités, projets et offres d'emploi.
            </p>
            <button
              className="subscribe-button"
              onClick={() => setIsNewsletterModalOpen(true)}
              aria-label="S'abonner à la newsletter"
            >
              S'abonner à la newsletter
            </button>
          </div>
        </div>
      </div>

      <div className="map-container">
        <h2>Nous Trouver</h2>
        {/* TODO: Replace static map with data from backend (lat/long + project info) */}
        <iframe
          title="IMADEL Office Location in Bamako, Mali"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3859.5!2d-8.0!3d12.65!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDM5JzAwLjAiTiA4wrAwMCcwMC4wIlc!5e0!3m2!1sen!2sus!4v1234567890"
          width="100%"
          height="100%"
          style={{ border: 0, minHeight: '400px' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          aria-label="Map showing IMADEL office location in Bamako, Mali"
        />
      </div>
      
      <NewsletterModal 
        isOpen={isNewsletterModalOpen} 
        onClose={() => setIsNewsletterModalOpen(false)} 
      />
    </div>
  );
};

export default Contact;
