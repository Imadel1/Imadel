// Internationalization (i18n) utility
// Supports language switching between French and English

import { useState, useEffect } from 'react';

export type Language = 'fr' | 'en';

const STORAGE_KEY = 'imadel_language';

// Get current language from localStorage or default to French
export const getLanguage = (): Language => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'fr') {
      return stored;
    }
  } catch {}
  return 'fr'; // Default to French
};

// Set language
export const setLanguage = (lang: Language): void => {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
    window.dispatchEvent(new CustomEvent('imadel:language:changed', { detail: { language: lang } }));
  } catch {}
};

// Subscribe to language changes
export const subscribeToLanguage = (callback: (lang: Language) => void): (() => void) => {
  const handleChange = (e: CustomEvent) => {
    callback(e.detail.language);
  };
  
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      callback(e.newValue as Language);
    }
  };

  window.addEventListener('imadel:language:changed', handleChange as EventListener);
  window.addEventListener('storage', handleStorageChange);

  return () => {
    window.removeEventListener('imadel:language:changed', handleChange as EventListener);
    window.removeEventListener('storage', handleStorageChange);
  };
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
    
    // Admin Panel
    adminPanel: 'Panneau d\'Administration',
    projects: 'Projets',
    jobs: 'Emplois',
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
    fullName: 'Nom complet',
    email: 'Email',
    phone: 'Téléphone',
    address: 'Adresse',
    resume: 'CV',
    coverLetter: 'Lettre de motivation',
    adminNotes: 'Notes administrateur',
    appliedAt: 'Candidaté le',
    
    // Settings
    theme: 'Thème',
    orangeTheme: 'Orange',
    blueTheme: 'Bleu',
    themeDescription: 'Choisissez le thème de couleur principal pour le site web. Les modifications seront appliquées immédiatement.',
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
    orangeMoney: 'Orange Money',
    malitel: 'Malitel',
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
    fullName: 'Nom complet',
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
    bankName: 'Nom de la Banque',
    accountName: 'Nom du Compte',
    accountNumber: 'Numéro de Compte',
    agency: 'Agence',
    swiftCode: 'Code Swift',
    iban: 'IBAN',
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
    learnMore: 'En Savoir Plus',
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
    projects: 'projets',
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
    projectsCompleted: 'Projets Réalisés',
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
    readMore: 'LIRE PLUS',
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
    learnMore: 'En Savoir Plus',
    
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
  en: {
    // Navigation
    home: 'Home',
    about: 'About Us',
    work: 'Our Work',
    getInvolved: 'Get Involved',
    partners: 'Partners',
    contact: 'Contact',
    donate: 'Donate',
    
    // Admin Panel
    adminPanel: 'Admin Panel',
    projects: 'Projects',
    jobs: 'Jobs',
    applications: 'Applications',
    newsletters: 'Newsletters',
    donations: 'Donations',
    offices: 'Offices',
    data: 'Data',
    settings: 'Settings',
    logout: 'Logout',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    clear: 'Clear',
    close: 'Close',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    yes: 'Yes',
    no: 'No',
    
    // Project/Job forms
    title: 'Title',
    description: 'Description',
    content: 'Content',
    images: 'Images',
    published: 'Published',
    unpublished: 'Unpublished',
    location: 'Location',
    deadline: 'Deadline',
    applyUrl: 'Apply URL',
    
    // Applications
    status: 'Status',
    pending: 'Pending',
    reviewing: 'Reviewing',
    shortlisted: 'Shortlisted',
    accepted: 'Accepted',
    rejected: 'Rejected',
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    resume: 'Resume',
    coverLetter: 'Cover Letter',
    adminNotes: 'Admin Notes',
    appliedAt: 'Applied At',
    
    // Settings
    theme: 'Theme',
    orangeTheme: 'Orange',
    blueTheme: 'Blue',
    themeDescription: 'Choose the primary color theme for the website. Changes will be applied immediately.',
    phoneNumber: 'Phone Number',
    orangeMoney: 'Orange Money',
    malitel: 'Malitel',
    bankMali: 'Bank Account - Mali',
    bankInternational: 'International Transfer',
    bankName: 'Bank Name',
    accountName: 'Account Name',
    accountNumber: 'Account Number',
    agency: 'Agency',
    swiftCode: 'Swift Code',
    iban: 'IBAN',
    
    // Donations
    donorName: 'Donor Name',
    donorEmail: 'Donor Email',
    amount: 'Amount',
    currency: 'Currency',
    purpose: 'Purpose',
    paymentStatus: 'Payment Status',
    paymentReference: 'Payment Reference',
    supportOurMission: 'Support Our Mission',
    supportOurMissionDesc: 'Your contribution helps us create lasting change in communities across Mali. Every donation makes a difference in the lives of those we serve.',
    accountNameLabel: 'Account Name',
    afterTransferSendReceipt: 'After your transfer, send your receipt to',
    withSubject: 'with subject',
    provider: 'Provider',
    phoneNumberLabel: 'Phone Number',
    fullName: 'Full Name',
    purposeOfDonation: 'Purpose of Donation',
    processPayment: 'Process Payment',
    waysToDonate: 'Ways to Donate',
    paymentMethods: 'Payment Methods',
    mobileMoney: 'Mobile Money',
    bankTransfer: 'Bank Transfer',
    cardPayment: 'Card Payment',
    mobileMoneyTitle: 'Mobile Money',
    option1ManualPayment: 'Option 1: Manual Payment',
    manualPaymentDesc: 'Make a manual transfer to one of our Mobile Money numbers, then send your receipt.',
    orangeMoney: 'Orange Money',
    malitel: 'Malitel',
    accountNameValue: 'IMADEL',
    donationSubject: 'Mobile Money Donation',
    or: 'OR',
    option2AutomaticPayment: 'Option 2: Automatic Payment',
    automaticPaymentDesc: 'Secure and instant online payment. Enter your information and you will be redirected to the secure payment page.',
    phoneNumberPlaceholder: '+223 XX XX XX XX',
    fullNamePlaceholder: 'Your full name',
    email: 'Email',
    emailPlaceholder: 'your@email.com',
    required: '*',
    amountLabel: 'Amount',
    amountPlaceholder: '100',
    currencyLabel: 'Currency',
    processing: 'Processing...',
    bankTransferTitle: 'Bank Transfer',
    bankAccountMali: 'Bank Account in Mali',
    internationalTransfer: 'International Transfer',
    bankName: 'Bank Name',
    accountName: 'Account Name',
    accountNumber: 'Account Number',
    agency: 'Agency',
    swiftCode: 'Swift Code',
    iban: 'IBAN',
    onlinePayment: 'Online Payment',
    onlinePaymentDesc: 'You can also pay online by selecting "Bank Transfer via Gateway" in the form below.',
    importantNote: 'Important Note',
    bankTransferNote1: 'Please include your name and "Donation" in the transfer description for proper tracking of your contribution.',
    bankTransferNote2: 'For donation receipts or any questions, please contact our finance team at:',
    cardPaymentTitle: 'Card Payment',
    cardPaymentDesc: 'Secure payment by bank card (Visa, Mastercard). Enter your information and you will be redirected to the secure payment page.',
    taxBenefits: 'Tax Benefits',
    taxBenefitsDesc: 'IMADEL is a registered non-governmental organization in Mali. Your donations may be tax deductible depending on your country of residence and local tax laws. Please consult a tax advisor for information specific to your situation.',
    yourDonationMakesDifference: 'Your Donation Makes a Difference',
    cleanWater: 'Clean Water',
    cleanWaterDesc: 'Help provide access to clean water for communities',
    healthcareTitle: 'Healthcare',
    healthcareDesc: 'Support health programs and maternal care initiatives',
    educationTitle: 'Education',
    educationDesc: 'Fund educational programs and school rehabilitation',
    foodSecurity: 'Food Security',
    foodSecurityDesc: 'Contribute to food security and nutrition programs',
    getInvolvedTitle: 'Get Involved',
    getInvolvedDesc: 'Beyond donations, there are many ways to support our mission.',
    learnMore: 'Learn More',
    minimumAmountError: 'The minimum amount is 100 XOF',
    paymentInitError: 'Error initializing payment',
    genericError: 'An error occurred. Please try again.',
    generalDonation: 'General Donation',
    education: 'Education',
    healthcare: 'Healthcare',
    water: 'Drinking Water',
    emergency: 'Emergency',
    other: 'Other',
    showingProjects: 'Showing',
    ofProjects: 'of',
    projects: 'projects',
    readMore: 'READ MORE',
    previousPage: 'Previous',
    nextPage: 'Next',
    getInvolvedInMission: 'Get Involved in Our Mission',
    joinUsToMakeDifference: 'Join us to make a difference in communities across Mali',
    servingLocalDevelopment: 'Serving Local Development',
    aboutImadelDesc: 'IMADEL (Malian Initiative for Local Development Support) is a non-governmental organization (NGO). It contributes to the economic and social development of the world by promoting and supporting actions aimed at improving the living conditions of populations (rural, urban and other disadvantaged groups).',
    ourMission: 'Our Mission',
    ourVision: 'Our Vision',
    ourActivities: 'Our Activities',
    ourObjectives: 'Our Objectives',
    seeOurProjects: 'See Our Projects',
    joinUsInMission: 'Join Us in Our Mission',
    participateInJourney: 'Participate in our journey to create sustainable, equitable and participatory development across Mali.',
    years: 'Years',
    projectsCompleted: 'Projects Completed',
    jobOffersAndRecruitment: 'Job Offers & Recruitment Notices',
    alwaysLookingForProfessionals: 'We are always looking for dedicated professionals to join our team. Check out our current openings below.',
    noJobsAvailable: 'No job openings available at the moment. Please check back later.',
    volunteerOpportunities: 'Volunteer Opportunities',
    volunteerDesc: 'Not looking for a full-time position? We also welcome volunteers who want to dedicate their time and skills to our mission. Whether you\'re interested in field work, administrative support, or specialized expertise, we have opportunities for you.',
    contactUsForVolunteering: 'Contact Us for Volunteering',
    partnershipOpportunities: 'Partnership Opportunities',
    partnershipDesc: 'Are you an organization looking to collaborate? IMADEL values partnerships with NGOs, government agencies, and private sector organizations that share our commitment to local development.',
    seeOurPartners: 'See Our Partners',
    becomePartner: 'Become a Partner',
    interestedInPartnership: 'Interested in a partnership with IMADEL? We\'d love to hear from you.',
    contactUsForPartnerships: 'Contact Us for Partnerships',
    discoverOpportunities: 'Discover opportunities to work with us or support ongoing health and community development projects. Join our team of passionate people making a difference across Mali.',
    discoverImpactfulProjects: 'Discover the impactful projects that IMADEL has undertaken across Mali, focusing on sustainable development, community empowerment, and humanitarian aid.',
    
    // Filters
    all: 'All',
    clearFilters: 'Clear Filters',
    
    // Project Detail
    backToHome: 'Back to Home',
    backToProjects: 'Back to Projects',
    publishedOn: 'Published',
    previous: 'Previous',
    next: 'Next',
    
    // Admin Panel specific
    addProject: 'Add Project',
    addJob: 'Add Job',
    addPartner: 'Add Partner',
    addNewsletter: 'Add Newsletter',
    addOffice: 'Add Office',
    editProject: 'Edit Project',
    editJob: 'Edit Job',
    editPartner: 'Edit Partner',
    editNewsletter: 'Edit Newsletter',
    allJobs: 'All Jobs',
    totalDonations: 'Total Donations',
    rawData: 'Raw Data',
    projectsJson: 'Projects JSON',
    jobsJson: 'Jobs JSON',
    partnersJson: 'Partners JSON',
    newslettersJson: 'Newsletters JSON',
    officesJson: 'Offices JSON',
    note: 'Note',
    changesSaved: 'Changes are saved automatically. These settings will be used on the donation page.',
    
    // Footer
    quickLinks: 'Quick Links',
    followUs: 'Follow Us',
    allRightsReserved: 'All rights reserved',
    jobOffers: 'Job Offers',
    
    // Home Page
    heroTitle: 'Small Effort',
    heroTitleHighlight: 'Big Change',
    heroTagline: 'We are ready to provide better service to make the world happy',
    becomeVolunteer: 'Become a Volunteer',
    donateNow: 'Donate Now',
    readMore: 'READ MORE',
    news: 'NEWS',
    ourImpact: 'Our Impact Over the Years',
    yearsOfService: 'Years of Service',
    livesTouched: 'Lives Touched',
    projectsCompleted: 'Projects Completed',
    communitiesServed: 'Communities Served',
    partnersCount: 'Partners',
    latestNews: 'Latest News & Projects',
    aboutSection: 'About IMADEL',
    aboutDescription: 'IMADEL (Malian Initiative for Local Development Support) is a non-governmental organization (NGO) that contributes to the economic and social development of Mali.',
    missionObjectives: 'Mission and Objectives',
    areasOfIntervention: 'Areas of Intervention',
    seeAllProjects: 'See All Projects',
    seeAllPartners: 'See All Partners',
    partnersPreview: 'Our Partners',
    ctaTitle: 'Join Our Mission',
    ctaDescription: 'Together, we can create lasting change in communities across Mali.',
    learnMore: 'Learn More',
    
    // Objectives
    objective1Title: 'Support Communities',
    objective1Desc: 'Provide technical, material and financial support to associations or human groups to improve their living conditions and self-promotion',
    objective2Title: 'Economic and Social Development',
    objective2Desc: 'Effectively contribute to the economic, social and cultural development of the Malian population, according to the reference frameworks adopted by Governments',
    objective3Title: 'Capacity Building',
    objective3Desc: 'Contribute to strengthening the capacities of development actors to accelerate the ownership and appropriation of local development',
    objective4Title: 'Civil Society',
    objective4Desc: 'Promote the strengthening of a civil society participating in the formulation and implementation of development policies',
    objective5Title: 'Governance',
    objective5Desc: 'Promote democracy, good governance and support the implementation of decentralization policy in the country',
    objective6Title: 'Partnership',
    objective6Desc: 'Strengthen partnerships by energizing the efforts of the State and partner NGOs and associations in support of communities',
    objective7Title: 'Sustainable Development',
    objective7Desc: 'Work for sustainable, equitable and participatory development',
  },
};

// Get translation for a key
export const t = (key: keyof typeof translations.fr, lang?: Language): string => {
  const currentLang = lang || getLanguage();
  return translations[currentLang][key] || key;
};

// Hook for React components
export const useTranslation = () => {
  const [language, setLanguageState] = useState<Language>(getLanguage());

  useEffect(() => {
    const unsubscribe = subscribeToLanguage((lang) => {
      setLanguageState(lang);
    });
    return unsubscribe;
  }, []);

  return {
    language,
    t: (key: keyof typeof translations.fr) => t(key, language),
    setLanguage: (lang: Language) => {
      setLanguage(lang);
      setLanguageState(lang);
    },
  };
};


