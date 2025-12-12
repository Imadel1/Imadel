import { useEffect, useState } from 'react';
import { FaXmark, FaCheck, FaEye, FaStar } from 'react-icons/fa6';
import './AdminPanel.css';
import { authApi, projectsApi, jobsApi, partnersApi, officesApi, donationsApi, applicationsApi, newsApi } from '../services/api';
import { useTranslation } from '../utils/i18n';
import logo from '../assets/cropped-nouveau_logo.png';

/**
 * BACKEND INTEGRATION NOTES:
 * 
 * This admin panel currently uses localStorage for data persistence.
 * For production, replace all localStorage calls with REST API calls.
 * 
 * See BACKEND_INTEGRATION.md for detailed integration guide.
 * 
 * Key Integration Points:
 * 1. Authentication - Lines 67-82 (logout function)
 * 2. Data Fetching - Lines 86-122 (useEffect hooks for each entity)
 * 3. CRUD Operations - Lines 131-243 (add/remove functions)
 * 4. Import/Export - Lines 244-265
 * 
 * API Endpoints Needed:
 * - POST /api/auth/login
 * - POST /api/auth/verify-2fa
 * - GET/POST/PUT/DELETE /api/projects
 * - GET/POST/PUT/DELETE /api/jobs
 * - GET/POST/PUT/DELETE /api/partners
 * - GET/POST/PUT/DELETE /api/newsletters
 * - GET/POST/PUT/DELETE /api/offices
 */

// Data Types - Match these on backend
type Office = {
  id: string;
  name?: string;
  country: string;
  city?: string;
  address?: string;
  lat?: number;
  lng?: number;
  type?: 'headquarters' | 'regional' | 'field';
  contact?: {
    phone?: string;
    email?: string;
    fax?: string;
  };
  active?: boolean;
};

type Project = {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  country?: string;
  published?: boolean;
  images?: string[]; // Currently URLs, consider file upload integration
  areasOfIntervention?: string[]; // Multi-select field for filtering
  startDate?: string;
  endDate?: string;
  status?: 'active' | 'completed' | 'upcoming' | 'archived';
  impactStats?: {
    beneficiaries?: number;
    communities?: number;
    budget?: number;
  };
};

type Job = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  applyUrl?: string;
  published?: boolean;
  images?: string[];
  deadline?: string;
  requirements?: string[];
  responsibilities?: string[];
  type?: 'full-time' | 'part-time' | 'contract' | 'volunteer' | 'internship';
  status?: 'open' | 'closed' | 'filled';
  category?: string;
  salary?: { min?: number; max?: number; currency?: string };
};

type Partner = {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  description?: string;
  category?: 'funding' | 'implementation' | 'technical' | 'government' | 'community' | 'other';
  partnershipStartDate?: string;
  active?: boolean;
  images?: string[];
};

type Newsletter = {
  id: string;
  title: string;
  content?: string;
  published?: boolean;
  date?: string;
  images?: string[];
  author?: string;
  image?: string;
};

const AREAS_OF_INTERVENTION = [
  "Hydraulique rurale et urbaine",
  "Décentralisation",
  "Hygiène/Assainissement",
  "Éducation",
  "Formation",
  "Plaidoyer/Lobbyisme",
  "Environnement",
  "Santé",
  "Développement local",
  "Actualités"
];

// TODO: Replace localStorage with API calls
// Current localStorage keys - will be replaced with API endpoints
const STORAGE = {
  OFFICES: 'imadel_offices',
  PROJECTS: 'imadel_admin_projects',
  JOBS: 'imadel_admin_jobs',
  PARTNERS: 'imadel_admin_partners',
  NEWSLETTERS: 'imadel_admin_newsletters',
  AUTH: 'imadel_admin_authenticated',
  SETTINGS: 'imadel_settings',
};

type Settings = {
  theme?: 'orange' | 'blue';
  phoneNumber: string;
  orangeMoney: string;
  malitel: string;
  bankMali: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    agency: string;
    swiftCode: string;
  };
  bankInternational: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    iban: string;
    swiftCode: string;
  };
};

function uid(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default function AdminPanel() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'offices'|'projects'|'jobs'|'partners'|'newsletters'|'donations'|'applications'|'data'|'settings'>('projects');

  const [authenticated, setAuthenticated] = useState<boolean>(() => {
    // Check if token exists
    return authApi.isAuthenticated();
  });

  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authenticated) {
      window.location.href = '/admin';
    }
  }, [authenticated]);

  const logout = () => {
    authApi.logout();
    try { localStorage.removeItem(STORAGE.AUTH); } catch {}
    setAuthenticated(false);
    window.location.href = '/admin'; // Redirect to login page
  };

  // Offices
  const [offices, setOffices] = useState<Office[]>([]);
  useEffect(() => {
    const fetchOffices = async () => {
      setLoading(prev => ({ ...prev, offices: true }));
      setErrors(prev => ({ ...prev, offices: '' }));
      try {
        const response = await officesApi.getAll();

        // Support multiple response shapes: { offices }, { data }, or direct array
        const rawOffices =
          (response as any).offices ||
          (response as any).data ||
          response;

        if (response.success !== false && Array.isArray(rawOffices)) {
          const mappedOffices: Office[] = rawOffices.map((o: any) => {
            const addr = o.address;
            const normalizedAddress =
              typeof addr === 'string'
                ? addr
                : addr && typeof addr === 'object'
                ? [
                    addr.street,
                    addr.city,
                    addr.region,
                    addr.country,
                    addr.postalCode,
                  ]
                    .filter(Boolean)
                    .join(', ')
                : '';

            return {
              id: o.id || o._id,
              country: o.country,
              city: o.city || addr?.city,
              address: normalizedAddress,
              lat: o.latitude ?? o.lat,
              lng: o.longitude ?? o.lng,
            };
          });

          setOffices(mappedOffices);
          window.dispatchEvent(new CustomEvent('imadel:offices:updated'));
        }
      } catch (error: any) {
        console.error('Error fetching offices:', error);
        setErrors(prev => ({ ...prev, offices: error.message || 'Failed to load offices' }));
      } finally {
        setLoading(prev => ({ ...prev, offices: false }));
      }
    };
    if (authenticated) fetchOffices();
  }, [authenticated]);

  // Projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(prev => ({ ...prev, projects: true }));
      setErrors(prev => ({ ...prev, projects: '' }));
      try {
        // Fetch all projects (not just published ones for admin panel)
        const response = await projectsApi.getAll({ published: undefined });

        const rawProjects =
          (response as any).projects ||
          (response as any).data ||
          response;

        if (response.success !== false && Array.isArray(rawProjects)) {
          const normalized: Project[] = rawProjects.map((p: any) => ({
            id: p._id || p.id || uid('project_'),
            title: p.title,
            summary: p.description,
            content: p.fullDescription || p.description || '',
            country: p.location,
            published: p.published ?? true,
            images: Array.isArray(p.images)
              ? p.images.map((img: any) => (typeof img === 'string' ? img : img.url || ''))
              : [],
            areasOfIntervention: p.category
              ? p.category === 'news'
                ? ['Actualités']
                : [p.category]
              : [],
            startDate: p.startDate,
            endDate: p.endDate,
            status: p.status,
            impactStats: p.impactStats,
          }));
          setProjects(normalized);
          window.dispatchEvent(new CustomEvent('imadel:projects:updated'));
        }
      } catch (error: any) {
        console.error('Error fetching projects:', error);
        setErrors(prev => ({ ...prev, projects: error.message || 'Failed to load projects' }));
      } finally {
        setLoading(prev => ({ ...prev, projects: false }));
      }
    };
    if (authenticated) fetchProjects();
  }, [authenticated]);

  // Jobs
  const [jobs, setJobs] = useState<Job[]>([]);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(prev => ({ ...prev, jobs: true }));
      setErrors(prev => ({ ...prev, jobs: '' }));
      try {
        const response = await jobsApi.getAll();

        const rawJobs =
          (response as any).jobs ||
          (response as any).data ||
          response;

        if (response.success !== false && Array.isArray(rawJobs)) {
          const normalizedJobs: Job[] = rawJobs.map((j: any) => ({
            id: j.id || j._id || uid('job_'),
            title: j.title,
            description: j.description,
            location: j.location,
            applyUrl: j.applyUrl,
            published: j.published,
            deadline: j.deadline,
            images: Array.isArray(j.images)
              ? j.images.map((img: any) => (typeof img === 'string' ? img : img.url || ''))
              : [],
          }));

          setJobs(normalizedJobs);
          window.dispatchEvent(new CustomEvent('imadel:jobs:updated'));
        }
      } catch (error: any) {
        console.error('Error fetching jobs:', error);
        setErrors(prev => ({ ...prev, jobs: error.message || 'Failed to load jobs' }));
      } finally {
        setLoading(prev => ({ ...prev, jobs: false }));
      }
    };
    if (authenticated) fetchJobs();
  }, [authenticated]);

  // Partners
  const [partners, setPartners] = useState<Partner[]>([]);
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  useEffect(() => {
    const fetchPartners = async () => {
      setLoading(prev => ({ ...prev, partners: true }));
      setErrors(prev => ({ ...prev, partners: '' }));
      try {
        const response = await partnersApi.getAll();

        const rawPartners =
          (response as any).partners ||
          (response as any).data ||
          response;

        if (response.success !== false && Array.isArray(rawPartners)) {
          const normalizedPartners: Partner[] = rawPartners.map((p: any) => ({
            id: p.id || p._id || uid('partner_'),
            name: p.name,
            logo: p.logo,
            website: p.website,
            description: p.description,
            category: p.category,
            partnershipStartDate: p.partnershipStartDate,
            active: p.active,
          }));

          setPartners(normalizedPartners);
          window.dispatchEvent(new CustomEvent('imadel:partners:updated'));
        }
      } catch (error: any) {
        console.error('Error fetching partners:', error);
        setErrors(prev => ({ ...prev, partners: error.message || 'Failed to load partners' }));
      } finally {
        setLoading(prev => ({ ...prev, partners: false }));
      }
    };
    if (authenticated) fetchPartners();
  }, [authenticated]);

  // Actualités (News API)
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [editingNewsletterId, setEditingNewsletterId] = useState<string | null>(null);
  useEffect(() => {
    const fetchNewsletters = async () => {
      setLoading(prev => ({ ...prev, newsletters: true }));
      setErrors(prev => ({ ...prev, newsletters: '' }));
      try {
        const response = await newsApi.getAll({ published: undefined });
        const raw =
          (response as any).news ||
          (response as any).data ||
          response;

        if (response.success !== false && Array.isArray(raw)) {
          const normalized = raw.map((n: any) => ({
            id: n._id || n.id,
            title: n.title,
            content: n.description || '',
            published: n.isPublished ?? true,
            date: n.date || n.createdAt || new Date().toISOString(),
            images: n.image ? [n.image] : [],
          }));
          setNewsletters(normalized);
          window.dispatchEvent(new CustomEvent('imadel:newsletters:updated'));
        }
      } catch (error: any) {
        console.error('Error fetching news:', error);
        setErrors(prev => ({ ...prev, newsletters: error.message || 'Failed to load news' }));
      } finally {
        setLoading(prev => ({ ...prev, newsletters: false }));
      }
    };
    if (authenticated) fetchNewsletters();
  }, [authenticated]);

  // Settings
  const [settings, setSettings] = useState<Settings>(() => {
    const defaultSettings: Settings = {
      theme: 'orange',
      phoneNumber: '+223 20 79 98 40',
      orangeMoney: '+223 71 71 85 85',
      malitel: '+223 66 78 73 85',
      bankMali: {
        bankName: 'Bank of Africa - Mali (BOA)',
        accountName: 'IMADEL',
        accountNumber: '00123456789',
        agency: 'Bamako-Hamdallaye ACI 2000',
        swiftCode: 'BOAMMLBM',
      },
      bankInternational: {
        bankName: 'Ecobank Mali',
        accountName: 'IMADEL International',
        accountNumber: '0987654321',
        iban: 'ML13 0012 3456 7890 1234 5678 901',
        swiftCode: 'ECOMMLBM',
      },
    };
    
    try {
      const raw = localStorage.getItem(STORAGE.SETTINGS);
      if (raw) {
        const saved = JSON.parse(raw);
        const merged = { ...defaultSettings, ...saved };
        // Apply theme on load
        import('../utils/settings').then(({ applyTheme }) => {
          applyTheme(merged.theme || 'orange');
        });
        return merged;
      }
    } catch {} 
    
    // Apply default theme
    import('../utils/settings').then(({ applyTheme }) => {
      applyTheme('orange');
    });
    return defaultSettings;
  });
  
  // Apply theme on initial load
  useEffect(() => {
    import('../utils/settings').then(({ applyTheme }) => {
      applyTheme(settings.theme || 'orange');
    });
  }, []);

  useEffect(() => { 
    try { 
      localStorage.setItem(STORAGE.SETTINGS, JSON.stringify(settings));
      // Dispatch event to notify other components of settings update
      window.dispatchEvent(new CustomEvent('imadel:settings:updated'));
    } catch {} 
  }, [settings]);

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      // Update localStorage
      try {
        localStorage.setItem(STORAGE.SETTINGS, JSON.stringify(newSettings));
        // Apply theme if it changed
        if (updates.theme !== undefined) {
          import('../utils/settings').then(({ applyTheme }) => {
            applyTheme(updates.theme || 'orange');
          });
        }
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('imadel:settings:updated'));
      } catch (error) {
        console.error('Error saving settings:', error);
      }
      return newSettings;
    });
    setErrors(prev => ({ ...prev, settings: '' }));
  };

  const updateBankMali = (updates: Partial<Settings['bankMali']>) => {
    setSettings(prev => ({
      ...prev,
      bankMali: { ...prev.bankMali, ...updates }
    }));
  };

  const updateBankInternational = (updates: Partial<Settings['bankInternational']>) => {
    setSettings(prev => ({
      ...prev,
      bankInternational: { ...prev.bankInternational, ...updates }
    }));
  };

  // Donations
  type Donation = {
    id: string;
    donorName: string;
    donorEmail: string;
    donorPhone?: string;
    amount: number;
    currency: string;
    paymentStatus: 'pending' | 'success' | 'failed' | 'abandoned';
    paymentReference: string;
    purpose?: string;
    message?: string;
    isAnonymous: boolean;
    paidAt?: string;
    createdAt?: string;
  };

  const [donations, setDonations] = useState<Donation[]>([]);
  useEffect(() => {
    const fetchDonations = async () => {
      setLoading(prev => ({ ...prev, donations: true }));
      setErrors(prev => ({ ...prev, donations: '' }));
      try {
        const response = await donationsApi.getAll();
        if (response.success !== false) {
          const rawDonations = (response as any).donations || (response as any).data || [];
          if (Array.isArray(rawDonations)) {
            const normalizedDonations: Donation[] = rawDonations.map((d: any) => ({
              id: d.id || d._id || uid('donation_'),
              donorName: d.donorName,
              donorEmail: d.donorEmail,
              donorPhone: d.donorPhone,
              amount: d.amount,
              currency: d.currency || 'XOF',
              paymentStatus: d.paymentStatus || 'pending',
              paymentReference: d.paymentReference,
              purpose: d.purpose,
              message: d.message,
              isAnonymous: d.isAnonymous || false,
              paidAt: d.paidAt,
              createdAt: d.createdAt,
            }));
            setDonations(normalizedDonations);
          }
        }
      } catch (err: any) {
        console.error('Error fetching donations:', err);
        setErrors(prev => ({ ...prev, donations: err.message || 'Failed to load donations' }));
      } finally {
        setLoading(prev => ({ ...prev, donations: false }));
      }
    };
    if (authenticated) fetchDonations();
  }, [authenticated]);

  // Applications
  type Application = {
    id: string;
    jobId: string;
    jobTitle: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    resume: string;
    coverLetter: string;
    status: 'pending' | 'reviewing' | 'shortlisted' | 'interviewed' | 'rejected' | 'accepted';
    adminNotes?: string;
    appliedAt?: string;
    createdAt?: string;
  };

  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [applicationFilter, setApplicationFilter] = useState<{ status?: string; jobId?: string }>({});
  const [adminNotes, setAdminNotes] = useState<string>('');

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(prev => ({ ...prev, applications: true }));
      setErrors(prev => ({ ...prev, applications: '' }));
      try {
        const response = await applicationsApi.getAll(applicationFilter);
        if (response.success !== false) {
          const rawApplications = (response as any).applications || (response as any).data || [];
          if (Array.isArray(rawApplications)) {
            const normalizedApplications: Application[] = rawApplications.map((a: any) => ({
              id: a.id || a._id || uid('app_'),
              jobId: a.job?.id || a.job?._id || a.job || '',
              jobTitle: a.jobTitle || a.job?.title || 'Poste inconnu',
              fullName: a.fullName,
              email: a.email,
              phone: a.phone,
              address: a.address,
              resume: a.resume,
              coverLetter: a.coverLetter,
              status: a.status || 'pending',
              adminNotes: a.adminNotes,
              appliedAt: a.appliedAt || a.createdAt,
              createdAt: a.createdAt,
            }));
            setApplications(normalizedApplications);
          }
        }
      } catch (err: any) {
        console.error('Error fetching applications:', err);
        setErrors(prev => ({ ...prev, applications: err.message || 'Failed to load applications' }));
      } finally {
        setLoading(prev => ({ ...prev, applications: false }));
      }
    };
    if (authenticated) fetchApplications();
  }, [authenticated, applicationFilter]);

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      setLoading(prev => ({ ...prev, [`app_${applicationId}`]: true }));
      const response = await applicationsApi.updateStatus(applicationId, {
        status: newStatus,
        adminNotes: adminNotes || undefined,
      });

      if (response.success !== false) {
        // Refresh applications list
        const refreshResponse = await applicationsApi.getAll(applicationFilter);
        if (refreshResponse.success !== false) {
          const rawApplications = (refreshResponse as any).applications || (refreshResponse as any).data || [];
          if (Array.isArray(rawApplications)) {
            const normalizedApplications: Application[] = rawApplications.map((a: any) => ({
              id: a.id || a._id || uid('app_'),
              jobId: a.job?.id || a.job?._id || a.job || '',
              jobTitle: a.jobTitle || a.job?.title || 'Poste inconnu',
              fullName: a.fullName,
              email: a.email,
              phone: a.phone,
              address: a.address,
              resume: a.resume,
              coverLetter: a.coverLetter,
              status: a.status || 'pending',
              adminNotes: a.adminNotes,
              appliedAt: a.appliedAt || a.createdAt,
              createdAt: a.createdAt,
            }));
            setApplications(normalizedApplications);
          }
        }
        setSelectedApplication(null);
        setAdminNotes('');
        alert(`Application ${newStatus === 'accepted' ? 'accepted' : newStatus === 'rejected' ? 'rejected' : 'updated'} successfully. Email sent to applicant.`);
      } else {
        alert('Failed to update application status');
      }
    } catch (err: any) {
      console.error('Error updating application:', err);
      alert(err.message || 'Failed to update application status');
    } finally {
      setLoading(prev => ({ ...prev, [`app_${applicationId}`]: false }));
    }
  };

  const deleteApplication = async (applicationId: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    
    try {
      setLoading(prev => ({ ...prev, [`app_${applicationId}`]: true }));
      const response = await applicationsApi.delete(applicationId);
      
      if (response.success !== false) {
        setApplications(applications.filter(a => a.id !== applicationId));
        if (selectedApplication?.id === applicationId) {
          setSelectedApplication(null);
        }
        alert('Application deleted successfully');
      } else {
        alert('Failed to delete application');
      }
    } catch (err: any) {
      console.error('Error deleting application:', err);
      alert(err.message || 'Failed to delete application');
    } finally {
      setLoading(prev => ({ ...prev, [`app_${applicationId}`]: false }));
    }
  };

  // Forms state
  const [officeForm, setOfficeForm] = useState<Partial<Office>>({ active: true });
  const [projectForm, setProjectForm] = useState<Partial<Project>>({ published: false, areasOfIntervention: [] });
  const [jobForm, setJobForm] = useState<Partial<Job>>({ published: false });
  const [partnerForm, setPartnerForm] = useState<Partial<Partner>>({ active: true, images: [] });
  const [newsletterForm, setNewsletterForm] = useState<Partial<Newsletter>>({ published: false, author: 'IMADEL' });

  const addOffice = async () => {
    if (!authenticated) { alert('Please log in'); return; }
    if (!officeForm.country) { alert('Country is required'); return; }
    
    setLoading(prev => ({ ...prev, office: true }));
    try {
      const officeData = {
        name: officeForm.country || 'Bureau',
        type: (officeForm as any).type || 'field',
        address: {
          street: officeForm.address,
        city: officeForm.city,
          region: undefined,
          country: officeForm.country,
          postalCode: undefined,
        },
        contact: {
          phone: (officeForm as any).phone,
          email: (officeForm as any).email,
          fax: (officeForm as any).fax,
        },
        coordinates: {
        latitude: officeForm.lat,
          longitude: officeForm.lng,
        },
        active: officeForm.active ?? true,
      };
      const response = await officesApi.create(officeData);
      if (response.success !== false) {
        const created =
          (response as any).office ||
          (response as any).data ||
          response;

        const addr = created.address;
        const normalizedAddress =
          typeof addr === 'string'
            ? addr
            : addr && typeof addr === 'object'
            ? [
                addr.street,
                addr.city,
                addr.region,
                addr.country,
                addr.postalCode,
              ]
                .filter(Boolean)
                .join(', ')
            : '';

        const newOffice: Office = {
          id: created.id || created._id || uid('office_'),
          country: created.address?.country || created.country,
          city: created.address?.city || created.city || addr?.city,
          address: created.address?.street || normalizedAddress || officeForm.address,
          lat: created.coordinates?.latitude ?? created.latitude ?? created.lat ?? officeForm.lat,
          lng: created.coordinates?.longitude ?? created.longitude ?? created.lng ?? officeForm.lng,
          active: created.active,
          type: created.type,
        };

        setOffices([...offices, newOffice]);
        setOfficeForm({ active: true });
        window.dispatchEvent(new CustomEvent('imadel:offices:updated'));
      }
    } catch (error: any) {
      alert(error.message || 'Failed to add office');
    } finally {
      setLoading(prev => ({ ...prev, office: false }));
    }
  };
  
  const removeOffice = async (id: string) => {
    if (!authenticated) { alert('Please log in'); return; }
    if (!confirm('Are you sure you want to delete this office?')) return;
    
    setLoading(prev => ({ ...prev, [`office_${id}`]: true }));
    try {
      const response = await officesApi.delete(id);
      if (response.success) {
        setOffices(offices.filter(o => o.id !== id));
        window.dispatchEvent(new CustomEvent('imadel:offices:updated'));
      }
    } catch (error: any) {
      alert(error.message || 'Failed to delete office');
    } finally {
      setLoading(prev => ({ ...prev, [`office_${id}`]: false }));
    }
  };

  const addProject = async () => {
    if (!authenticated) { alert('Please log in'); return; }
    if (!projectForm.title) { alert('Titre requis'); return; }
    if (!projectForm.summary && !projectForm.content) { alert('Description requise'); return; }
    
    setLoading(prev => ({ ...prev, project: true }));
    try {
      // Map images array to backend format if needed
      const images = (projectForm.images || []).filter(img => img.trim()).map(url => ({ url }));
      const categoryMapped: 'current' | 'completed' | 'news' = (projectForm.areasOfIntervention || []).includes('Actualités') ? 'news' : 'current';
      
      const projectData: {
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
      } = {
        title: projectForm.title,
        description: projectForm.summary || projectForm.content || 'N/A',
        fullDescription: projectForm.content || projectForm.summary || '',
        location: projectForm.country || '',
        images,
        published: !!projectForm.published,
        category: categoryMapped,
        areasOfIntervention: projectForm.areasOfIntervention || [],
        status: (projectForm as any).status || 'active',
        startDate: projectForm.startDate || undefined,
        endDate: projectForm.endDate || undefined,
        impactStats:
          projectForm.impactStats &&
          (projectForm.impactStats.beneficiaries ||
            projectForm.impactStats.communities ||
            projectForm.impactStats.budget)
            ? {
                beneficiaries: projectForm.impactStats.beneficiaries,
                communities: projectForm.impactStats.communities,
                budget: projectForm.impactStats.budget,
              }
            : undefined,
      };
      
      // Log the data being sent to verify areasOfIntervention is included
      console.log('Saving project with areasOfIntervention:', {
        areasOfIntervention: projectData.areasOfIntervention,
        count: projectData.areasOfIntervention?.length || 0,
        isUpdate: !!editingProjectId
      });
      
      let response;
      if (editingProjectId) {
        // Update existing project - ensure areasOfIntervention is sent
        response = await projectsApi.update(editingProjectId, projectData);
      if (response.success && response.project) {
          // Ensure areasOfIntervention is preserved in the updated project
          const updatedProject = { 
            ...response.project, 
            areasOfIntervention: projectForm.areasOfIntervention || [] 
          };
          setProjects(projects.map(p => p.id === editingProjectId ? updatedProject : p));
          setEditingProjectId(null);
          setProjectForm({ published: false, areasOfIntervention: [] });
          window.dispatchEvent(new CustomEvent('imadel:projects:updated'));
          console.log('Project updated. Backend response areasOfIntervention:', response.project.areasOfIntervention);
        }
      } else {
        // Create new project - ensure areasOfIntervention is sent
        response = await projectsApi.create(projectData);
        if (response.success && response.project) {
          // Ensure areasOfIntervention is included in the saved project
          const newProject = { 
            ...response.project, 
            areasOfIntervention: projectForm.areasOfIntervention || [] 
          };
        setProjects([...projects, newProject]);
        setProjectForm({ published: false, areasOfIntervention: [] });
        window.dispatchEvent(new CustomEvent('imadel:projects:updated'));
          console.log('Project created. Backend response areasOfIntervention:', response.project.areasOfIntervention);
        }
      }
    } catch (error: any) {
      alert(error.message || 'Failed to add project');
    } finally {
      setLoading(prev => ({ ...prev, project: false }));
    }
  };
  
  const addImageToProject = () => {
    const images = projectForm.images || [];
    setProjectForm({ ...projectForm, images: [...images, ''] });
  };
  
  const updateProjectImage = (index: number, value: string) => {
    const images = [...(projectForm.images || [])];
    images[index] = value;
    setProjectForm({ ...projectForm, images });
  };
  
  const removeProjectImage = (index: number) => {
    const images = [...(projectForm.images || [])];
    images.splice(index, 1);
    setProjectForm({ ...projectForm, images });
  };
  const removeProject = async (id: string) => {
    if (!authenticated) { alert('Please log in'); return; }
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    setLoading(prev => ({ ...prev, [`project_${id}`]: true }));
    try {
      const response = await projectsApi.delete(id);
      if (response.success) {
        setProjects(projects.filter(p => p.id !== id));
        if (editingProjectId === id) {
          setEditingProjectId(null);
          setProjectForm({ published: false, areasOfIntervention: [] });
        }
        window.dispatchEvent(new CustomEvent('imadel:projects:updated'));
      }
    } catch (error: any) {
      alert(error.message || 'Failed to delete project');
    } finally {
      setLoading(prev => ({ ...prev, [`project_${id}`]: false }));
    }
  };

  const addJob = async () => {
    if (!authenticated) { alert('Please log in'); return; }
    if (!jobForm.title) { alert('Job title required'); return; }
    
    setLoading(prev => ({ ...prev, job: true }));
    try {
      const images = (jobForm.images || []).filter(img => img.trim()).map(url => ({ url }));
      
      if (!jobForm.deadline) {
        alert('La date limite est requise');
        setLoading(prev => ({ ...prev, job: false }));
        return;
      }

      const jobData: {
        title: string;
        description: string;
        requirements?: string[];
        responsibilities?: string[];
        location: string;
        type?: 'full-time' | 'part-time' | 'contract' | 'volunteer' | 'internship';
        category?: string;
        deadline: string;
        status?: 'open' | 'closed' | 'filled';
        salary?: { min?: number; max?: number; currency?: string };
        images?: { url: string; caption?: string }[];
        published?: boolean;
        applyUrl?: string;
      } = {
        title: jobForm.title,
        description: jobForm.description || '',
        location: jobForm.location || '',
        published: !!jobForm.published,
        images: images,
        deadline: new Date(jobForm.deadline).toISOString(),
        type: (jobForm as any).type || 'full-time',
        category: (jobForm as any).category,
        status: (jobForm as any).status || 'open',
        requirements: (jobForm as any).requirements || [],
        responsibilities: (jobForm as any).responsibilities || [],
        salary: (jobForm as any).salary,
        applyUrl: jobForm.applyUrl,
      };
      
      // If editing, update existing job; otherwise create new
      if (editingJobId) {
        // Auto-generate apply URL if not already set
        const applyUrl = jobForm.applyUrl || `${window.location.origin}/job/${editingJobId}/apply`;
        const jobDataWithUrl = {
          ...jobData,
          applyUrl: applyUrl,
          deadline: jobForm.deadline ? new Date(jobForm.deadline).toISOString() : jobData.deadline,
        };
        
        const response = await jobsApi.update(editingJobId, jobDataWithUrl);
        if (response.success !== false) {
          const updated =
            (response as any).job ||
            (response as any).data ||
            response;

          const updatedJob: Job = {
            id: updated.id || updated._id || editingJobId,
            title: updated.title,
            description: updated.description,
            location: updated.location,
            applyUrl: updated.applyUrl || applyUrl,
            published: updated.published,
            deadline: updated.deadline,
            images: Array.isArray(updated.images)
              ? updated.images.map((img: any) => (typeof img === 'string' ? img : img.url || ''))
              : [],
          };

          setJobs(jobs.map(j => (j.id === editingJobId ? updatedJob : j)));
          setEditingJobId(null);
          setJobForm({ published: false });
          window.dispatchEvent(new CustomEvent('imadel:jobs:updated'));
        }
      } else {
        const response = await jobsApi.create(jobData);
        if (response.success !== false) {
          const created =
            (response as any).job ||
            (response as any).data ||
            response;

          const jobId = created.id || created._id || uid('job_');
          const autoGeneratedApplyUrl = `${window.location.origin}/job/${jobId}/apply`;
          
          // Update the job with auto-generated apply URL
          try {
            await jobsApi.update(jobId, {
              ...jobData,
              applyUrl: autoGeneratedApplyUrl,
            });
          } catch (updateError) {
            console.warn('Failed to update apply URL, but job was created:', updateError);
          }

          const newJob: Job = {
            id: jobId,
            title: created.title,
            description: created.description,
            location: created.location,
            applyUrl: autoGeneratedApplyUrl,
            published: created.published,
            images: Array.isArray(created.images)
              ? created.images.map((img: any) => (typeof img === 'string' ? img : img.url || ''))
              : [],
          };

          setJobs([...jobs, newJob]);
          setJobForm({ published: false });
          window.dispatchEvent(new CustomEvent('imadel:jobs:updated'));
        }
      }
    } catch (error: any) {
      alert(error.message || 'Failed to add job');
    } finally {
      setLoading(prev => ({ ...prev, job: false }));
    }
  };
  
  const addImageToJob = () => {
    const images = jobForm.images || [];
    setJobForm({ ...jobForm, images: [...images, ''] });
  };
  
  const updateJobImage = (index: number, value: string) => {
    const images = [...(jobForm.images || [])];
    images[index] = value;
    setJobForm({ ...jobForm, images });
  };
  
  const removeJobImage = (index: number) => {
    const images = [...(jobForm.images || [])];
    images.splice(index, 1);
    setJobForm({ ...jobForm, images });
  };
  const removeJob = async (id: string) => {
    if (!authenticated) { alert('Please log in'); return; }
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    setLoading(prev => ({ ...prev, [`job_${id}`]: true }));
    try {
      const response = await jobsApi.delete(id);
      if (response.success) {
        setJobs(jobs.filter(j => j.id !== id));
        if (editingJobId === id) {
          setEditingJobId(null);
    setJobForm({ published: false });
        }
        window.dispatchEvent(new CustomEvent('imadel:jobs:updated'));
      }
    } catch (error: any) {
      alert(error.message || 'Failed to delete job');
    } finally {
      setLoading(prev => ({ ...prev, [`job_${id}`]: false }));
    }
  };

  const addPartner = async () => {
    if (!authenticated) { alert('Please log in'); return; }
    if (!partnerForm.name) { alert('Partner name required'); return; }
    
    setLoading(prev => ({ ...prev, partner: true }));
    try {
      const partnerData: {
        name: string;
        logo: string;
        description?: string;
        website?: string;
        category?: 'funding' | 'implementation' | 'technical' | 'government' | 'community' | 'other';
        partnershipStartDate?: string;
        active?: boolean;
        images?: string[];
      } = {
        name: partnerForm.name,
        logo: partnerForm.logo || '',
        website: partnerForm.website || '',
        description: partnerForm.description || '',
        category: (partnerForm as any).category || 'other',
        partnershipStartDate: (partnerForm as any).partnershipStartDate,
        active: partnerForm.active ?? true,
        images: partnerForm.images || [],
      };
      
      if (editingPartnerId) {
        const response = await partnersApi.update(editingPartnerId, partnerData);
        if (response.success !== false) {
          const updated =
            (response as any).partner ||
            (response as any).data ||
            response;

          const updatedPartner: Partner = {
            id: updated.id || updated._id || editingPartnerId,
            name: updated.name,
            logo: updated.logo,
            website: updated.website,
            description: updated.description,
            category: updated.category,
            partnershipStartDate: updated.partnershipStartDate,
            active: updated.active,
            images: Array.isArray(updated.images)
              ? updated.images.map((img: any) => (typeof img === 'string' ? img : img.url || ''))
              : partnerForm.images || [],
          };

          setPartners(partners.map(p => (p.id === editingPartnerId ? updatedPartner : p)));
          setEditingPartnerId(null);
          setPartnerForm({ active: true });
          window.dispatchEvent(new CustomEvent('imadel:partners:updated'));
        }
      } else {
        const response = await partnersApi.create(partnerData);
        if (response.success !== false) {
          const created =
            (response as any).partner ||
            (response as any).data ||
            response;

          const newPartner: Partner = {
            id: created.id || created._id || uid('partner_'),
            name: created.name,
            logo: created.logo,
            website: created.website,
            description: created.description,
            category: created.category,
            partnershipStartDate: created.partnershipStartDate,
            active: created.active,
            images: Array.isArray(created.images)
              ? created.images.map((img: any) => (typeof img === 'string' ? img : img.url || ''))
              : [],
          };

          setPartners([...partners, newPartner]);
        setPartnerForm({ active: true, images: [] });
          window.dispatchEvent(new CustomEvent('imadel:partners:updated'));
        }
      }
    } catch (error: any) {
      alert(error.message || 'Failed to add partner');
    } finally {
      setLoading(prev => ({ ...prev, partner: false }));
    }
  };
  
  const addImageToPartner = () => {
    const images = partnerForm.images || [];
    setPartnerForm({ ...partnerForm, images: [...images, ''] });
  };
  
  const updatePartnerImage = (index: number, value: string) => {
    const images = [...(partnerForm.images || [])];
    images[index] = value;
    setPartnerForm({ ...partnerForm, images });
  };
  
  const removePartnerImage = (index: number) => {
    const images = [...(partnerForm.images || [])];
    images.splice(index, 1);
    setPartnerForm({ ...partnerForm, images });
  };
  const removePartner = async (id: string) => {
    if (!authenticated) { alert('Please log in'); return; }
    if (!confirm('Are you sure you want to delete this partner?')) return;
    
    setLoading(prev => ({ ...prev, [`partner_${id}`]: true }));
    try {
      const response = await partnersApi.delete(id);
      if (response.success) {
        setPartners(partners.filter(p => p.id !== id));
        if (editingPartnerId === id) {
          setEditingPartnerId(null);
    setPartnerForm({});
        }
        window.dispatchEvent(new CustomEvent('imadel:partners:updated'));
      }
    } catch (error: any) {
      alert(error.message || 'Failed to delete partner');
    } finally {
      setLoading(prev => ({ ...prev, [`partner_${id}`]: false }));
    }
  };

  const addNewsletter = async () => {
    if (!authenticated) { alert('Please log in'); return; }
    if (!newsletterForm.title) { alert('Titre requis'); return; }

    const payload = {
      title: newsletterForm.title!,
      description: newsletterForm.content || '',
      author: (newsletterForm as any).author || 'IMADEL',
      image: (newsletterForm.images || [])[0] || '',
      date: newsletterForm.date || new Date().toISOString().split('T')[0],
      isPublished: !!newsletterForm.published,
    };

    const loadingKey = editingNewsletterId ? `newsletter_update_${editingNewsletterId}` : 'newsletter_create';
    setLoading(prev => ({ ...prev, [loadingKey]: true }));
    setErrors(prev => ({ ...prev, newsletters: '' }));

    try {
    if (editingNewsletterId) {
        const response = await newsApi.update(editingNewsletterId, payload);
        const updatedItem =
          (response as any).news ||
          (response as any).data ||
          response;

        const normalized = updatedItem && {
          id: updatedItem._id || updatedItem.id || editingNewsletterId,
          title: updatedItem.title ?? payload.title,
          content: updatedItem.description ?? payload.description,
          published: updatedItem.isPublished ?? payload.isPublished,
          date: updatedItem.date || updatedItem.createdAt || payload.date || new Date().toISOString(),
          images: updatedItem.image ? [updatedItem.image] : (newsletterForm.images || []),
        };

      const updatedList = newsletters.map(n =>
        n.id === editingNewsletterId
            ? (normalized || { ...n, ...payload })
          : n
      );
      setNewsletters(updatedList);
      setEditingNewsletterId(null);
      setNewsletterForm({ published: false });
    } else {
        const response = await newsApi.create(payload);
        const created =
          (response as any).news ||
          (response as any).data ||
          response;

        const normalized = {
          id: created?._id || created?.id || uid('news_'),
          title: created?.title ?? payload.title,
          content: created?.description ?? payload.description,
          published: created?.isPublished ?? payload.isPublished,
          date: created?.date || created?.createdAt || payload.date || new Date().toISOString(),
          images: created?.image ? [created.image] : (newsletterForm.images || []),
        };

        setNewsletters([...newsletters, normalized]);
      setNewsletterForm({ published: false });
      }
      window.dispatchEvent(new CustomEvent('imadel:newsletters:updated'));
    } catch (error: any) {
      console.error('Error saving newsletter:', error);
      setErrors(prev => ({ ...prev, newsletters: error.message || 'Failed to save newsletter' }));
      alert(error.message || 'Failed to save newsletter');
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };
  
  const addImageToNewsletter = () => {
    const images = newsletterForm.images || [];
    setNewsletterForm({ ...newsletterForm, images: [...images, ''] });
  };
  
  const updateNewsletterImage = (index: number, value: string) => {
    const images = [...(newsletterForm.images || [])];
    images[index] = value;
    setNewsletterForm({ ...newsletterForm, images });
  };
  
  const removeNewsletterImage = (index: number) => {
    const images = [...(newsletterForm.images || [])];
    images.splice(index, 1);
    setNewsletterForm({ ...newsletterForm, images });
  };
  const removeNewsletter = async (id: string) => {
    if (!authenticated) { alert('Please log in'); return; }
    if (!confirm('Supprimer cette actualité ?')) return;
    const loadingKey = `newsletter_delete_${id}`;
    setLoading(prev => ({ ...prev, [loadingKey]: true }));
    setErrors(prev => ({ ...prev, newsletters: '' }));
    try {
      await newsApi.delete(id);
    setNewsletters(newsletters.filter(n=>n.id!==id));
    if (editingNewsletterId === id) {
      setEditingNewsletterId(null);
    setNewsletterForm({ published: false });
      }
      window.dispatchEvent(new CustomEvent('imadel:newsletters:updated'));
    } catch (error: any) {
      console.error('Error deleting newsletter:', error);
      setErrors(prev => ({ ...prev, newsletters: error.message || 'Failed to delete newsletter' }));
      alert(error.message || 'Failed to delete newsletter');
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  // Data import/export
  // Export all data to JSON
  // TODO: Replace with API call - GET /api/admin/export
  const exportAll = () => {
    const payload = { offices, projects, jobs, partners, newsletters };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'imadel-data.json'; a.click(); URL.revokeObjectURL(url);
  };
  // Import data from JSON
  // TODO: Replace with API call - POST /api/admin/import
  const importJson = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(String(reader.result));
        if (Array.isArray(obj.offices)) setOffices(obj.offices);
        if (Array.isArray(obj.projects)) setProjects(obj.projects);
        if (Array.isArray(obj.jobs)) setJobs(obj.jobs);
        if (Array.isArray(obj.partners)) setPartners(obj.partners);
        if (Array.isArray(obj.newsletters)) setNewsletters(obj.newsletters);
        alert('Import complete');
      } catch (e) { alert('Invalid JSON'); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <img src={logo} alt="IMADEL Logo" style={{height: '40px', width: 'auto'}} />
          <h1>{t('adminPanel')}</h1>
        </div>
        <div className="admin-controls">
          <button onClick={logout}>{t('logout')}</button>
          <button onClick={exportAll}>Export JSON</button>
          <label className="import-label">
            Import JSON
            <input type="file" accept="application/json" onChange={e=>importJson(e.target.files?.[0]||null)} />
          </label>
        </div>
      </header>

      <nav className="admin-tabs">
        <button className={tab==='projects'?'active':''} onClick={()=>setTab('projects')}>{t('projects')}</button>
        <button className={tab==='jobs'?'active':''} onClick={()=>setTab('jobs')}>{t('jobs')}</button>
        <button className={tab==='applications'?'active':''} onClick={()=>setTab('applications')}>{t('applications')}</button>
        <button className={tab==='partners'?'active':''} onClick={()=>setTab('partners')}>{t('partners')}</button>
        <button className={tab==='newsletters'?'active':''} onClick={()=>setTab('newsletters')}>Actualités</button>
        <button className={tab==='donations'?'active':''} onClick={()=>setTab('donations')}>{t('donations')}</button>
        <button className={tab==='offices'?'active':''} onClick={()=>setTab('offices')}>{t('offices')}</button>
        <button className={tab==='data'?'active':''} onClick={()=>setTab('data')}>{t('data')}</button>
        <button className={tab==='settings'?'active':''} onClick={()=>setTab('settings')}>{t('settings')}</button>
      </nav>

      <main className="admin-main">
        {tab==='projects' && (
          <section className="panel">
            <h2>{t('projects')}</h2>
            {errors.projects && <p className="entity-error">{errors.projects}</p>}
            {loading.projects && <p className="entity-loading">Chargement des projets…</p>}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="project-title">Titre <span className="required">*</span></label>
                <input id="project-title" placeholder="Ex: Projet d'accès à l'eau potable" value={projectForm.title||''} onChange={e=>setProjectForm({...projectForm, title:e.target.value})} />
              </div>
              <div className="form-group">
                <label htmlFor="project-country">Pays</label>
                <input id="project-country" placeholder="Ex: Mali" value={projectForm.country||''} onChange={e=>setProjectForm({...projectForm, country:e.target.value})} />
              </div>
              <div className="form-group">
                <label htmlFor="project-summary">Résumé</label>
                <textarea id="project-summary" placeholder="Brève description du projet..." rows={3} value={projectForm.summary||''} onChange={e=>setProjectForm({...projectForm, summary:e.target.value})} />
              </div>
              <div className="form-group">
                <label htmlFor="project-content">Contenu (HTML ou Markdown)</label>
                <textarea id="project-content" placeholder="Description détaillée du projet..." rows={5} value={projectForm.content||''} onChange={e=>setProjectForm({...projectForm, content:e.target.value})} />
              </div>
              <div className="two-col">
                <label>
                  <span>Date de début</span>
                  <input type="date" value={projectForm.startDate||''} onChange={e=>setProjectForm({...projectForm, startDate: e.target.value})} />
                </label>
                <label>
                  <span>Date de fin</span>
                  <input type="date" value={projectForm.endDate||''} onChange={e=>setProjectForm({...projectForm, endDate: e.target.value})} />
                </label>
              </div>
              <div className="two-col">
                <div className="form-group">
                  <label htmlFor="project-status">Statut</label>
                  <select id="project-status" value={projectForm.status || 'active'} onChange={e=>setProjectForm({...projectForm, status: e.target.value as any})}>
                    <option value="active">En cours</option>
                    <option value="completed">Terminé</option>
                    <option value="upcoming">À venir</option>
                    <option value="archived">Archivé</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="project-beneficiaries">Bénéficiaires</label>
                  <input type="number" id="project-beneficiaries" placeholder="Ex: 5000" value={projectForm.impactStats?.beneficiaries ?? ''} onChange={e=>setProjectForm({
                    ...projectForm,
                    impactStats: { ...(projectForm.impactStats || {}), beneficiaries: e.target.value ? Number(e.target.value) : undefined }
                  })} />
                </div>
              </div>
              <div className="two-col">
                <div className="form-group">
                  <label htmlFor="project-communities">Communautés</label>
                  <input type="number" id="project-communities" placeholder="Ex: 10" value={projectForm.impactStats?.communities ?? ''} onChange={e=>setProjectForm({
                    ...projectForm,
                    impactStats: { ...(projectForm.impactStats || {}), communities: e.target.value ? Number(e.target.value) : undefined }
                  })} />
                </div>
                <div className="form-group">
                  <label htmlFor="project-budget">Budget</label>
                  <input type="number" id="project-budget" placeholder="Ex: 500000" value={projectForm.impactStats?.budget ?? ''} onChange={e=>setProjectForm({
                    ...projectForm,
                    impactStats: { ...(projectForm.impactStats || {}), budget: e.target.value ? Number(e.target.value) : undefined }
                  })} />
                </div>
              </div>
              
              <div className="areas-section">
                <label className="section-label">Domaines d'intervention (sélection multiple)</label>
                <div className="checkbox-group">
                  {AREAS_OF_INTERVENTION.map(area => (
                    <label key={area} className="checkbox-item">
                      <input 
                        type="checkbox" 
                        checked={(projectForm.areasOfIntervention || []).includes(area)}
                        onChange={(e) => {
                          const current = projectForm.areasOfIntervention || [];
                          if (e.target.checked) {
                            setProjectForm({...projectForm, areasOfIntervention: [...current, area]});
                          } else {
                            setProjectForm({...projectForm, areasOfIntervention: current.filter(a => a !== area)});
                          }
                        }}
                      />
                      <span>{area}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="images-section">
                <div className="section-header">
                  <label>URLs d'images</label>
                  <button type="button" className="btn-add-image" onClick={addImageToProject}>+ Ajouter une image</button>
                </div>
                {(projectForm.images || []).map((img, idx) => (
                  <div key={idx} className="image-input-row">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label htmlFor={`project-image-${idx}`}>URL de l'image {idx + 1}</label>
                    <input 
                        id={`project-image-${idx}`}
                        placeholder="https://exemple.com/image.jpg"
                      value={img} 
                      onChange={e => updateProjectImage(idx, e.target.value)} 
                    />
                    </div>
                    <button type="button" className="btn-remove" onClick={() => removeProjectImage(idx)} aria-label="Remove image">
                      <FaXmark />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="form-actions">
                <label className="checkbox-label-inline">
                  <input type="checkbox" checked={!!projectForm.published} onChange={e=>setProjectForm({...projectForm, published:e.target.checked})} /> 
                  Publié
                  <span className="help-text">Rendre visible sur le site</span>
                </label>
                <button className="btn-primary" onClick={addProject}>
                  {editingProjectId ? t('save') : t('addProject')}
                </button>
              </div>
            </div>

            <ul className="entity-list">
              {projects.map(p=> (
                <li key={p.id}>
                  <div className="entity-head">
                    <strong>{p.title}</strong> 
                    <span className="badge">{p.country}</span>
                    {p.published && <span className="badge badge-success">Published</span>}
                  </div>
                  <div className="entity-meta">{p.summary}</div>
                  {p.areasOfIntervention && p.areasOfIntervention.length > 0 && (
                    <div className="entity-areas">
                      <small><strong>Domaines :</strong> {p.areasOfIntervention.join(', ')}</small>
                    </div>
                  )}
                  {p.images && p.images.length > 0 && (
                    <div className="entity-images">
                      <small>{p.images.length} image(s)</small>
                    </div>
                  )}
                  <div className="entity-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProjectId(p.id);
                        setProjectForm({
                          title: p.title,
                          summary: p.summary,
                          content: p.content,
                          country: p.country,
                          published: p.published,
                          images: p.images,
                          areasOfIntervention: p.areasOfIntervention || [],
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      Modifier
                    </button>
                    <button className="btn-danger" onClick={()=>removeProject(p.id)}>Supprimer</button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tab==='jobs' && (
          <section className="panel">
            <h2>{t('jobs')}</h2>
            {errors.jobs && <p className="entity-error">{errors.jobs}</p>}
            {loading.jobs && <p className="entity-loading">Chargement des emplois…</p>}
            <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="job-title">Titre du poste <span className="required">*</span></label>
                    <input id="job-title" value={jobForm.title||''} onChange={e=>setJobForm({...jobForm, title:e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="job-location">Lieu</label>
                    <input id="job-location" value={jobForm.location||''} onChange={e=>setJobForm({...jobForm, location:e.target.value})} />
                  </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#1a1a2e' }}>
                  Date limite de candidature <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input 
                  type="datetime-local" 
                  value={jobForm.deadline||''} 
                  onChange={e=>setJobForm({...jobForm, deadline:e.target.value})}
                  required
                  style={{ padding: '10px 14px', border: '2px solid #e0e0e0', borderRadius: '6px', fontSize: '0.9rem', width: '100%' }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="job-description">Description</label>
                <textarea id="job-description" rows={5} value={jobForm.description||''} onChange={e=>setJobForm({...jobForm, description:e.target.value})} />
              </div>
              
              {/* Auto-generated Apply URL Section */}
              <div style={{ padding: '1rem', background: '#fff9f5', borderRadius: '6px', border: '2px solid #FFE5D6' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--primary, #FF6B00)' }}>
                  URL de candidature (auto-générée)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      readOnly
                      value={
                      editingJobId 
                        ? (jobForm.applyUrl || `${window.location.origin}/job/${editingJobId}/apply`)
                        : (jobForm.applyUrl || 'Sera générée lors de l’enregistrement du poste')
                      }
                    style={{ 
                      flex: 1, 
                      padding: '0.5rem', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px',
                      background: '#f9f9f9',
                      color: '#666',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem'
                    }}
                  />
                  {editingJobId && (
                    <button
                      type="button"
                      onClick={() => {
                        const url = jobForm.applyUrl || `${window.location.origin}/job/${editingJobId}/apply`;
                        navigator.clipboard.writeText(url);
                        alert('URL de candidature copiée dans le presse-papiers !');
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--primary, #FF6B00)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.85rem'
                      }}
                    >
                      Copy
                    </button>
                  )}
                </div>
                <small style={{ display: 'block', marginTop: '0.5rem', color: '#666', fontSize: '0.8rem' }}>
                  This URL is automatically generated and will be used when applicants click "Apply" on the job listing.
                </small>
              </div>
              
              <div className="images-section">
                <div className="section-header">
                  <label>Image URLs</label>
                  <button type="button" className="btn-add-image" onClick={addImageToJob}>+ Add Image</button>
                </div>
                {(jobForm.images || []).map((img, idx) => (
                  <div key={idx} className="image-input-row">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label htmlFor={`job-image-${idx}`}>Image URL {idx + 1}</label>
                    <input 
                        id={`job-image-${idx}`}
                        placeholder="https://exemple.com/image.jpg"
                      value={img} 
                      onChange={e => updateJobImage(idx, e.target.value)} 
                    />
                    </div>
                    <button type="button" className="btn-remove" onClick={() => removeJobImage(idx)} aria-label="Remove image">
                      <FaXmark />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="form-actions">
                <label className="checkbox-label-inline">
                  <input type="checkbox" checked={!!jobForm.published} onChange={e=>setJobForm({...jobForm, published:e.target.checked})} /> 
                  Published
                  <span className="help-text">Make visible on website</span>
                </label>
                <button className="btn-primary" onClick={addJob}>
                  {editingJobId ? t('save') : t('addJob')}
                </button>
              </div>
            </div>

            <ul className="entity-list">
              {jobs.map(j=> (
                <li key={j.id}>
                  <div className="entity-head">
                    <strong>{j.title}</strong> 
                    <span className="badge">{j.location}</span>
                    {j.published && <span className="badge badge-success">Published</span>}
                  </div>
                  <div className="entity-meta">{j.description}</div>
                  {j.images && j.images.length > 0 && (
                    <div className="entity-images">
                      <small>{j.images.length} image(s)</small>
                    </div>
                  )}
                  <div className="entity-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingJobId(j.id);
                        setJobForm({
                          title: j.title,
                          description: j.description,
                          location: j.location,
                          applyUrl: j.applyUrl,
                          published: j.published,
                          images: j.images,
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      Modifier
                    </button>
                    <button className="btn-danger" onClick={()=>removeJob(j.id)}>Supprimer</button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tab==='applications' && (
          <section className="panel">
            <h2>{t('applications')}</h2>
            {errors.applications && <p className="entity-error">{errors.applications}</p>}
            {loading.applications && <p className="entity-loading">Chargement des candidatures…</p>}

            {/* Filters */}
            <div className="application-filters" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <select
                value={applicationFilter.status || ''}
                onChange={(e) => setApplicationFilter({ ...applicationFilter, status: e.target.value || undefined })}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                 <option value="">{t('allStatuses')}</option>
                 <option value="pending">{t('pending')}</option>
                 <option value="reviewing">{t('reviewing')}</option>
                 <option value="shortlisted">{t('shortlisted')}</option>
                 <option value="interviewed">{t('interviewed')}</option>
                 <option value="accepted">{t('accepted')}</option>
                 <option value="rejected">{t('rejected')}</option>
              </select>
              <select
                value={applicationFilter.jobId || ''}
                onChange={(e) => setApplicationFilter({ ...applicationFilter, jobId: e.target.value || undefined })}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', flex: '1', minWidth: '200px' }}
              >
                <option value="">{t('allJobs')}</option>
                {Array.from(new Set(applications.map(a => a.jobId))).map(jobId => {
                  const app = applications.find(a => a.jobId === jobId);
                  return app ? (
                    <option key={jobId} value={jobId}>{app.jobTitle}</option>
                  ) : null;
                })}
              </select>
              <button
                onClick={() => setApplicationFilter({})}
                style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: '4px', 
                  border: '1px solid var(--primary, #FF6B00)', 
                  background: 'white', 
                  color: 'var(--primary, #FF6B00)',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--primary, #FF6B00)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.color = 'var(--primary, #FF6B00)';
                }}
              >
                Clear Filters
              </button>
            </div>

            {/* Application Stats */}
            <div className="application-stats" style={{ marginBottom: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <div><strong>Total :</strong> {applications.length}</div>
                <div><strong>En attente :</strong> {applications.filter(a => a.status === 'pending').length}</div>
                <div><strong>En cours d'examen :</strong> {applications.filter(a => a.status === 'reviewing').length}</div>
                <div><strong>Acceptées :</strong> {applications.filter(a => a.status === 'accepted').length}</div>
                <div><strong>Rejetées :</strong> {applications.filter(a => a.status === 'rejected').length}</div>
              </div>
            </div>

            {/* Application Detail View */}
            {selectedApplication && (
              <div className="application-detail" style={{ 
                background: '#f8f9fa', 
                padding: '2rem', 
                borderRadius: '8px', 
                marginBottom: '2rem',
                border: '2px solid var(--primary, #FF6B00)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, color: 'var(--primary, #FF6B00)' }}>Détails de la candidature</h3>
                  <button 
                    onClick={() => { setSelectedApplication(null); setAdminNotes(''); }} 
                    style={{ 
                      background: 'white', 
                      border: '2px solid var(--primary, #FF6B00)', 
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      fontSize: '1.5rem',
                      lineHeight: '1',
                      cursor: 'pointer',
                      color: 'var(--primary, #FF6B00)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--primary, #FF6B00)';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.color = 'var(--primary, #FF6B00)';
                    }}
                  >
                    <FaXmark />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <strong>Nom du candidat :</strong>
                    <p>{selectedApplication.fullName}</p>
                  </div>
                  <div>
                    <strong>Email :</strong>
                    <p><a href={`mailto:${selectedApplication.email}`}>{selectedApplication.email}</a></p>
                  </div>
                  <div>
                    <strong>Téléphone :</strong>
                    <p><a href={`tel:${selectedApplication.phone}`}>{selectedApplication.phone}</a></p>
                  </div>
                  <div>
                    <strong>Poste :</strong>
                    <p>{selectedApplication.jobTitle}</p>
                  </div>
                  <div>
                    <strong>URL de candidature :</strong>
                    <p style={{ wordBreak: 'break-all', fontSize: '0.9rem' }}>
                      <a 
                        href={selectedApplication.jobId ? `${window.location.origin}/job/${selectedApplication.jobId}/apply` : '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: 'var(--primary, #FF6B00)', textDecoration: 'underline' }}
                      >
                        {selectedApplication.jobId ? `${window.location.origin}/job/${selectedApplication.jobId}/apply` : 'N/A'}
                      </a>
                    </p>
                  </div>
                  <div>
                    <strong>Statut :</strong>
                    <p>
                      <span className={`badge ${selectedApplication.status === 'accepted' ? 'badge-success' : selectedApplication.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                        {selectedApplication.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <strong>Soumis le :</strong>
                    <p>{selectedApplication.appliedAt ? new Date(selectedApplication.appliedAt).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <strong>Adresse :</strong>
                  <p>{selectedApplication.address}</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <strong>Lettre de motivation :</strong>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '4px', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
                    {selectedApplication.coverLetter}
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <strong>CV :</strong>
                  <div style={{ marginTop: '0.5rem' }}>
                    <a 
                      href={selectedApplication.resume} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        display: 'inline-block', 
                        padding: '0.5rem 1rem', 
                        background: 'var(--primary, #FF6B00)', 
                        color: 'white', 
                        textDecoration: 'none', 
                        borderRadius: '4px' 
                      }}
                    >
                      📄 Voir/Télécharger le CV
                    </a>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="admin-notes"><strong>Notes admin :</strong></label>
                  <textarea
                    id="admin-notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'accepted')}
                    disabled={loading[`app_${selectedApplication.id}`] || selectedApplication.status === 'accepted'}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: loading[`app_${selectedApplication.id}`] || selectedApplication.status === 'accepted' ? 'not-allowed' : 'pointer',
                      opacity: loading[`app_${selectedApplication.id}`] || selectedApplication.status === 'accepted' ? 0.6 : 1
                    }}
                  >
                    {loading[`app_${selectedApplication.id}`] ? t('loading') : (
                      <>
                        <FaCheck style={{ marginRight: '6px', fontSize: '14px' }} />
                        {t('accepted')}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                    disabled={loading[`app_${selectedApplication.id}`] || selectedApplication.status === 'rejected'}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: loading[`app_${selectedApplication.id}`] || selectedApplication.status === 'rejected' ? 'not-allowed' : 'pointer',
                      opacity: loading[`app_${selectedApplication.id}`] || selectedApplication.status === 'rejected' ? 0.6 : 1
                    }}
                  >
                    {loading[`app_${selectedApplication.id}`] ? t('loading') : (
                      <>
                        <FaXmark style={{ marginRight: '6px', fontSize: '14px' }} />
                        {t('rejected')}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'reviewing')}
                    disabled={loading[`app_${selectedApplication.id}`] || selectedApplication.status === 'reviewing'}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#ffc107',
                      color: '#000',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: loading[`app_${selectedApplication.id}`] || selectedApplication.status === 'reviewing' ? 'not-allowed' : 'pointer',
                      opacity: loading[`app_${selectedApplication.id}`] || selectedApplication.status === 'reviewing' ? 0.6 : 1
                    }}
                  >
                    {loading[`app_${selectedApplication.id}`] ? t('loading') : (
                      <>
                        <FaEye style={{ marginRight: '6px', fontSize: '14px' }} />
                        {t('reviewing')}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'shortlisted')}
                    disabled={loading[`app_${selectedApplication.id}`] || selectedApplication.status === 'shortlisted'}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: loading[`app_${selectedApplication.id}`] || selectedApplication.status === 'shortlisted' ? 'not-allowed' : 'pointer',
                      opacity: loading[`app_${selectedApplication.id}`] || selectedApplication.status === 'shortlisted' ? 0.6 : 1
                    }}
                  >
                    {loading[`app_${selectedApplication.id}`] ? t('loading') : (
                      <>
                        <FaStar style={{ marginRight: '6px', fontSize: '14px' }} />
                        {t('shortlisted')}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => deleteApplication(selectedApplication.id)}
                    disabled={loading[`app_${selectedApplication.id}`]}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: loading[`app_${selectedApplication.id}`] ? 'not-allowed' : 'pointer',
                      marginLeft: 'auto'
                    }}
                  >
                    {loading[`app_${selectedApplication.id}`] ? 'Suppression...' : '🗑 Supprimer'}
                  </button>
                </div>
              </div>
            )}

            {/* Applications List */}
            <ul className="entity-list">
              {applications.map(a => (
                <li key={a.id}>
                  <div className="entity-head">
                    <strong>{a.fullName}</strong>
                    <span className="badge">{a.jobTitle}</span>
                    <span className={`badge ${a.status === 'accepted' ? 'badge-success' : a.status === 'rejected' ? 'badge-danger' : a.status === 'reviewing' ? 'badge-warning' : 'badge-info'}`}>
                      {a.status}
                    </span>
                  </div>
                  <div className="entity-meta">
                    <div><strong>Email:</strong> {a.email}</div>
                    <div><strong>Phone:</strong> {a.phone}</div>
                    {a.appliedAt && <div><strong>Applied:</strong> {new Date(a.appliedAt).toLocaleDateString()}</div>}
                  </div>
                  {a.coverLetter && (
                    <div className="entity-meta" style={{ marginTop: '0.5rem', fontStyle: 'italic', color: '#666' }}>
                      {a.coverLetter.slice(0, 150)}...
                    </div>
                  )}
                  <div className="entity-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedApplication(a);
                        setAdminNotes(a.adminNotes || '');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      Voir les détails
                    </button>
                    <a href={`mailto:${a.email}`} target="_blank" rel="noreferrer">Email</a>
                    {a.resume && <a href={a.resume} target="_blank" rel="noreferrer">CV</a>}
                  </div>
                </li>
              ))}
              {applications.length === 0 && !loading.applications && (
                <li style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  Aucune candidature trouvée
                </li>
              )}
            </ul>
          </section>
        )}

        {tab==='partners' && (
          <section className="panel">
            <h2>{t('partners')}</h2>
            {errors.partners && <p className="entity-error">{errors.partners}</p>}
            {loading.partners && <p className="entity-loading">Chargement des partenaires…</p>}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="partner-name">Nom du partenaire <span className="required">*</span></label>
                <input id="partner-name" placeholder="Ex: Organisation XYZ" value={partnerForm.name||''} onChange={e=>setPartnerForm({...partnerForm, name:e.target.value})} />
              </div>
              <div className="form-group">
                <label htmlFor="partner-logo">URL du logo</label>
                <input id="partner-logo" placeholder="https://exemple.com/logo.png" value={partnerForm.logo||''} onChange={e=>setPartnerForm({...partnerForm, logo:e.target.value})} />
              </div>
              <div className="form-group">
                <label htmlFor="partner-website">URL du site web</label>
                <input id="partner-website" placeholder="https://exemple.com" value={partnerForm.website||''} onChange={e=>setPartnerForm({...partnerForm, website:e.target.value})} />
              </div>
              <div className="form-group">
                <label htmlFor="partner-description">Description</label>
                <textarea id="partner-description" placeholder="Description du partenaire et de la collaboration..." rows={3} value={partnerForm.description||''} onChange={e=>setPartnerForm({...partnerForm, description:e.target.value})} />
              </div>
              
              <div className="images-section">
                <div className="section-header">
                  <label>Autres URLs d'images</label>
                  <button type="button" className="btn-add-image" onClick={addImageToPartner}>+ Ajouter une image</button>
                </div>
                {(partnerForm.images || []).map((img, idx) => (
                  <div key={idx} className="image-input-row">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label htmlFor={`partner-image-${idx}`}>URL de l'image {idx + 1}</label>
                    <input 
                        id={`partner-image-${idx}`}
                        placeholder="https://exemple.com/image.jpg"
                      value={img} 
                      onChange={e => updatePartnerImage(idx, e.target.value)} 
                    />
                    </div>
                    <button type="button" className="btn-remove" onClick={() => removePartnerImage(idx)} aria-label="Remove image">
                      <FaXmark />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="form-actions">
                <button className="btn-primary" onClick={addPartner}>
                  {editingPartnerId ? 'Enregistrer le partenaire' : 'Ajouter un partenaire'}
                </button>
              </div>
            </div>

            <ul className="entity-list">
              {partners.map(p=> (
                <li key={p.id}>
                  <div className="entity-head"><strong>{p.name}</strong></div>
                  <div className="entity-meta">{p.description}</div>
                  {p.images && p.images.length > 0 && (
                    <div className="entity-images">
                      <small>{p.images.length} image(s) supplémentaire(s)</small>
                    </div>
                  )}
                  <div className="entity-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPartnerId(p.id);
                        setPartnerForm({
                          name: p.name,
                          logo: p.logo,
                          website: p.website,
                          description: p.description,
                          images: p.images,
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      Modifier
                    </button>
                    <a href={p.website||'#'} target="_blank" rel="noreferrer">Site web</a> 
                    <button className="btn-danger" onClick={()=>removePartner(p.id)}>Supprimer</button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tab==='newsletters' && (
          <section className="panel">
            <h2>{t('newsletters')}</h2>
            {errors.newsletters && <p className="entity-error">{errors.newsletters}</p>}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="newsletter-title">Titre <span className="required">*</span></label>
                <input id="newsletter-title" placeholder="Ex: Nouvelle initiative lancée" value={newsletterForm.title||''} onChange={e=>setNewsletterForm({...newsletterForm, title:e.target.value})} />
              </div>
              <div className="form-group">
                <label htmlFor="newsletter-date">Date</label>
                <input type="date" id="newsletter-date" value={newsletterForm.date||''} onChange={e=>setNewsletterForm({...newsletterForm, date:e.target.value})} />
              </div>
              <div className="form-group">
                <label htmlFor="newsletter-content">Contenu (HTML ou Markdown)</label>
                <textarea id="newsletter-content" placeholder="Contenu de l'actualité..." rows={5} value={newsletterForm.content||''} onChange={e=>setNewsletterForm({...newsletterForm, content:e.target.value})} />
              </div>
              
              <div className="images-section">
                <div className="section-header">
                  <label>URLs d'images</label>
                  <button type="button" className="btn-add-image" onClick={addImageToNewsletter}>+ Ajouter une image</button>
                </div>
                {(newsletterForm.images || []).map((img, idx) => (
                  <div key={idx} className="image-input-row">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label htmlFor={`newsletter-image-${idx}`}>URL de l'image {idx + 1}</label>
                    <input 
                        id={`newsletter-image-${idx}`}
                        placeholder="https://exemple.com/image.jpg"
                      value={img} 
                      onChange={e => updateNewsletterImage(idx, e.target.value)} 
                    />
                    </div>
                    <button type="button" className="btn-remove" onClick={() => removeNewsletterImage(idx)} aria-label="Remove image">
                      <FaXmark />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="form-actions" style={{ gap: '12px' }}>
                <label className="checkbox-label-inline">
                  <input type="checkbox" checked={!!newsletterForm.published} onChange={e=>setNewsletterForm({...newsletterForm, published:e.target.checked})} /> 
                  Publié
                  <span className="help-text">Rendre visible sur le site</span>
                </label>
                <div className="form-group" style={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <label htmlFor="newsletter-author">Auteur</label>
                  <input
                    id="newsletter-author"
                    placeholder="Ex: IMADEL"
                    value={(newsletterForm as any).author || 'IMADEL'}
                    onChange={e=>setNewsletterForm({ ...newsletterForm, author: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ flex: '0 0 200px' }}>
                  <label htmlFor="newsletter-date-action">Date</label>
                  <input
                    type="date"
                    id="newsletter-date-action"
                    value={newsletterForm.date || ''}
                    onChange={e=>setNewsletterForm({ ...newsletterForm, date: e.target.value })}
                  />
                </div>
                <button className="btn-primary" onClick={addNewsletter}>
                  {editingNewsletterId ? 'Enregistrer l’actualité' : 'Ajouter une actualité'}
                </button>
              </div>
            </div>

            <ul className="entity-list">
              {newsletters.map(n=> (
                <li key={n.id}>
                  <div className="entity-head">
                    <strong>{n.title}</strong> 
                    <span className="badge">{n.date}</span>
                    {n.published && <span className="badge badge-success">Publié</span>}
                  </div>
                  <div className="entity-meta">{n.content?.slice(0, 100)}...</div>
                  {n.images && n.images.length > 0 && (
                    <div className="entity-images">
                      <small>{n.images.length} image(s)</small>
                    </div>
                  )}
                  <div className="entity-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNewsletterId(n.id);
                        setNewsletterForm({
                          title: n.title,
                          content: n.content,
                          published: n.published,
                          date: n.date,
                          images: n.images,
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      Éditer
                    </button>
                    <button className="btn-danger" onClick={()=>removeNewsletter(n.id)}>Supprimer</button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tab==='donations' && (
          <section className="panel">
            <h2>{t('donations')}</h2>
            {errors.donations && <p className="entity-error">{errors.donations}</p>}
            {loading.donations && <p className="entity-loading">Chargement des dons…</p>}

            <div className="donations-stats" style={{ marginBottom: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <strong>{t('totalDonations')}:</strong> {donations.length}
                </div>
                <div>
                  <strong>Réussis :</strong> {donations.filter(d => d.paymentStatus === 'success').length}
                </div>
                <div>
                  <strong>Montant total :</strong> {
                    donations
                      .filter(d => d.paymentStatus === 'success')
                      .reduce((sum, d) => sum + d.amount, 0)
                      .toLocaleString()
                  } {donations[0]?.currency || 'XOF'}
                </div>
                <div>
                  <strong>En attente :</strong> {donations.filter(d => d.paymentStatus === 'pending').length}
                </div>
              </div>
            </div>

            <ul className="entity-list">
              {donations.map(d => (
                <li key={d.id}>
                  <div className="entity-head">
                    <strong>{d.isAnonymous ? 'Anonyme' : d.donorName}</strong>
                    <span className={`badge ${d.paymentStatus === 'success' ? 'badge-success' : d.paymentStatus === 'failed' ? 'badge-danger' : 'badge-warning'}`}>
                      {d.paymentStatus}
                    </span>
                  </div>
                  <div className="entity-meta">
                    <div><strong>Montant :</strong> {d.amount.toLocaleString()} {d.currency}</div>
                    <div><strong>Email :</strong> {d.donorEmail}</div>
                    {d.donorPhone && <div><strong>Téléphone :</strong> {d.donorPhone}</div>}
                    {d.purpose && <div><strong>Objectif :</strong> {d.purpose}</div>}
                    {d.message && <div><strong>Message :</strong> {d.message}</div>}
                    <div><strong>Référence :</strong> {d.paymentReference}</div>
                    {d.paidAt && <div><strong>Payé le :</strong> {new Date(d.paidAt).toLocaleString()}</div>}
                    {d.createdAt && <div><strong>Créé le :</strong> {new Date(d.createdAt).toLocaleString()}</div>}
                  </div>
                </li>
              ))}
              {donations.length === 0 && !loading.donations && (
                <li style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  Aucun don pour le moment
                </li>
              )}
            </ul>
          </section>
        )}

        {tab==='offices' && (
          <section className="panel">
            <h2>{t('offices')}</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="office-country">Pays</label>
                <input id="office-country" placeholder="Ex: Mali" value={officeForm.country||''} onChange={e=>setOfficeForm({...officeForm, country:e.target.value})} />
              </div>
              <div className="form-group">
                <label htmlFor="office-city">Ville</label>
                <input id="office-city" placeholder="Ex: Bamako" value={officeForm.city||''} onChange={e=>setOfficeForm({...officeForm, city:e.target.value})} />
              </div>
              <div className="form-group">
                <label htmlFor="office-address">Adresse</label>
                <input id="office-address" placeholder="Ex: ACI 2000, Hamdallaye" value={officeForm.address||''} onChange={e=>setOfficeForm({...officeForm, address:e.target.value})} />
              </div>
              <div className="form-group">
                <label htmlFor="office-lat">Latitude</label>
                <input id="office-lat" type="number" placeholder="Ex: 12.65" step="any" value={officeForm.lat||'' as any} onChange={e=>setOfficeForm({...officeForm, lat: e.target.value? parseFloat(e.target.value): undefined})} />
              </div>
              <div className="form-group">
                <label htmlFor="office-lng">Longitude</label>
                <input id="office-lng" type="number" placeholder="Ex: -8.0" step="any" value={officeForm.lng||'' as any} onChange={e=>setOfficeForm({...officeForm, lng: e.target.value? parseFloat(e.target.value): undefined})} />
              </div>
              <div className="form-actions"><button onClick={addOffice}>Ajouter un bureau</button></div>
            </div>

            <ul className="entity-list">
              {offices.map(o=> (
                <li key={o.id}>
                  <div className="entity-head"><strong>{o.country}</strong> <span>{o.city}</span></div>
                  <div className="entity-meta">{o.address} {o.lat && o.lng ? `(${o.lat}, ${o.lng})` : ''}</div>
                  <div className="entity-actions"><button onClick={()=>removeOffice(o.id)}>Supprimer</button></div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tab==='data' && (
          <section className="panel">
            <h2>{t('rawData')}</h2>
            <div className="data-columns">
              <div>
                <h3>{t('projectsJson')}</h3>
                <pre className="json-block">{JSON.stringify(projects, null, 2)}</pre>
              </div>
              <div>
                <h3>{t('jobsJson')}</h3>
                <pre className="json-block">{JSON.stringify(jobs, null, 2)}</pre>
              </div>
              <div>
                <h3>{t('partnersJson')}</h3>
                <pre className="json-block">{JSON.stringify(partners, null, 2)}</pre>
              </div>
              <div>
                <h3>{t('newslettersJson')}</h3>
                <pre className="json-block">{JSON.stringify(newsletters, null, 2)}</pre>
              </div>
              <div>
                <h3>{t('officesJson')}</h3>
                <pre className="json-block">{JSON.stringify(offices, null, 2)}</pre>
              </div>
            </div>
          </section>
        )}

        {tab==='settings' && (
          <section className="panel">
            <h2>{t('settings')}</h2>
            {errors.settings && <div className="error-message">{errors.settings}</div>}
            
            <div className="form-row">
              <label className="section-label">{t('theme') || 'Theme'}</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  cursor: 'pointer', 
                  padding: '12px 16px', 
                  border: `2px solid ${(settings.theme === 'orange' || !settings.theme) ? 'var(--primary, #FF6B00)' : '#e0e0e0'}`, 
                  borderRadius: '6px', 
                  background: (settings.theme === 'orange' || !settings.theme) ? '#fff9f5' : 'white',
                  transition: 'all 0.2s ease'
                }}>
                  <input
                    type="radio"
                    name="theme"
                    value="orange"
                    checked={settings.theme === 'orange' || !settings.theme}
                    onChange={() => {
                      updateSettings({ theme: 'orange' });
                    }}
                    style={{ margin: 0, cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: '#FF6B00', border: '1px solid #ddd' }}></div>
                    <span style={{ fontWeight: 600 }}>{t('orangeTheme') || 'Orange'}</span>
                  </div>
                </label>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  cursor: 'pointer', 
                  padding: '12px 16px', 
                  border: `2px solid ${settings.theme === 'blue' ? 'var(--primary, #0066CC)' : '#e0e0e0'}`, 
                  borderRadius: '6px', 
                  background: settings.theme === 'blue' ? '#f0f7ff' : 'white',
                  transition: 'all 0.2s ease'
                }}>
                  <input
                    type="radio"
                    name="theme"
                    value="blue"
                    checked={settings.theme === 'blue'}
                    onChange={() => {
                      updateSettings({ theme: 'blue' });
                    }}
                    style={{ margin: 0, cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: '#0066CC', border: '1px solid #ddd' }}></div>
                    <span style={{ fontWeight: 600 }}>{t('blueTheme') || 'Blue'}</span>
                  </div>
                </label>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px' }}>
                {t('themeDescription') || 'Choose the primary color theme for the website. Changes will be applied immediately.'}
              </p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="section-label">{t('phoneNumber')}</label>
                <input
                  type="text"
                  value={settings.phoneNumber}
                  onChange={(e) => updateSettings({ phoneNumber: e.target.value })}
                  style={{ padding: '10px', border: '2px solid #e0e0e0', borderRadius: '6px' }}
                />
              </div>
            </div>

            <div className="form-row">
              <label className="section-label">{t('orangeMoney')} / {t('malitel')}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{t('orangeMoney')}</label>
                  <input
                    type="text"
                    value={settings.orangeMoney}
                    onChange={(e) => updateSettings({ orangeMoney: e.target.value })}
                    style={{ padding: '10px', border: '2px solid #e0e0e0', borderRadius: '6px', width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{t('malitel')}</label>
                  <input
                    type="text"
                    value={settings.malitel}
                    onChange={(e) => updateSettings({ malitel: e.target.value })}
                    style={{ padding: '10px', border: '2px solid #e0e0e0', borderRadius: '6px', width: '100%' }}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <label className="section-label">{t('bankMali')}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{t('bankName')}</label>
                  <input
                    type="text"
                    value={settings.bankMali.bankName}
                    onChange={(e) => updateBankMali({ bankName: e.target.value })}
                    style={{ padding: '10px', border: '2px solid #e0e0e0', borderRadius: '6px', width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{t('accountName')}</label>
                  <input
                    type="text"
                    value={settings.bankMali.accountName}
                    onChange={(e) => updateBankMali({ accountName: e.target.value })}
                    style={{ padding: '10px', border: '2px solid #e0e0e0', borderRadius: '6px', width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{t('accountNumber')}</label>
                  <input
                    type="text"
                    value={settings.bankMali.accountNumber}
                    onChange={(e) => updateBankMali({ accountNumber: e.target.value })}
                    style={{ padding: '10px', border: '2px solid #e0e0e0', borderRadius: '6px', width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{t('agency')}</label>
                  <input
                    type="text"
                    value={settings.bankMali.agency}
                    onChange={(e) => updateBankMali({ agency: e.target.value })}
                    style={{ padding: '10px', border: '2px solid #e0e0e0', borderRadius: '6px', width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{t('swiftCode')}</label>
                  <input
                    type="text"
                    value={settings.bankMali.swiftCode}
                    onChange={(e) => updateBankMali({ swiftCode: e.target.value })}
                    style={{ padding: '10px', border: '2px solid #e0e0e0', borderRadius: '6px', width: '100%' }}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <label className="section-label">{t('bankInternational')}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Bank Name</label>
                  <input
                    type="text"
                    value={settings.bankInternational.bankName}
                    onChange={(e) => updateBankInternational({ bankName: e.target.value })}
                    style={{ padding: '10px', border: '2px solid #e0e0e0', borderRadius: '6px', width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{t('accountName')}</label>
                  <input
                    type="text"
                    value={settings.bankInternational.accountName}
                    onChange={(e) => updateBankInternational({ accountName: e.target.value })}
                    style={{ padding: '10px', border: '2px solid #e0e0e0', borderRadius: '6px', width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{t('accountNumber')}</label>
                  <input
                    type="text"
                    value={settings.bankInternational.accountNumber}
                    onChange={(e) => updateBankInternational({ accountNumber: e.target.value })}
                    style={{ padding: '10px', border: '2px solid #e0e0e0', borderRadius: '6px', width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{t('iban')}</label>
                  <input
                    type="text"
                    value={settings.bankInternational.iban}
                    onChange={(e) => updateBankInternational({ iban: e.target.value })}
                    style={{ padding: '10px', border: '2px solid #e0e0e0', borderRadius: '6px', width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{t('swiftCode')}</label>
                  <input
                    type="text"
                    value={settings.bankInternational.swiftCode}
                    onChange={(e) => updateBankInternational({ swiftCode: e.target.value })}
                    style={{ padding: '10px', border: '2px solid #e0e0e0', borderRadius: '6px', width: '100%' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', padding: '12px', background: '#f0f9ff', borderRadius: '6px', border: '2px solid var(--primary, #FF6B00)' }}>
              <p style={{ margin: 0, color: '#1a1a2e', fontSize: '0.9rem' }}>
                <strong>{t('note')}:</strong> {t('changesSaved')}
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
