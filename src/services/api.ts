/**
 * Firebase-based data access layer for IMADEL
 *
 * This file replaces the old REST API client and provides simple
 * helpers that read/write from Firestore using the Firebase app
 * configured in src/firebase.ts.
 */

import { firebaseApp } from '../firebase';
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  setDoc,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);

// Generic helpers
const listCollection = async (col: string, q?: ReturnType<typeof query> | undefined) => {
  const ref = collection(db, col);
  const snap = await getDocs(q ?? ref);
  return snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    return { id: d.id, ...data };
  });
};

const getDocument = async (col: string, id: string) => {
  const ref = doc(db, col, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Not found');
  return { id: snap.id, ...snap.data() };
};

const createDocument = async (col: string, data: any) => {
  const ref = await addDoc(collection(db, col), data);
  const snap = await getDoc(ref);
  return { id: snap.id, ...snap.data() };
};

const updateDocument = async (col: string, id: string, data: any) => {
  const ref = doc(db, col, id);
  await updateDoc(ref, data);
  const snap = await getDoc(ref);
  return { id: snap.id, ...snap.data() };
};

const deleteDocument = async (col: string, id: string) => {
  const ref = doc(db, col, id);
  await deleteDoc(ref);
  return { success: true };
};

// Helper to create or overwrite a known "__schema" document in a collection.
const ensureSchemaDoc = async (col: string, schema: Record<string, any>) => {
  const ref = doc(db, col, '__schema');
  await setDoc(ref, {
    ...schema,
    _meta: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'migrated-from-models',
    },
  });
};

// ==================== AUTHENTICATION (Firebase Auth) ====================
//
// Admins authenticate via Firebase Authentication (email/password).
// Optionally restrict to specific emails via:
// VITE_ADMIN_ALLOWED_EMAILS=admin1@example.com,admin2@example.com

export interface Admin {
  id: string;
  username: string;
  email: string;
  role: string;
}

const ADMIN_ALLOWED_EMAILS = (import.meta.env.VITE_ADMIN_ALLOWED_EMAILS || '')
  .split(',')
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

const isEmailAllowed = (email: string): boolean => {
  if (!ADMIN_ALLOWED_EMAILS.length) return true; // if none configured, allow any Firebase user
  return ADMIN_ALLOWED_EMAILS.includes(email.toLowerCase());
};

const getToken = (): string | null => {
  try {
    return localStorage.getItem('imadel_auth_token');
  } catch {
    return null;
  }
};

const setToken = (token: string): void => {
  try {
    localStorage.setItem('imadel_auth_token', token);
  } catch {}
};

const removeToken = (): void => {
  try {
    localStorage.removeItem('imadel_auth_token');
  } catch {}
};

export interface LoginResponse {
  success: boolean;
  token: string;
  admin: Admin;
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    // Sign in with Firebase Auth using email/password
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const user = credential.user;

    if (!user.email) {
      await signOut(auth);
      throw new Error('This account has no email associated with it.');
    }

    if (!isEmailAllowed(user.email)) {
      await signOut(auth);
      throw new Error('You are not authorized to access the admin panel.');
    }

    const admin: Admin = {
      id: user.uid,
      username: user.displayName || user.email.split('@')[0] || 'admin',
      email: user.email,
      role: 'admin',
    };

    // Store a simple token/flag in localStorage for compatibility
    const tokenPayload = { admin, uid: user.uid, ts: Date.now() };
    const token = btoa(JSON.stringify(tokenPayload));
    setToken(token);

    return { success: true, token, admin };
  },

  getMe: async (): Promise<Admin> => {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('Not authenticated');
    }
    if (!isEmailAllowed(user.email)) {
      throw new Error('Not authorized');
    }
    return {
      id: user.uid,
      username: user.displayName || user.email.split('@')[0] || 'admin',
      email: user.email,
      role: 'admin',
    };
  },

  logout: (): void => {
    removeToken();
    void signOut(auth);
  },

  isAuthenticated: (): boolean => {
    const user = auth.currentUser;
    if (user && user.email && isEmailAllowed(user.email)) return true;
    return getToken() !== null;
  },

  getToken,
  };

// ==================== SCHEMA INITIALIZATION (from Models) ====================
//
// This provides a single command to create Firestore collections and
// store a "__schema" document in each one, mirroring the structure of
// the old Mongoose models in the Models/ folder.

const COLLECTIONS = {
  applications: 'candidatures',
  jobs: 'opportunites',
  projects: 'projets',
  partners: 'partenaires',
  offices: 'bureaux',
  donations: 'dons',
  news: 'actualites',
  newsletterSubscribers: 'abonnementsNewsletter',
  settings: 'parametres',
} as const;

export const schemaApi = {
  initializeAll: async () => {
    // Applications -> candidatures
    await ensureSchemaDoc(COLLECTIONS.applications, {
      jobId: 'jobDocumentId',
      jobTitle: 'string',
      fullName: 'string',
      email: 'string',
      phone: 'string',
      address: 'string',
      resume: 'string', // URL
      coverLetter: 'string',
      status: 'pending|reviewing|shortlisted|interviewed|rejected|accepted',
      adminNotes: 'string',
      appliedAt: new Date().toISOString(),
    });

    // Jobs -> opportunites
    await ensureSchemaDoc(COLLECTIONS.jobs, {
      title: 'string',
      description: 'string',
      requirements: ['string'],
      responsibilities: ['string'],
      location: 'string',
      type: 'temps-plein|temps-partiel|contrat|benevolat|stage',
      listingType: 'emploi|benevolat|opportunite|appel-offres',
      category: 'string',
      deadline: new Date().toISOString(),
      status: 'open|closed|filled',
      salary: {
        min: 0,
        max: 0,
        currency: 'CFA',
      },
      images: [
        {
          url: 'string',
          caption: 'string',
        },
      ],
      applyUrl: 'string',
      published: true,
    });

    // Projects -> projets
    await ensureSchemaDoc(COLLECTIONS.projects, {
      title: 'string',
      description: 'string',
      fullDescription: 'string',
      category: 'current|completed|news',
      // Multi-select field: domaines d'intervention
      areasOfIntervention: [
        'Eaux, Hygiène et Assainissement',
        'Décentralisation',
        'Éducation',
        'Renforcement de capacités',
        'Plaidoyer/Lobbyisme',
        'Environnement',
        'Santé et Nutrition',
        'Services Sociaux et Résilience',
        'Protection',
        'COOP',
      ],
      images: [{ url: 'string', caption: 'string' }],
      location: 'string',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      status: 'active|completed|upcoming|archived',
      impactStats: {
        beneficiaries: 0,
        communities: 0,
        budget: 0,
      },
      published: true,
    });

    // Offices -> bureaux
    await ensureSchemaDoc(COLLECTIONS.offices, {
      name: 'string',
      type: 'headquarters|regional|field',
      address: {
        street: 'string',
        city: 'string',
        region: 'string',
        country: 'string',
        postalCode: 'string',
      },
      contact: {
        phone: 'string',
        email: 'string',
        fax: 'string',
      },
      coordinates: {
        latitude: 0,
        longitude: 0,
      },
      active: true,
    });

    // Partners -> partenaires
    await ensureSchemaDoc(COLLECTIONS.partners, {
      name: 'string',
      logo: 'string',
      description: 'string',
      website: 'string',
      category: 'funding|implementation|technical|government|community|other',
      partnershipStartDate: new Date().toISOString(),
      active: true,
    });

    // Newsletter subscribers -> abonnementsNewsletter
    await ensureSchemaDoc(COLLECTIONS.newsletterSubscribers, {
      email: 'string',
      name: 'string',
      subscribed: true,
      subscribedAt: new Date().toISOString(),
      unsubscribedAt: new Date().toISOString(),
    });

    // News -> actualites
    await ensureSchemaDoc(COLLECTIONS.news, {
      titre: 'string',
      image: 'string|null',
      description: 'string',
      auteur: 'string',
      datePublication: new Date().toISOString(),
      publie: true,
      creeLe: new Date().toISOString(),
      modifieLe: new Date().toISOString(),
    });

    // Donations -> dons
    await ensureSchemaDoc(COLLECTIONS.donations, {
      donorName: 'string',
      donorEmail: 'string',
      donorPhone: 'string',
      amount: 0,
      currency: 'XOF|GHS|NGN|USD|EUR',
      paymentReference: 'string',
      paymentStatus: 'pending|success|failed|abandoned',
      paymentMethod: 'card|bank_transfer|mobile_money|manual',
      paystackReference: 'string',
      authorizationCode: 'string',
      message: 'string',
      isAnonymous: false,
      purpose: 'general|education|healthcare|water|emergency|other',
      metadata: {},
      paidAt: new Date().toISOString(),
    });

    // Admins (from Admin model)
    await ensureSchemaDoc('admins', {
      username: 'string',
      email: 'string',
      role: 'admin',
      lastLogin: new Date().toISOString(),
    });

    // Media / site images (hero, about, etc.)
    await ensureSchemaDoc('media', {
      heroHomeUrl: 'string',
      aboutHomeUrl: 'string',
      aboutHeroUrl: 'string',
      aboutMissionUrl: 'string',
      aboutActivitiesUrl: 'string',
    });

    return { success: true };
  },
};


// ==================== MEDIA (site images) ====================

export interface SiteImages {
  heroHomeUrl?: string;
  aboutHomeUrl?: string;
  aboutHeroUrl?: string;
  aboutMissionUrl?: string;
  aboutActivitiesUrl?: string;
}

export const mediaApi = {
  getSiteImages: async (): Promise<SiteImages> => {
    try {
      const ref = doc(db, 'media', 'siteImages');
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        return {};
      }
      return (snap.data() as SiteImages) || {};
    } catch (error) {
      console.error('Error loading site images from Firestore:', error);
      return {};
    }
  },

  updateSiteImages: async (images: SiteImages): Promise<SiteImages> => {
    const ref = doc(db, 'media', 'siteImages');
    const now = new Date().toISOString();
    await setDoc(
      ref,
      {
        ...images,
        updatedAt: now,
      },
      { merge: true }
    );
    const snap = await getDoc(ref);
    return (snap.data() as SiteImages) || {};
  },

  uploadSiteImage: async (key: keyof SiteImages, file: File): Promise<SiteImages> => {
    const safeName = file.name.replace(/\s+/g, '-');
    const path = `site-images/${key}-${Date.now()}-${safeName}`;
    const ref = storageRef(storage, path);
    await uploadBytes(ref, file);
    const url = await getDownloadURL(ref);

    const current = await mediaApi.getSiteImages();
    const updated: SiteImages = {
      ...current,
      [key]: url,
    };

    return await mediaApi.updateSiteImages(updated);
  },
};


// ==================== PROJECTS ====================

export const projectsApi = {
  // Get all projects (optionally filtered by category/published)
  getAll: async (params?: { category?: string; status?: string; published?: boolean; limit?: number }) => {
    let qRef: any = collection(db, COLLECTIONS.projects);
    const filters: any[] = [];
    if (params?.category) filters.push(where('categorie', '==', params.category));
    if (params?.status) filters.push(where('statut', '==', params.status));
    if (params?.published !== undefined) filters.push(where('publie', '==', params.published));
    if (filters.length) {
      const parts: any[] = [...filters, orderBy('creeLe', 'desc')];
      if (params?.limit && params.limit > 0) {
        parts.push(limit(params.limit));
      }
      qRef = query(qRef, ...parts);
    } else if (params?.limit && params.limit > 0) {
      qRef = query(qRef, limit(params.limit));
    }
    const items = await listCollection(COLLECTIONS.projects, qRef);
    // Map French Firestore keys back to English shape for the rest of the app
    const mapped = items.map((p: any) => ({
      id: p.id,
      title: p.titre ?? p.title,
      description: p.description,
      fullDescription: p.descriptionComplete ?? p.fullDescription,
      category: p.categorie ?? p.category,
      areasOfIntervention: p.domainesIntervention ?? p.areasOfIntervention ?? [],
      images: p.images,
      location: p.lieu ?? p.location,
      startDate: p.dateDebut ?? p.startDate,
      endDate: p.dateFin ?? p.endDate,
      status: p.statut ?? p.status,
      impactStats: p.statImpact ?? p.impactStats,
      published: p.publie ?? p.published,
    }));
    return { success: true, data: mapped };
  },

  // Get single project
  getById: async (id: string) => {
    const item = await getDocument(COLLECTIONS.projects, id);
    const p: any = item;
    const mapped = {
      id: p.id,
      title: p.titre ?? p.title,
      description: p.description,
      fullDescription: p.descriptionComplete ?? p.fullDescription,
      category: p.categorie ?? p.category,
      areasOfIntervention: p.domainesIntervention ?? p.areasOfIntervention ?? [],
      images: p.images,
      location: p.lieu ?? p.location,
      startDate: p.dateDebut ?? p.startDate,
      endDate: p.dateFin ?? p.endDate,
      status: p.statut ?? p.status,
      impactStats: p.statImpact ?? p.impactStats,
      published: p.publie ?? p.published,
    };
    return { success: true, data: mapped };
  },

  // Create project
  create: async (projectData: {
    title: string;
    description: string;
    fullDescription?: string;
    category?: 'current' | 'completed' | 'news';
    areasOfIntervention?: string[];
    images?: { url: string; caption?: string }[];
    location?: string;
    startDate?: string;
    endDate?: string;
    status?: 'active' | 'completed' | 'upcoming' | 'archived';
    impactStats?: { beneficiaries?: number; communities?: number; budget?: number };
    published?: boolean;
  }) => {
    const frenchData: any = {
      titre: projectData.title,
      description: projectData.description,
      creeLe: new Date().toISOString(),
    };
    
    // Only include optional fields if they are defined
    if (projectData.fullDescription !== undefined) frenchData.descriptionComplete = projectData.fullDescription;
    if (projectData.category !== undefined) frenchData.categorie = projectData.category;
    if (projectData.areasOfIntervention !== undefined) frenchData.domainesIntervention = projectData.areasOfIntervention;
    if (projectData.images !== undefined) frenchData.images = projectData.images;
    if (projectData.location !== undefined) frenchData.lieu = projectData.location;
    if (projectData.startDate !== undefined) frenchData.dateDebut = projectData.startDate;
    if (projectData.endDate !== undefined) frenchData.dateFin = projectData.endDate;
    if (projectData.status !== undefined) frenchData.statut = projectData.status;
    if (projectData.published !== undefined) frenchData.publie = projectData.published;
    if (projectData.impactStats !== undefined) {
      frenchData.statImpact = {
        beneficiaires: projectData.impactStats.beneficiaries,
        communautes: projectData.impactStats.communities,
        budget: projectData.impactStats.budget,
      };
    }
    
    const created = await createDocument(COLLECTIONS.projects, frenchData);
    return { success: true, data: created };
  },

  // Update project
  update: async (id: string, projectData: Partial<{
    title: string;
    description: string;
    fullDescription?: string;
    category?: 'current' | 'completed' | 'news';
    areasOfIntervention?: string[];
    images?: { url: string; caption?: string }[];
    location?: string;
    startDate?: string;
    endDate?: string;
    status?: 'active' | 'completed' | 'upcoming' | 'archived';
    impactStats?: { beneficiaries?: number; communities?: number; budget?: number };
    published?: boolean;
  }>) => {
    const patch: any = {};
    if (projectData.title !== undefined) patch.titre = projectData.title;
    if (projectData.description !== undefined) patch.description = projectData.description;
    if (projectData.fullDescription !== undefined) patch.descriptionComplete = projectData.fullDescription;
    if (projectData.category !== undefined) patch.categorie = projectData.category;
    if (projectData.areasOfIntervention !== undefined) patch.domainesIntervention = projectData.areasOfIntervention;
    if (projectData.images !== undefined) patch.images = projectData.images;
    if (projectData.location !== undefined) patch.lieu = projectData.location;
    if (projectData.startDate !== undefined) patch.dateDebut = projectData.startDate;
    if (projectData.endDate !== undefined) patch.dateFin = projectData.endDate;
    if (projectData.status !== undefined) patch.statut = projectData.status;
    if (projectData.impactStats !== undefined) {
      patch.statImpact = {
        beneficiaires: projectData.impactStats?.beneficiaries,
        communautes: projectData.impactStats?.communities,
        budget: projectData.impactStats?.budget,
      };
    }
    if (projectData.published !== undefined) patch.publie = projectData.published;

    const updated = await updateDocument(COLLECTIONS.projects, id, patch);
    return { success: true, data: updated };
  },

  // Delete project
  delete: async (id: string) => {
    await deleteDocument(COLLECTIONS.projects, id);
    return { success: true };
  },
};

// ==================== JOBS ====================

export const jobsApi = {
  getAll: async () => {
    const items = await listCollection(COLLECTIONS.jobs);
    const mapped = items.map((j: any) => {
      // Map old English listingType values to new French values
      let listingType = j.typeOpportunite ?? j.listingType;
      if (!listingType || listingType === 'job' || listingType === 'employment') {
        listingType = 'emploi';
      } else if (listingType === 'volunteer') {
        listingType = 'benevolat';
      } else if (listingType === 'opportunity') {
        listingType = 'opportunite';
      } else if (listingType === 'proposal') {
        listingType = 'appel-offres';
      }
      
      // Map old English type values to new French values
      let type = j.typeContrat ?? j.type;
      if (type === 'full-time') type = 'temps-plein';
      else if (type === 'part-time') type = 'temps-partiel';
      else if (type === 'contract') type = 'contrat';
      else if (type === 'volunteer') type = 'benevolat';
      else if (type === 'internship') type = 'stage';
      
      return {
        id: j.id,
        title: j.titre ?? j.title,
        description: j.description,
        requirements: j.exigences ?? j.requirements ?? [],
        responsibilities: j.responsabilites ?? j.responsibilities ?? [],
        location: j.lieu ?? j.location,
        type,
        listingType,
        category: j.categorie ?? j.category,
        deadline: j.dateLimite ?? j.deadline,
        status: j.statut ?? j.status,
        salary: j.salaire ?? j.salary,
        images: j.images,
        published: j.publie ?? j.published,
        applyUrl: j.urlCandidature ?? j.applyUrl,
      };
    });
    return { success: true, data: mapped };
  },

  getById: async (id: string) => {
    const j: any = await getDocument(COLLECTIONS.jobs, id);
    
    // Map old English listingType values to new French values
    let listingType = j.typeOpportunite ?? j.listingType;
    if (!listingType || listingType === 'job' || listingType === 'employment') {
      listingType = 'emploi';
    } else if (listingType === 'volunteer') {
      listingType = 'benevolat';
    } else if (listingType === 'opportunity') {
      listingType = 'opportunite';
    } else if (listingType === 'proposal') {
      listingType = 'appel-offres';
    }
    
    // Map old English type values to new French values
    let type = j.typeContrat ?? j.type;
    if (type === 'full-time') type = 'temps-plein';
    else if (type === 'part-time') type = 'temps-partiel';
    else if (type === 'contract') type = 'contrat';
    else if (type === 'volunteer') type = 'benevolat';
    else if (type === 'internship') type = 'stage';
    
    const mapped = {
      id: j.id,
      title: j.titre ?? j.title,
      description: j.description,
      requirements: j.exigences ?? j.requirements ?? [],
      responsibilities: j.responsabilites ?? j.responsibilities ?? [],
      location: j.lieu ?? j.location,
      type,
      listingType,
      category: j.categorie ?? j.category,
      deadline: j.dateLimite ?? j.deadline,
      status: j.statut ?? j.status,
      salary: j.salaire ?? j.salary,
      images: j.images,
      published: j.publie ?? j.published,
      applyUrl: j.urlCandidature ?? j.applyUrl,
    };
    return { success: true, data: mapped };
  },

  create: async (jobData: {
    title: string;
    description: string;
    requirements?: string[];
    responsibilities?: string[];
    location: string;
    type?: 'temps-plein' | 'temps-partiel' | 'contrat' | 'benevolat' | 'stage';
    listingType?: 'emploi' | 'benevolat' | 'opportunite' | 'appel-offres';
    category?: string;
    deadline: string;
    status?: 'open' | 'closed' | 'filled';
    salary?: { min?: number; max?: number; currency?: string };
    images?: { url: string; caption?: string }[];
    published?: boolean;
    applyUrl?: string;
  }) => {
    const frenchData: any = {
      titre: jobData.title,
      description: jobData.description,
      lieu: jobData.location,
      dateLimite: jobData.deadline,
      creeLe: new Date().toISOString(),
    };
    
    // Only include optional fields if they are defined
    if (jobData.requirements !== undefined) frenchData.exigences = jobData.requirements;
    if (jobData.responsibilities !== undefined) frenchData.responsabilites = jobData.responsibilities;
    if (jobData.type !== undefined) frenchData.typeContrat = jobData.type;
    if (jobData.listingType !== undefined) frenchData.typeOpportunite = jobData.listingType;
    if (jobData.category !== undefined) frenchData.categorie = jobData.category;
    if (jobData.status !== undefined) frenchData.statut = jobData.status;
    if (jobData.salary !== undefined) frenchData.salaire = jobData.salary;
    if (jobData.images !== undefined) frenchData.images = jobData.images;
    if (jobData.published !== undefined) frenchData.publie = jobData.published;
    if (jobData.applyUrl !== undefined) frenchData.urlCandidature = jobData.applyUrl;
    
    const created = await createDocument(COLLECTIONS.jobs, frenchData);
    return { success: true, data: created };
  },

  // Update job
  update: async (id: string, jobData: Partial<{
    title: string;
    description: string;
    requirements?: string[];
    responsibilities?: string[];
    location: string;
    type?: 'temps-plein' | 'temps-partiel' | 'contrat' | 'benevolat' | 'stage';
    listingType?: 'emploi' | 'benevolat' | 'opportunite' | 'appel-offres';
    category?: string;
    deadline: string;
    status?: 'open' | 'closed' | 'filled';
    salary?: { min?: number; max?: number; currency?: string };
    images?: { url: string; caption?: string }[];
    published?: boolean;
    applyUrl?: string;
  }>) => {
    const patch: any = {};
    if (jobData.title !== undefined) patch.titre = jobData.title;
    if (jobData.description !== undefined) patch.description = jobData.description;
    if (jobData.requirements !== undefined) patch.exigences = jobData.requirements;
    if (jobData.responsibilities !== undefined) patch.responsabilites = jobData.responsibilities;
    if (jobData.location !== undefined) patch.lieu = jobData.location;
    if (jobData.type !== undefined) patch.typeContrat = jobData.type;
    if (jobData.listingType !== undefined) patch.typeOpportunite = jobData.listingType;
    if (jobData.category !== undefined) patch.categorie = jobData.category;
    if (jobData.deadline !== undefined) patch.dateLimite = jobData.deadline;
    if (jobData.status !== undefined) patch.statut = jobData.status;
    if (jobData.salary !== undefined) patch.salaire = jobData.salary;
    if (jobData.images !== undefined) patch.images = jobData.images;
    if (jobData.published !== undefined) patch.publie = jobData.published;
    if (jobData.applyUrl !== undefined) patch.urlCandidature = jobData.applyUrl;

    const updated = await updateDocument(COLLECTIONS.jobs, id, patch);
    return { success: true, data: updated };
  },

  // Delete job
  delete: async (id: string) => {
    await deleteDocument(COLLECTIONS.jobs, id);
    return { success: true };
  },
};

// ==================== PARTNERS ====================

export const partnersApi = {
  getAll: async () => {
    const items = await listCollection(COLLECTIONS.partners);
    const mapped = items.map((p: any) => ({
      id: p.id,
      name: p.nom ?? p.name,
      logo: p.logo,
      description: p.description,
      website: p.siteWeb ?? p.website,
      category: p.categorie ?? p.category,
      partnershipStartDate: p.debutPartenariat ?? p.partnershipStartDate,
      active: p.actif ?? p.active,
      images: p.images,
    }));
    return { success: true, data: mapped };
  },

  getById: async (id: string) => {
    const p: any = await getDocument(COLLECTIONS.partners, id);
    const mapped = {
      id: p.id,
      name: p.nom ?? p.name,
      logo: p.logo,
      description: p.description,
      website: p.siteWeb ?? p.website,
      category: p.categorie ?? p.category,
      partnershipStartDate: p.debutPartenariat ?? p.partnershipStartDate,
      active: p.actif ?? p.active,
      images: p.images,
    };
    return { success: true, data: mapped };
  },

  create: async (partnerData: {
    name: string;
    logo: string;
    description?: string;
    website?: string;
    category?: 'funding' | 'implementation' | 'technical' | 'government' | 'community' | 'other';
    partnershipStartDate?: string;
    active?: boolean;
    images?: string[];
  }) => {
    const frenchData: any = {
      nom: partnerData.name,
      logo: partnerData.logo,
      creeLe: new Date().toISOString(),
    };
    
    // Only include optional fields if they are defined
    if (partnerData.description !== undefined) frenchData.description = partnerData.description;
    if (partnerData.website !== undefined) frenchData.siteWeb = partnerData.website;
    if (partnerData.category !== undefined) frenchData.categorie = partnerData.category;
    if (partnerData.partnershipStartDate !== undefined) frenchData.debutPartenariat = partnerData.partnershipStartDate;
    if (partnerData.active !== undefined) frenchData.actif = partnerData.active;
    if (partnerData.images !== undefined) frenchData.images = partnerData.images;
    
    const created = await createDocument(COLLECTIONS.partners, frenchData);
    return { success: true, data: created };
  },

  // Update partner
  update: async (id: string, partnerData: Partial<{
    name: string;
    logo: string;
    description?: string;
    website?: string;
    category?: 'funding' | 'implementation' | 'technical' | 'government' | 'community' | 'other';
    partnershipStartDate?: string;
    active?: boolean;
  }>) => {
    const patch: any = {};
    if (partnerData.name !== undefined) patch.nom = partnerData.name;
    if (partnerData.logo !== undefined) patch.logo = partnerData.logo;
    if (partnerData.description !== undefined) patch.description = partnerData.description;
    if (partnerData.website !== undefined) patch.siteWeb = partnerData.website;
    if (partnerData.category !== undefined) patch.categorie = partnerData.category;
    if (partnerData.partnershipStartDate !== undefined) patch.debutPartenariat = partnerData.partnershipStartDate;
    if (partnerData.active !== undefined) patch.actif = partnerData.active;
    if ((partnerData as any).images !== undefined) patch.images = (partnerData as any).images;

    const updated = await updateDocument(COLLECTIONS.partners, id, patch);
    return { success: true, data: updated };
  },

  // Delete partner
  delete: async (id: string) => {
    await deleteDocument(COLLECTIONS.partners, id);
    return { success: true };
  },
};

// ==================== DONATIONS ====================

export const donationsApi = {
  // Record donations directly in Firestore. External payment gateways
  // (Paystack, etc.) have been removed from the frontend.
  initialize: async (donationData: {
    donorName: string;
    donorEmail: string;
    donorPhone?: string;
    amount: number;
    currency: 'XOF' | 'GHS' | 'NGN' | 'USD' | 'EUR';
    message?: string;
    isAnonymous?: boolean;
    purpose?: 'general' | 'education' | 'healthcare' | 'water' | 'emergency' | 'other';
  }) => {
    // Map English-typed payload to French Firestore fields
    const payload: any = {
      nomDonateur: donationData.donorName,
      emailDonateur: donationData.donorEmail,
      montant: donationData.amount,
      devise: donationData.currency,
      statutPaiement: 'pending',
      methodePaiement: 'manual', // or 'mobile_money' / 'card' depending on the flow
      creeLe: new Date().toISOString(),
    };

    if (donationData.donorPhone !== undefined) payload.telephoneDonateur = donationData.donorPhone;
    if (donationData.message !== undefined) payload.message = donationData.message;
    if (donationData.isAnonymous !== undefined) payload.anonyme = donationData.isAnonymous;
    if (donationData.purpose !== undefined) payload.objet = donationData.purpose;

    const created = await createDocument(COLLECTIONS.donations, payload);
    return {
      success: true,
      data: {
        ...created,
      },
    };
  },

  // Verification is now a no-op placeholder; real verification would
  // need to be handled via a Firebase Function or third-party SDK.
  verify: async (reference: string) => {
    return { success: true, data: { reference, paymentStatus: 'pending' } };
  },

  /**
   * Get all donations (admin)
   * GET /api/donations
   */
  getAll: async () => {
    const items = await listCollection(COLLECTIONS.donations);
    // Map French Firestore fields back to an English-ish shape for the UI
    const mapped = items.map((d: any) => ({
      id: d.id,
      donorName: d.nomDonateur ?? d.donorName,
      donorEmail: d.emailDonateur ?? d.donorEmail,
      donorPhone: d.telephoneDonateur ?? d.donorPhone,
      amount: d.montant ?? d.amount,
      currency: d.devise ?? d.currency,
      paymentReference: d.referencePaiement ?? d.paymentReference,
      paymentStatus: d.statutPaiement ?? d.paymentStatus,
      paymentMethod: d.methodePaiement ?? d.paymentMethod,
      paystackReference: d.referencePaystack ?? d.paystackReference,
      authorizationCode: d.codeAutorisation ?? d.authorizationCode,
      message: d.message,
      isAnonymous: d.anonyme ?? d.isAnonymous,
      purpose: d.objet ?? d.purpose,
      metadata: d.metadonnees ?? d.metadata,
      paidAt: d.datePaiement ?? d.paidAt,
      createdAt: d.creeLe ?? d.createdAt,
    }));
    return { success: true, data: mapped };
  },

  /**
   * Get donation by id (admin)
   * GET /api/donations/:id
   */
  getById: async (id: string) => {
    const d: any = await getDocument(COLLECTIONS.donations, id);
    const mapped = {
      id: d.id,
      donorName: d.nomDonateur ?? d.donorName,
      donorEmail: d.emailDonateur ?? d.donorEmail,
      donorPhone: d.telephoneDonateur ?? d.donorPhone,
      amount: d.montant ?? d.amount,
      currency: d.devise ?? d.currency,
      paymentReference: d.referencePaiement ?? d.paymentReference,
      paymentStatus: d.statutPaiement ?? d.paymentStatus,
      paymentMethod: d.methodePaiement ?? d.paymentMethod,
      paystackReference: d.referencePaystack ?? d.paystackReference,
      authorizationCode: d.codeAutorisation ?? d.authorizationCode,
      message: d.message,
      isAnonymous: d.anonyme ?? d.isAnonymous,
      purpose: d.objet ?? d.purpose,
      metadata: d.metadonnees ?? d.metadata,
      paidAt: d.datePaiement ?? d.paidAt,
      createdAt: d.creeLe ?? d.createdAt,
    };
    return { success: true, data: mapped };
  },
};

// ==================== APPLICATIONS ====================

export const applicationsApi = {
  /**
   * Submit a new job application
   * POST /api/applications
   * Backend will automatically send confirmation email to applicant
   */
  create: async (applicationData: {
    jobId: string;
    jobTitle: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    coverLetter: string;
    resumeUrl: string;
  }) => {
    const payload: any = {
      idOffre: applicationData.jobId,
      titreOffre: applicationData.jobTitle,
      nomComplet: applicationData.fullName,
        email: applicationData.email,
      telephone: applicationData.phone,
      adresse: applicationData.address,
      lettreMotivation: applicationData.coverLetter,
      cvUrl: applicationData.resumeUrl,
      dateCandidature: new Date().toISOString(),
      statut: 'new',
    };

    const created = await createDocument(COLLECTIONS.applications, payload);
    return { success: true, data: created };
  },

  /**
   * Get all applications (with optional filters)
   * GET /api/applications?status=&jobId=
   */
  getAll: async (params?: { status?: string; jobId?: string }) => {
    let qRef: any = collection(db, COLLECTIONS.applications);
    const filters: any[] = [];
    if (params?.status) filters.push(where('statut', '==', params.status));
    if (params?.jobId) filters.push(where('idOffre', '==', params.jobId));
    if (filters.length) {
      qRef = query(qRef, ...filters, orderBy('dateCandidature', 'desc'));
    }
    const items = await listCollection(COLLECTIONS.applications, filters.length ? qRef : undefined);
    const mapped = items.map((a: any) => ({
      id: a.id,
      jobId: a.idOffre ?? a.jobId,
      jobTitle: a.titreOffre ?? a.jobTitle,
      fullName: a.nomComplet ?? a.fullName,
      email: a.email,
      phone: a.telephone ?? a.phone,
      address: a.adresse ?? a.address,
      coverLetter: a.lettreMotivation ?? a.coverLetter,
      resumeUrl: a.cvUrl ?? a.resumeUrl,
      status: a.statut ?? a.status,
      appliedAt: a.dateCandidature ?? a.appliedAt,
      adminNotes: a.notesAdmin ?? a.adminNotes,
    }));
    return { success: true, data: mapped };
  },

  /**
   * Get single application
   * GET /api/applications/:id
   */
  getById: async (id: string) => {
    const a: any = await getDocument(COLLECTIONS.applications, id);
    const mapped = {
      id: a.id,
      jobId: a.idOffre ?? a.jobId,
      jobTitle: a.titreOffre ?? a.jobTitle,
      fullName: a.nomComplet ?? a.fullName,
      email: a.email,
      phone: a.telephone ?? a.phone,
      address: a.adresse ?? a.address,
      coverLetter: a.lettreMotivation ?? a.coverLetter,
      resumeUrl: a.cvUrl ?? a.resumeUrl,
      status: a.statut ?? a.status,
      appliedAt: a.dateCandidature ?? a.appliedAt,
      adminNotes: a.notesAdmin ?? a.adminNotes,
    };
    return { success: true, data: mapped };
  },

  /**
   * Update application status / notes
   * PUT /api/applications/:id
   */
  updateStatus: async (id: string, body: { status: string; adminNotes?: string }) => {
    const patch: any = {};
    if (body.status !== undefined) patch.statut = body.status;
    if (body.adminNotes !== undefined) patch.notesAdmin = body.adminNotes;
    const updated = await updateDocument(COLLECTIONS.applications, id, patch);
    return { success: true, data: updated };
  },

  /**
   * Delete application
   * DELETE /api/applications/:id
   */
  delete: async (id: string) => {
    await deleteDocument(COLLECTIONS.applications, id);
    return { success: true };
  },
};

// ==================== NEWSLETTERS ====================

export const newslettersApi = {
  /**
   * Get all newsletter content items
   * GET /api/newsletters?published=true
   * Note: Backend may return content items or subscribers based on query params
   * If /newsletters doesn't work, try /newsletters/public or /newsletters/content as fallback
   */
  getAll: async (params?: { published?: boolean }) => {
    let qRef: any = collection(db, 'newsletters');
    const filters: any[] = [];
    if (params?.published !== undefined) filters.push(where('published', '==', params.published));
    if (filters.length) {
      qRef = query(qRef, ...filters, orderBy('date', 'desc'));
        }
    const items = await listCollection('newsletters', filters.length ? qRef : undefined);
    return { success: true, data: items };
  },

  /**
   * Create a newsletter content item (admin)
   * POST /api/newsletters
   */
  createContent: async (newsletterData: {
    title: string;
    content?: string;
    published?: boolean;
    date?: string;
    images?: string[];
  }) => {
    const created = await createDocument('newsletters', {
      ...newsletterData,
      createdAt: new Date().toISOString(),
    });
    return { success: true, data: created };
  },

  /**
   * Update a newsletter content item (admin)
   * PUT /api/newsletters/:id
   */
  updateContent: async (id: string, newsletterData: {
    title?: string;
    content?: string;
    published?: boolean;
    date?: string;
    images?: string[];
  }) => {
    const updated = await updateDocument('newsletters', id, newsletterData);
    return { success: true, data: updated };
  },

  /**
   * Delete a newsletter content item (admin)
   * DELETE /api/newsletters/:id
   */
  deleteContent: async (id: string) => {
    await deleteDocument('newsletters', id);
    return { success: true };
  },

  /**
   * Get all subscribers (admin only)
   * GET /api/newsletters/subscribers
   */
  getSubscribers: async () => {
    const items = await listCollection(COLLECTIONS.newsletterSubscribers);
    const mapped = items.map((s: any) => ({
      id: s.id,
      email: s.email,
      name: s.nom ?? s.name,
      subscribed: s.abonne ?? s.subscribed ?? true,
      subscribedAt: s.dateInscription ?? s.subscribedAt,
      unsubscribedAt: s.dateDesinscription ?? s.unsubscribedAt,
    }));
    return { success: true, data: mapped };
  },

  /**
   * Subscribe to newsletter
   * POST /api/newsletters/subscribe
   * Backend will automatically send confirmation email to subscriber
   */
  subscribe: async (email: string) => {
    const created = await createDocument(COLLECTIONS.newsletterSubscribers, {
      email,
      abonne: true,
      dateInscription: new Date().toISOString(),
    } as any);
    return { success: true, data: created };
  },

  /**
   * Unsubscribe from newsletter
   * POST /api/newsletters/unsubscribe
   */
  unsubscribe: async (email: string) => {
    const snap = await getDocs(
      query(collection(db, COLLECTIONS.newsletterSubscribers), where('email', '==', email))
    );
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    return { success: true };
  },

  /**
   * Delete subscriber (admin only)
   * DELETE /api/newsletters/:id
   */
  delete: async (id: string) => {
    await deleteDocument(COLLECTIONS.newsletterSubscribers, id);
    return { success: true };
  },
};

// ==================== NEWS ====================

export const newsApi = {
  /**
   * Get all news (optional published filter)
   * GET /api/news?published=true
   */
  getAll: async (params?: { published?: boolean; limit?: number }) => {
    let qRef: any = collection(db, COLLECTIONS.news);
    const filters: any[] = [];
    if (params?.published !== undefined) filters.push(where('publie', '==', params.published));
    if (filters.length) {
      const parts: any[] = [...filters, orderBy('datePublication', 'desc')];
      if (params?.limit && params.limit > 0) {
        parts.push(limit(params.limit));
    }
      qRef = query(qRef, ...parts);
    } else if (params?.limit && params.limit > 0) {
      qRef = query(qRef, limit(params.limit));
    }
    const items = await listCollection(COLLECTIONS.news, qRef);
    const mapped = items.map((n: any) => ({
      id: n.id,
      title: n.titre ?? n.title,
      image: n.image,
      description: n.description,
      author: n.auteur ?? n.author,
      date: n.datePublication ?? n.date,
      isPublished: n.publie ?? n.isPublished,
    }));
    return { success: true, data: mapped };
  },

  /**
   * Get single news item
   * GET /api/news/:id
   */
  getById: async (id: string) => {
    const n: any = await getDocument(COLLECTIONS.news, id);
    const mapped = {
      id: n.id,
      title: n.titre ?? n.title,
      image: n.image,
      description: n.description,
      author: n.auteur ?? n.author,
      date: n.datePublication ?? n.date,
      isPublished: n.publie ?? n.isPublished,
    };
    return { success: true, data: mapped };
  },

  /**
   * Create news item (admin)
   * POST /api/news
   */
  create: async (newsData: {
    title: string;
    image?: string;
    description: string;
    author: string;
    date?: string;
    isPublished?: boolean;
  }) => {
    const frenchData = {
      titre: newsData.title,
      image: newsData.image,
      description: newsData.description,
      auteur: newsData.author,
      datePublication: newsData.date || new Date().toISOString(),
      publie: newsData.isPublished ?? true,
      creeLe: new Date().toISOString(),
    };
    const created = await createDocument(COLLECTIONS.news, frenchData);
    return { success: true, data: created };
  },

  /**
   * Update news item (admin)
   * PUT /api/news/:id
   */
  update: async (id: string, newsData: Partial<{
    title: string;
    image?: string;
    description: string;
    author: string;
    date?: string;
    isPublished?: boolean;
  }>) => {
    const frenchData: any = {};
    if (newsData.title !== undefined) frenchData.titre = newsData.title;
    if (newsData.image !== undefined) frenchData.image = newsData.image;
    if (newsData.description !== undefined) frenchData.description = newsData.description;
    if (newsData.author !== undefined) frenchData.auteur = newsData.author;
    if (newsData.date !== undefined) frenchData.datePublication = newsData.date;
    if (newsData.isPublished !== undefined) frenchData.publie = newsData.isPublished;
    frenchData.modifieLe = new Date().toISOString();
    const updated = await updateDocument(COLLECTIONS.news, id, frenchData);
    return { success: true, data: updated };
  },

  /**
   * Delete news item (admin)
   * DELETE /api/news/:id
   */
  delete: async (id: string) => {
    await deleteDocument(COLLECTIONS.news, id);
    return { success: true };
  },
};

// ==================== OFFICES ====================

export const officesApi = {
  /**
   * Get all offices
   * GET /api/offices
   */
  getAll: async () => {
    const items = await listCollection(COLLECTIONS.offices);
    const mapped = items.map((o: any) => ({
      id: o.id,
      name: o.nom ?? o.name,
      type: o.typeBureau ?? o.type,
      address: {
        street: o.adresse?.rue ?? o.address?.street,
        city: o.adresse?.ville ?? o.address?.city,
        region: o.adresse?.region ?? o.address?.region,
        country: o.adresse?.pays ?? o.address?.country,
        postalCode: o.adresse?.codePostal ?? o.address?.postalCode,
      },
      contact: {
        phone: o.contact?.telephone ?? o.contact?.phone,
        email: o.contact?.email,
        fax: o.contact?.fax,
      },
      coordinates: {
        latitude: o.coordonnees?.latitude ?? o.coordinates?.latitude,
        longitude: o.coordonnees?.longitude ?? o.coordinates?.longitude,
      },
      active: o.actif ?? o.active,
    }));
    return { success: true, data: mapped };
  },

  /**
   * Get single office
   * GET /api/offices/:id
   */
  getById: async (id: string) => {
    const o: any = await getDocument(COLLECTIONS.offices, id);
    const mapped = {
      id: o.id,
      name: o.nom ?? o.name,
      type: o.typeBureau ?? o.type,
      address: {
        street: o.adresse?.rue ?? o.address?.street,
        city: o.adresse?.ville ?? o.address?.city,
        region: o.adresse?.region ?? o.address?.region,
        country: o.adresse?.pays ?? o.address?.country,
        postalCode: o.adresse?.codePostal ?? o.address?.postalCode,
      },
      contact: {
        phone: o.contact?.telephone ?? o.contact?.phone,
        email: o.contact?.email,
        fax: o.contact?.fax,
      },
      coordinates: {
        latitude: o.coordonnees?.latitude ?? o.coordinates?.latitude,
        longitude: o.coordonnees?.longitude ?? o.coordinates?.longitude,
      },
      active: o.actif ?? o.active,
    };
    return { success: true, data: mapped };
  },

  /**
   * Create office
   * POST /api/offices
   */
  create: async (officeData: {
    name: string;
    type?: 'headquarters' | 'regional' | 'field';
    address?: {
      street?: string;
      city?: string;
      region?: string;
      country?: string;
      postalCode?: string;
    };
    contact?: {
      phone?: string;
      email?: string;
      fax?: string;
    };
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
    active?: boolean;
  }) => {
    // Build nested objects without undefined fields (Firestore doesn't accept undefined)
    const address = officeData.address
      ? Object.fromEntries(
          Object.entries(officeData.address).filter(([, v]) => v !== undefined && v !== null && v !== '')
        )
      : undefined;

    const contact = officeData.contact
      ? Object.fromEntries(
          Object.entries(officeData.contact).filter(([, v]) => v !== undefined && v !== null && v !== '')
        )
      : undefined;

    const coordinates = officeData.coordinates
      ? Object.fromEntries(
          Object.entries(officeData.coordinates).filter(([, v]) => v !== undefined && v !== null)
        )
      : undefined;

    const payload: any = {
      nom: officeData.name,
      creeLe: new Date().toISOString(),
    };

    if (officeData.type) payload.typeBureau = officeData.type;
    if (address && Object.keys(address).length) {
      payload.adresse = {
        rue: address.street,
        ville: address.city,
        region: address.region,
        pays: address.country,
        codePostal: address.postalCode,
      };
    }
    if (contact && Object.keys(contact).length) {
      payload.contact = {
        telephone: contact.phone,
        email: contact.email,
        fax: contact.fax,
      };
    }
    if (coordinates && Object.keys(coordinates).length) {
      payload.coordonnees = {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      };
    }
    if (officeData.active !== undefined) payload.actif = officeData.active;

    const created = await createDocument(COLLECTIONS.offices, payload);
    return { success: true, data: created };
  },

  /**
   * Update office
   * PUT /api/offices/:id
   */
  update: async (id: string, officeData: Partial<{
    name: string;
    type?: 'headquarters' | 'regional' | 'field';
    address?: {
      street?: string;
      city?: string;
      region?: string;
      country?: string;
      postalCode?: string;
    };
    contact?: {
      phone?: string;
      email?: string;
      fax?: string;
    };
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
    active?: boolean;
  }>) => {
    const partial: any = {};

    if (officeData.name !== undefined) partial.nom = officeData.name;
    if (officeData.type !== undefined) partial.typeBureau = officeData.type;

    if (officeData.address) {
      const address = Object.fromEntries(
        Object.entries(officeData.address).filter(([, v]) => v !== undefined && v !== null && v !== '')
      );
      if (Object.keys(address).length) {
        partial.adresse = {
          rue: address.street,
          ville: address.city,
          region: address.region,
          pays: address.country,
          codePostal: address.postalCode,
        };
      }
    }

    if (officeData.contact) {
      const contact = Object.fromEntries(
        Object.entries(officeData.contact).filter(([, v]) => v !== undefined && v !== null && v !== '')
      );
      if (Object.keys(contact).length) {
        partial.contact = {
          telephone: contact.phone,
          email: contact.email,
          fax: contact.fax,
        };
      }
    }

    if (officeData.coordinates) {
      const coordinates = Object.fromEntries(
        Object.entries(officeData.coordinates).filter(([, v]) => v !== undefined && v !== null)
      );
      if (Object.keys(coordinates).length) {
        partial.coordonnees = {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        };
      }
    }

    if (officeData.active !== undefined) partial.actif = officeData.active;

    const updated = await updateDocument(COLLECTIONS.offices, id, partial);
    return { success: true, data: updated };
  },

  /**
   * Delete office
   * DELETE /api/offices/:id
   */
  delete: async (id: string) => {
    await deleteDocument(COLLECTIONS.offices, id);
    return { success: true };
  },
};

// ==================== UPLOADS ====================

export const uploadsApi = {
  /**
   * Upload single image to Firebase Storage
   * Returns the download URL
   */
  uploadImage: async (file: File, folder: string = 'uploads'): Promise<string> => {
    try {
      const safeName = file.name.replace(/\s+/g, '-');
      const path = `${folder}/${Date.now()}-${safeName}`;
      const ref = storageRef(storage, path);
      await uploadBytes(ref, file);
      const url = await getDownloadURL(ref);
      return url;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error uploading image:', error);
      }
      throw error;
    }
  },

  /**
   * Upload multiple images
   * POST /api/uploads/images
   */
  uploadImages: async (files: File[], folder: string = 'uploads'): Promise<string[]> => {
    const uploadPromises = files.map(file => uploadsApi.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  },

  /**
   * Delete image
   * DELETE /api/uploads/:filename
   */
  deleteImage: async (_filename: string) => {
    // TODO: Implement image deletion from Firebase Storage if needed
    return { success: true };
  },
};

// ==================== ADMIN ====================

export const adminApi = {
  /**
   * Get dashboard statistics
   * GET /api/admin/stats
   */
  getStats: async () => {
    // Basic aggregated stats from Firestore collections
    const [projects, jobs, partners, donations] = await Promise.all([
      listCollection(COLLECTIONS.projects),
      listCollection(COLLECTIONS.jobs),
      listCollection(COLLECTIONS.partners),
      listCollection(COLLECTIONS.donations),
    ]);
    return {
      success: true,
      data: {
        totalProjects: projects.length,
        totalJobs: jobs.length,
        totalPartners: partners.length,
        totalDonations: donations.length,
      },
    };
  },
};

// ==================== SETTINGS ====================

export const settingsApi = {
  // Get settings from Firestore
  get: async (): Promise<any> => {
    try {
      const ref = doc(db, COLLECTIONS.settings, 'main');
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        return null;
      }
      return snap.data();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error loading settings from Firestore:', error);
      }
      return null;
    }
  },
  // Save settings to Firestore
  save: async (settings: any): Promise<any> => {
    try {
      const ref = doc(db, COLLECTIONS.settings, 'main');
      const now = new Date().toISOString();
      await setDoc(
        ref,
        {
          ...settings,
          updatedAt: now,
        },
        { merge: true }
      );
      const snap = await getDoc(ref);
      return snap.data() || {};
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error saving settings to Firestore:', error);
      }
      throw error;
    }
  },
};

// Export default API object
export default {
  auth: authApi,
  projects: projectsApi,
  jobs: jobsApi,
  partners: partnersApi,
  donations: donationsApi,
  applications: applicationsApi,
  newsletters: newslettersApi,
  offices: officesApi,
  uploads: uploadsApi,
  admin: adminApi,
  settings: settingsApi,
};



