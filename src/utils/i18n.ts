// Internationalization (i18n) utility
// French-only language support

import { useState } from 'react';

export type Language = 'fr';

// Language is fixed to French
const FIXED_LANGUAGE: Language = 'fr';

export const getLanguage = (): Language => FIXED_LANGUAGE;
export const setLanguage = (_lang: Language): void => undefined;
export const subscribeToLanguage = (callback: (lang: Language) => void): (() => void) => {
  callback(FIXED_LANGUAGE);
  return () => undefined;
};

// Translation keys
export const translations = {
  fr: {
    // Navigation
    home: 'Accueil',
    about: 'À Propos',
    work: 'Nos Projets',
    getInvolved: "S'Impliquer",
    partners: 'Partenaires',
    contact: 'Contact',
    donate: 'Faire un Don',
    learnMore: 'En Savoir Plus',
    
    // Admin Panel
    adminPanel: 'Panneau d\'Administration',
    projects: 'Projets',
    jobs: 'Opportunités',
    applications: 'Candidatures',
    newsletters: 'Actualités',
    donations: 'Dons',
    offices: 'Bureaux',
    data: 'Données',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    
    // Common
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    search: 'Rechercher',
    filter: 'Filtrer',
    clear: 'Effacer',
    close: 'Fermer',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    yes: 'Oui',
    no: 'Non',
    
    // Project/Job forms
    title: 'Titre',
    description: 'Description',
    content: 'Contenu',
    images: 'Images',
    published: 'Publié',
    unpublished: 'Non publié',
    location: 'Emplacement',
    deadline: 'Date limite',
    applyUrl: 'URL de candidature',
    
    // Applications
    status: 'Statut',
    pending: 'En attente',
    reviewing: 'En cours d\'examen',
    shortlisted: 'Présélectionné',
    accepted: 'Accepté',
    rejected: 'Rejeté',
    interviewed: 'Entretien',
    allStatuses: 'Tous les statuts',
    fullName: 'Nom complet',
    phone: 'Téléphone',
    address: 'Adresse',
    resume: 'CV',
    coverLetter: 'Lettre de motivation',
    adminNotes: 'Notes administrateur',
    appliedAt: 'Candidaté le',
    
    // Settings
    theme: 'Thème',
    blueTheme: 'Bleu',
    themeDescription: 'Le thème de couleur principal du site web est le bleu.',
    phoneNumber: 'Numéro de téléphone',
    orangeMoney: 'Orange Money',
    malitel: 'Malitel',
    bankMali: 'Compte Bancaire au Mali',
    bankInternational: 'Virement International',
    bankName: 'Nom de la Banque',
    accountName: 'Nom du Compte',
    accountNumber: 'Numéro de Compte',
    agency: 'Agence',
    swiftCode: 'Code Swift',
    iban: 'IBAN',
    
    // Donations
    donorName: 'Nom du donateur',
    donorEmail: 'Email du donateur',
    amount: 'Montant',
    currency: 'Devise',
    purpose: 'Objectif',
    paymentStatus: 'Statut de paiement',
    paymentReference: 'Référence de paiement',
    supportOurMission: 'Soutenez Notre Mission',
    supportOurMissionDesc: 'Votre contribution nous aide à créer un changement durable dans les communautés à travers le Mali. Chaque don fait une différence dans la vie de ceux que nous servons.',
    waysToDonate: 'Façons de Faire un Don',
    paymentMethods: 'Méthodes de paiement',
    mobileMoney: 'Mobile Money',
    bankTransfer: 'Virement Bancaire',
    cardPayment: 'Carte Bancaire',
    mobileMoneyTitle: 'Mobile Money',
    option1ManualPayment: 'Option 1: Paiement Manuel',
    manualPaymentDesc: 'Effectuez un virement manuel vers l\'un de nos numéros Mobile Money, puis envoyez votre reçu.',
    accountNameLabel: 'Nom du compte',
    accountNameValue: 'IMADEL',
    afterTransferSendReceipt: 'Après votre virement, envoyez votre reçu à',
    withSubject: 'avec l\'objet',
    donationSubject: 'Don Mobile Money',
    or: 'OU',
    option2AutomaticPayment: 'Option 2: Paiement Automatique',
    automaticPaymentDesc: 'Paiement sécurisé et instantané en ligne. Entrez vos informations et vous serez redirigé vers la page de paiement sécurisée.',
    provider: 'Opérateur',
    phoneNumberLabel: 'Numéro de téléphone',
    phoneNumberPlaceholder: '+223 XX XX XX XX',
    fullNamePlaceholder: 'Votre nom complet',
    email: 'Email',
    emailPlaceholder: 'votre@email.com',
    required: '*',
    amountLabel: 'Montant',
    amountPlaceholder: '100',
    currencyLabel: 'Devise',
    purposeOfDonation: 'Objectif du don',
    processing: 'Traitement...',
    processPayment: 'Traiter le Paiement',
    bankTransferTitle: 'Virement Bancaire',
    bankAccountMali: 'Compte Bancaire au Mali',
    internationalTransfer: 'Virement International',
    onlinePayment: 'Paiement en Ligne',
    onlinePaymentDesc: 'Vous pouvez aussi payer en ligne en sélectionnant "Virement via passerelle" dans le formulaire ci-dessous.',
    importantNote: 'Note Importante',
    bankTransferNote1: 'Veuillez inclure votre nom et "Don" dans la description du virement pour un suivi correct de votre contribution.',
    bankTransferNote2: 'Pour les reçus de dons ou toute question, veuillez contacter notre équipe financière à :',
    cardPaymentTitle: 'Carte Bancaire',
    cardPaymentDesc: 'Paiement sécurisé par carte bancaire (Visa, Mastercard). Entrez vos informations et vous serez redirigé vers la page de paiement sécurisée.',
    taxBenefits: 'Avantages Fiscaux',
    taxBenefitsDesc: 'IMADEL est une organisation non gouvernementale enregistrée au Mali. Vos dons peuvent être déductibles des impôts selon votre pays de résidence et les lois fiscales locales. Veuillez consulter un conseiller fiscal pour des informations spécifiques à votre situation.',
    yourDonationMakesDifference: 'Votre Don Fait la Différence',
    cleanWater: 'Eau Propre',
    cleanWaterDesc: 'Aidez à fournir un accès à l\'eau potable pour les communautés',
    healthcareTitle: 'Soins de Santé',
    healthcareDesc: 'Soutenez les programmes de santé et les initiatives de soins maternels',
    educationTitle: 'Éducation',
    educationDesc: 'Financez des programmes éducatifs et la réhabilitation d\'écoles',
    foodSecurity: 'Sécurité Alimentaire',
    foodSecurityDesc: 'Contribuez aux programmes de sécurité alimentaire et de nutrition',
    getInvolvedTitle: 'Impliquez-vous',
    getInvolvedDesc: 'Au-delà des dons, il existe de nombreuses façons de soutenir notre mission.',
    minimumAmountError: 'Le montant minimum est de 100 XOF',
    paymentInitError: 'Erreur lors de l\'initialisation du paiement',
    genericError: 'Une erreur est survenue. Veuillez réessayer.',
    generalDonation: 'Don général',
    education: 'Éducation',
    healthcare: 'Santé',
    water: 'Eau potable',
    emergency: 'Urgence',
    other: 'Autre',
    showingProjects: 'Affichage de',
    ofProjects: 'sur',
    readMore: 'LIRE PLUS',
    previousPage: 'Précédent',
    nextPage: 'Suivant',
    getInvolvedInMission: 'Impliquez-vous dans notre mission',
    joinUsToMakeDifference: 'Rejoignez-nous pour faire la différence dans les communautés à travers le Mali',
    servingLocalDevelopment: 'Au service du développement local',
    aboutImadelDesc: 'IMADEL (Initiative Malienne d\'Appui au Développement Local) est une organisation non gouvernementale (ONG). Elle contribue au développement économique et social du monde en favorisant et en soutenant des actions visant à améliorer les conditions de vie des populations (rurales, urbaines et autres groupes défavorisés).',
    ourMission: 'Notre Mission',
    ourVision: 'Notre Vision',
    ourActivities: 'Nos Activités',
    ourObjectives: 'Nos Objectifs',
    seeOurProjects: 'Voir Nos Projets',
    joinUsInMission: 'Rejoignez-nous dans notre mission',
    participateInJourney: 'Participez à notre voyage pour créer un développement durable, équitable et participatif à travers le Mali.',
    years: 'Années',
    jobOffersAndRecruitment: 'Offres d\'Emploi & Avis de Recrutement',
    alwaysLookingForProfessionals: 'Nous sommes toujours à la recherche de professionnels dévoués pour rejoindre notre équipe. Consultez nos offres actuelles ci-dessous.',
    noJobsAvailable: 'Aucune offre d\'emploi disponible pour le moment. Veuillez vérifier plus tard.',
    volunteerOpportunities: 'Opportunités de Bénévolat',
    volunteerDesc: 'Vous ne cherchez pas un poste à temps plein ? Nous accueillons également des bénévoles qui souhaitent consacrer leur temps et leurs compétences à notre mission. Que vous soyez intéressé par le travail de terrain, le soutien administratif ou une expertise spécialisée, nous avons des opportunités pour vous.',
    contactUsForVolunteering: 'Contactez-nous pour le Bénévolat',
    partnershipOpportunities: 'Opportunités de Partenariat',
    partnershipDesc: 'Vous êtes une organisation cherchant à collaborer ? IMADEL valorise les partenariats avec les ONG, les agences gouvernementales et les organisations du secteur privé qui partagent notre engagement envers le développement local.',
    seeOurPartners: 'Voir Nos Partenaires',
    becomePartner: 'Devenez Partenaire',
    interestedInPartnership: 'Intéressé par un partenariat avec IMADEL ? Nous aimerions avoir de vos nouvelles.',
    contactUsForPartnerships: 'Contactez-nous pour les Partenariats',
    discoverOpportunities: 'Découvrez les opportunités de travailler avec nous ou de soutenir les projets de santé et de développement communautaire en cours. Rejoignez notre équipe de personnes passionnées qui font la différence à travers le Mali.',
    discoverImpactfulProjects: 'Découvrez les projets impactants qu\'IMADEL a entrepris à travers le Mali, se concentrant sur le développement durable, l\'autonomisation des communautés et l\'aide humanitaire.',
    
    // Job Detail
    jobNotFoundTitle: 'Offre introuvable',
    jobNotFoundDesc: 'L\'offre que vous recherchez n\'existe plus ou a été retirée.',
    viewAllJobOpenings: 'Voir toutes les offres',
    backToJobs: 'Retour aux offres',
    jobDescription: 'Description du poste',
    requirements: 'Exigences',
    responsibilities: 'Responsabilités',
    applyForPosition: 'Postuler à ce poste',
    deadlinePassedTitle: 'Date limite dépassée',
    deadlinePassedDescPrefix: 'La date limite de candidature pour ce poste était',
    deadlinePassedDescSuffix: 'Les candidatures ne sont plus acceptées pour ce poste.',
    deadlinePassedAlert: 'Désolé, la date limite de candidature pour ce poste est dépassée.',
    emailAddress: 'Adresse e-mail',
    addressLabel: 'Adresse',
    resumeLabel: 'CV',
    resumeHelp: 'Document PDF ou Word, 5 Mo max',
    coverLetterPlaceholder: 'Expliquez pourquoi ce poste vous intéresse...',
    applicationSubmittedTitle: 'Candidature envoyée',
    applicationSubmittedMessagePrefix: 'Merci pour votre intérêt. Un email de confirmation a été envoyé à',
    redirectingToJobs: 'Redirection vers les offres...',
    applicationError: 'Une erreur est survenue lors de l’envoi de votre candidature. Veuillez réessayer.',
    submittingApplication: 'Envoi de la candidature',
    submitJobApplication: 'Soumettre la candidature',
    submitting: 'Envoi...',
    submitApplication: 'Envoyer la candidature',
    
    // Filters
    all: 'Tous',
    clearFilters: 'Effacer les filtres',
    
    // Project Detail
    backToHome: 'Retour à l\'accueil',
    backToProjects: 'Retour aux projets',
    publishedOn: 'Publié le',
    previous: 'Précédent',
    next: 'Suivant',
    
    // Admin Panel specific
    addProject: 'Ajouter un projet',
    addJob: 'Ajouter un emploi',
    addPartner: 'Ajouter un partenaire',
    addNewsletter: 'Ajouter une actualité',
    addOffice: 'Ajouter un bureau',
    editProject: 'Modifier le projet',
    editJob: 'Modifier l\'emploi',
    editPartner: 'Modifier le partenaire',
    editNewsletter: 'Modifier l\'actualité',
    allJobs: 'Tous les emplois',
    totalDonations: 'Total des dons',
    rawData: 'Données brutes',
    projectsJson: 'Projets JSON',
    jobsJson: 'Emplois JSON',
    partnersJson: 'Partenaires JSON',
    newslettersJson: 'Actualités JSON',
    officesJson: 'Bureaux JSON',
    note: 'Note',
    changesSaved: 'Les modifications sont enregistrées automatiquement. Ces paramètres seront utilisés sur la page de don.',
    
    // Footer
    quickLinks: 'Liens Rapides',
    followUs: 'Suivez-nous',
    allRightsReserved: 'Tous droits réservés',
    jobOffers: 'Offres d\'Emploi',
    
    // Home Page
    heroTitle: 'Petit Effort',
    heroTitleHighlight: 'Grand Changement',
    heroTagline: 'Nous sommes prêts à fournir un meilleur service pour rendre le monde heureux',
    becomeVolunteer: 'Devenir Bénévole',
    donateNow: 'Faire un Don Maintenant',
    news: 'ACTUALITÉ',
    ourImpact: 'Notre Impact au Fil des Ans',
    yearsOfService: 'Années de Service',
    livesTouched: 'Vies Touchées',
    projectsCompleted: 'Projets Réalisés',
    communitiesServed: 'Communautés Servies',
    partnersCount: 'Partenaires',
    latestNews: 'Dernières Actualités et Projets',
    aboutSection: 'À Propos d\'IMADEL',
    aboutDescription: 'IMADEL (Initiative Malienne d\'Appui au Développement Local) est une organisation non gouvernementale (ONG) qui contribue au développement économique et social du Mali.',
    missionObjectives: 'Mission et Objectifs',
    areasOfIntervention: 'Domaines d\'Intervention',
    seeAllProjects: 'Voir Tous les Projets',
    seeAllPartners: 'Voir Tous les Partenaires',
    partnersPreview: 'Nos Partenaires',
    ctaTitle: 'Rejoignez Notre Mission',
    ctaDescription: 'Ensemble, nous pouvons créer un changement durable dans les communautés à travers le Mali.',
    
    // Objectives
    objective1Title: 'Soutenir les Communautés',
    objective1Desc: 'Apporter un appui technique, matériel et financier aux associations ou groupements humains pour l\'amélioration de leurs conditions de vie et leur auto-promotion',
    objective2Title: 'Développement Économique et Social',
    objective2Desc: 'Contribuer efficacement au développement économique, social et culturel de la population malienne, selon les cadres de référence adoptés par les Gouvernements',
    objective3Title: 'Renforcement des Capacités',
    objective3Desc: 'Contribuer au renforcement des capacités des acteurs de développement en vue d\'accélérer la prise en main et l\'appropriation du développement local',
    objective4Title: 'Société Civile',
    objective4Desc: 'Favoriser le renforcement d\'une société civile participant à la formulation et à la mise en œuvre des politiques de développement',
    objective5Title: 'Gouvernance',
    objective5Desc: 'Promouvoir la démocratie, la bonne gouvernance et accompagner la mise en œuvre de la politique de décentralisation dans le pays',
    objective6Title: 'Partenariat',
    objective6Desc: 'Renforcer le partenariat en dynamisant les efforts de l\'État et des ONG et associations partenaires en appui aux communautés',
    objective7Title: 'Développement Durable',
    objective7Desc: 'Œuvrer pour un développement durable, équitable et participatif',
  },
};

// Get translation for a key (French only)
type TranslationKeys = keyof typeof translations.fr;

export const t = (key: TranslationKeys): string => {
  const value = translations.fr[key];
  if (value === undefined && typeof import.meta !== 'undefined' && import.meta.env?.MODE !== 'production') {
    console.warn(`Missing translation for key "${key}"`);
  }
  return value ?? key;
};

// Hook for React components
export const useTranslation = () => {
  const [language] = useState<Language>(getLanguage());
  return {
    language,
    t: (key: TranslationKeys) => t(key),
    setLanguage: (_lang: Language) => undefined,
  };
};