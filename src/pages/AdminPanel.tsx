import { useEffect, useState } from 'react';
import './AdminPanel.css';

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
  country: string;
  city?: string;
  address?: string;
  lat?: number;
  lng?: number;
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
};

type Job = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  applyUrl?: string;
  published?: boolean;
  images?: string[];
};

type Partner = {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  description?: string;
  images?: string[];
};

type Newsletter = {
  id: string;
  title: string;
  content?: string;
  published?: boolean;
  date?: string;
  images?: string[];
};

const AREAS_OF_INTERVENTION = [
  "Rural and urban hydraulics",
  "Decentralization",
  "Hygiene/sanitation",
  "Education",
  "Formation",
  "Advocacy/lobbying",
  "Environment",
  "Health",
  "Local development"
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
};

function uid(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default function AdminPanel() {
  const [tab, setTab] = useState<'offices'|'projects'|'jobs'|'partners'|'newsletters'|'data'>('projects');

  const [authenticated, setAuthenticated] = useState<boolean>(() => {
    try { return localStorage.getItem(STORAGE.AUTH) === '1'; } catch { return false; }
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authenticated) {
      window.location.href = '/admin';
    }
  }, [authenticated]);

  const logout = () => {
    // TODO: Call backend logout API to invalidate session/token
    // await fetch('/api/auth/logout', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    try { localStorage.removeItem(STORAGE.AUTH); } catch {}
    setAuthenticated(false);
    window.location.href = '/admin'; // Redirect to login page
  };

  // Offices
  // TODO: Replace with API call - GET /api/offices
  const [offices, setOffices] = useState<Office[]>([]);
  useEffect(()=>{
    try { const raw = localStorage.getItem(STORAGE.OFFICES); if (raw) setOffices(JSON.parse(raw)); } catch {}
    // Replace with: const fetchOffices = async () => { const res = await fetch('/api/offices'); const data = await res.json(); setOffices(data); };
  }, []);
  useEffect(()=>{ try { localStorage.setItem(STORAGE.OFFICES, JSON.stringify(offices)); window.dispatchEvent(new CustomEvent('imadel:offices:updated')); } catch {} }, [offices]);

  // Projects
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(()=>{ try { const raw = localStorage.getItem(STORAGE.PROJECTS); if (raw) setProjects(JSON.parse(raw)); } catch {} }, []);
  useEffect(()=>{ try { localStorage.setItem(STORAGE.PROJECTS, JSON.stringify(projects)); window.dispatchEvent(new CustomEvent('imadel:projects:updated')); } catch {} }, [projects]);

  // Jobs
  const [jobs, setJobs] = useState<Job[]>([]);
  useEffect(()=>{ try { const raw = localStorage.getItem(STORAGE.JOBS); if (raw) setJobs(JSON.parse(raw)); } catch {} }, []);
  useEffect(()=>{ try { localStorage.setItem(STORAGE.JOBS, JSON.stringify(jobs)); window.dispatchEvent(new CustomEvent('imadel:jobs:updated')); } catch {} }, [jobs]);

  // Partners
  const [partners, setPartners] = useState<Partner[]>([]);
  useEffect(()=>{ try { const raw = localStorage.getItem(STORAGE.PARTNERS); if (raw) setPartners(JSON.parse(raw)); } catch {} }, []);
  useEffect(()=>{ try { localStorage.setItem(STORAGE.PARTNERS, JSON.stringify(partners)); window.dispatchEvent(new CustomEvent('imadel:partners:updated')); } catch {} }, [partners]);

  // Newsletters
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  useEffect(()=>{ try { const raw = localStorage.getItem(STORAGE.NEWSLETTERS); if (raw) setNewsletters(JSON.parse(raw)); } catch {} }, []);
  useEffect(()=>{ try { localStorage.setItem(STORAGE.NEWSLETTERS, JSON.stringify(newsletters)); window.dispatchEvent(new CustomEvent('imadel:newsletters:updated')); } catch {} }, [newsletters]);

  // Forms state
  const [officeForm, setOfficeForm] = useState<Partial<Office>>({});
  const [projectForm, setProjectForm] = useState<Partial<Project>>({ published: false, areasOfIntervention: [] });
  const [jobForm, setJobForm] = useState<Partial<Job>>({ published: false });
  const [partnerForm, setPartnerForm] = useState<Partial<Partner>>({});
  const [newsletterForm, setNewsletterForm] = useState<Partial<Newsletter>>({ published: false });

  const addOffice = () => {
    if (!authenticated) { alert('Please log in'); return; }
    const id = uid('office_');
    setOffices([...offices, { id, country: officeForm.country||'', city: officeForm.city, address: officeForm.address, lat: officeForm.lat, lng: officeForm.lng } as Office]);
    setOfficeForm({});
  };
  const removeOffice = (id: string) => { if (!authenticated) { alert('Please log in'); return; } setOffices(offices.filter(o=>o.id!==id)); };

  const addProject = () => {
    if (!authenticated) { alert('Please log in'); return; }
    if (!projectForm.title) { alert('Title is required'); return; }
    const id = uid('proj_');
    setProjects([...projects, { id, title: projectForm.title!, summary: projectForm.summary, content: projectForm.content, country: projectForm.country, published: !!projectForm.published, images: projectForm.images || [], areasOfIntervention: projectForm.areasOfIntervention || [] }]);
    setProjectForm({ published: false, areasOfIntervention: [] });
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
  const removeProject = (id: string) => { if (!authenticated) { alert('Please log in'); return; } setProjects(projects.filter(p=>p.id!==id)); };

  const addJob = () => {
    if (!authenticated) { alert('Please log in'); return; }
    if (!jobForm.title) { alert('Job title required'); return; }
    const id = uid('job_');
    setJobs([...jobs, { id, title: jobForm.title!, description: jobForm.description, location: jobForm.location, applyUrl: jobForm.applyUrl, published: !!jobForm.published, images: jobForm.images || [] }]);
    setJobForm({ published: false });
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
  const removeJob = (id: string) => { if (!authenticated) { alert('Please log in'); return; } setJobs(jobs.filter(j=>j.id!==id)); };

  const addPartner = () => {
    if (!authenticated) { alert('Please log in'); return; }
    if (!partnerForm.name) { alert('Partner name required'); return; }
    const id = uid('partner_');
    setPartners([...partners, { id, name: partnerForm.name!, logo: partnerForm.logo, website: partnerForm.website, description: partnerForm.description, images: partnerForm.images || [] }]);
    setPartnerForm({});
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
  const removePartner = (id: string) => { if (!authenticated) { alert('Please log in'); return; } setPartners(partners.filter(p=>p.id!==id)); };

  const addNewsletter = () => {
    if (!authenticated) { alert('Please log in'); return; }
    if (!newsletterForm.title) { alert('Newsletter title required'); return; }
    const id = uid('newsletter_');
    setNewsletters([...newsletters, { id, title: newsletterForm.title!, content: newsletterForm.content, published: !!newsletterForm.published, date: newsletterForm.date || new Date().toISOString().split('T')[0], images: newsletterForm.images || [] }]);
    setNewsletterForm({ published: false });
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
  const removeNewsletter = (id: string) => { if (!authenticated) { alert('Please log in'); return; } setNewsletters(newsletters.filter(n=>n.id!==id)); };

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
          <img src="/src/assets/cropped-nouveau_logo.png" alt="IMADEL Logo" style={{height: '40px', width: 'auto'}} />
          <h1>Admin Panel</h1>
        </div>
        <div className="admin-controls">
          <button onClick={logout}>Log out</button>
          <button onClick={exportAll}>Export JSON</button>
          <label className="import-label">
            Import JSON
            <input type="file" accept="application/json" onChange={e=>importJson(e.target.files?.[0]||null)} />
          </label>
        </div>
      </header>

      <nav className="admin-tabs">
        <button className={tab==='projects'?'active':''} onClick={()=>setTab('projects')}>Projects</button>
        <button className={tab==='jobs'?'active':''} onClick={()=>setTab('jobs')}>Jobs</button>
        <button className={tab==='partners'?'active':''} onClick={()=>setTab('partners')}>Partners</button>
        <button className={tab==='newsletters'?'active':''} onClick={()=>setTab('newsletters')}>Newsletters</button>
        <button className={tab==='offices'?'active':''} onClick={()=>setTab('offices')}>Offices</button>
        <button className={tab==='data'?'active':''} onClick={()=>setTab('data')}>Data</button>
      </nav>

      <main className="admin-main">
        {tab==='projects' && (
          <section className="panel">
            <h2>Projects</h2>
            <div className="form-row">
              <input placeholder="Title *" value={projectForm.title||''} onChange={e=>setProjectForm({...projectForm, title:e.target.value})} />
              <input placeholder="Country" value={projectForm.country||''} onChange={e=>setProjectForm({...projectForm, country:e.target.value})} />
              <textarea placeholder="Summary" rows={3} value={projectForm.summary||''} onChange={e=>setProjectForm({...projectForm, summary:e.target.value})} />
              <textarea placeholder="Content (HTML or Markdown)" rows={5} value={projectForm.content||''} onChange={e=>setProjectForm({...projectForm, content:e.target.value})} />
              
              <div className="areas-section">
                <label className="section-label">Areas of Intervention (Select Multiple)</label>
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
                  <label>Image URLs</label>
                  <button type="button" className="btn-add-image" onClick={addImageToProject}>+ Add Image</button>
                </div>
                {(projectForm.images || []).map((img, idx) => (
                  <div key={idx} className="image-input-row">
                    <input 
                      placeholder={`Image URL ${idx + 1}`} 
                      value={img} 
                      onChange={e => updateProjectImage(idx, e.target.value)} 
                    />
                    <button type="button" className="btn-remove" onClick={() => removeProjectImage(idx)}>✕</button>
                  </div>
                ))}
              </div>
              
              <div className="form-actions">
                <label className="checkbox-label-inline">
                  <input type="checkbox" checked={!!projectForm.published} onChange={e=>setProjectForm({...projectForm, published:e.target.checked})} /> 
                  Published
                  <span className="help-text">Make visible on website</span>
                </label>
                <button className="btn-primary" onClick={addProject}>Add Project</button>
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
                      <small><strong>Areas:</strong> {p.areasOfIntervention.join(', ')}</small>
                    </div>
                  )}
                  {p.images && p.images.length > 0 && (
                    <div className="entity-images">
                      <small>{p.images.length} image(s)</small>
                    </div>
                  )}
                  <div className="entity-actions">
                    <button className="btn-danger" onClick={()=>removeProject(p.id)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tab==='jobs' && (
          <section className="panel">
            <h2>Jobs</h2>
            <div className="form-row">
              <input placeholder="Job title *" value={jobForm.title||''} onChange={e=>setJobForm({...jobForm, title:e.target.value})} />
              <input placeholder="Location" value={jobForm.location||''} onChange={e=>setJobForm({...jobForm, location:e.target.value})} />
              <input placeholder="Apply URL" value={jobForm.applyUrl||''} onChange={e=>setJobForm({...jobForm, applyUrl:e.target.value})} />
              <textarea placeholder="Description" rows={5} value={jobForm.description||''} onChange={e=>setJobForm({...jobForm, description:e.target.value})} />
              
              <div className="images-section">
                <div className="section-header">
                  <label>Image URLs</label>
                  <button type="button" className="btn-add-image" onClick={addImageToJob}>+ Add Image</button>
                </div>
                {(jobForm.images || []).map((img, idx) => (
                  <div key={idx} className="image-input-row">
                    <input 
                      placeholder={`Image URL ${idx + 1}`} 
                      value={img} 
                      onChange={e => updateJobImage(idx, e.target.value)} 
                    />
                    <button type="button" className="btn-remove" onClick={() => removeJobImage(idx)}>✕</button>
                  </div>
                ))}
              </div>
              
              <div className="form-actions">
                <label className="checkbox-label-inline">
                  <input type="checkbox" checked={!!jobForm.published} onChange={e=>setJobForm({...jobForm, published:e.target.checked})} /> 
                  Published
                  <span className="help-text">Make visible on website</span>
                </label>
                <button className="btn-primary" onClick={addJob}>Add Job</button>
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
                    <a href={j.applyUrl||'#'} target="_blank" rel="noreferrer">Apply</a> 
                    <button className="btn-danger" onClick={()=>removeJob(j.id)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tab==='partners' && (
          <section className="panel">
            <h2>Partners</h2>
            <div className="form-row">
              <input placeholder="Partner name *" value={partnerForm.name||''} onChange={e=>setPartnerForm({...partnerForm, name:e.target.value})} />
              <input placeholder="Logo URL" value={partnerForm.logo||''} onChange={e=>setPartnerForm({...partnerForm, logo:e.target.value})} />
              <input placeholder="Website URL" value={partnerForm.website||''} onChange={e=>setPartnerForm({...partnerForm, website:e.target.value})} />
              <textarea placeholder="Description" rows={3} value={partnerForm.description||''} onChange={e=>setPartnerForm({...partnerForm, description:e.target.value})} />
              
              <div className="images-section">
                <div className="section-header">
                  <label>Additional Image URLs</label>
                  <button type="button" className="btn-add-image" onClick={addImageToPartner}>+ Add Image</button>
                </div>
                {(partnerForm.images || []).map((img, idx) => (
                  <div key={idx} className="image-input-row">
                    <input 
                      placeholder={`Image URL ${idx + 1}`} 
                      value={img} 
                      onChange={e => updatePartnerImage(idx, e.target.value)} 
                    />
                    <button type="button" className="btn-remove" onClick={() => removePartnerImage(idx)}>✕</button>
                  </div>
                ))}
              </div>
              
              <div className="form-actions">
                <button className="btn-primary" onClick={addPartner}>Add Partner</button>
              </div>
            </div>

            <ul className="entity-list">
              {partners.map(p=> (
                <li key={p.id}>
                  <div className="entity-head"><strong>{p.name}</strong></div>
                  <div className="entity-meta">{p.description}</div>
                  {p.images && p.images.length > 0 && (
                    <div className="entity-images">
                      <small>{p.images.length} additional image(s)</small>
                    </div>
                  )}
                  <div className="entity-actions">
                    <a href={p.website||'#'} target="_blank" rel="noreferrer">Website</a> 
                    <button className="btn-danger" onClick={()=>removePartner(p.id)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tab==='newsletters' && (
          <section className="panel">
            <h2>Newsletters</h2>
            <div className="form-row">
              <input placeholder="Title *" value={newsletterForm.title||''} onChange={e=>setNewsletterForm({...newsletterForm, title:e.target.value})} />
              <input type="date" placeholder="Date" value={newsletterForm.date||''} onChange={e=>setNewsletterForm({...newsletterForm, date:e.target.value})} />
              <textarea placeholder="Content (HTML or Markdown)" rows={5} value={newsletterForm.content||''} onChange={e=>setNewsletterForm({...newsletterForm, content:e.target.value})} />
              
              <div className="images-section">
                <div className="section-header">
                  <label>Image URLs</label>
                  <button type="button" className="btn-add-image" onClick={addImageToNewsletter}>+ Add Image</button>
                </div>
                {(newsletterForm.images || []).map((img, idx) => (
                  <div key={idx} className="image-input-row">
                    <input 
                      placeholder={`Image URL ${idx + 1}`} 
                      value={img} 
                      onChange={e => updateNewsletterImage(idx, e.target.value)} 
                    />
                    <button type="button" className="btn-remove" onClick={() => removeNewsletterImage(idx)}>✕</button>
                  </div>
                ))}
              </div>
              
              <div className="form-actions">
                <label className="checkbox-label-inline">
                  <input type="checkbox" checked={!!newsletterForm.published} onChange={e=>setNewsletterForm({...newsletterForm, published:e.target.checked})} /> 
                  Published
                  <span className="help-text">Make visible on website</span>
                </label>
                <button className="btn-primary" onClick={addNewsletter}>Add Newsletter</button>
              </div>
            </div>

            <ul className="entity-list">
              {newsletters.map(n=> (
                <li key={n.id}>
                  <div className="entity-head">
                    <strong>{n.title}</strong> 
                    <span className="badge">{n.date}</span>
                    {n.published && <span className="badge badge-success">Published</span>}
                  </div>
                  <div className="entity-meta">{n.content?.slice(0, 100)}...</div>
                  {n.images && n.images.length > 0 && (
                    <div className="entity-images">
                      <small>{n.images.length} image(s)</small>
                    </div>
                  )}
                  <div className="entity-actions">
                    <button className="btn-danger" onClick={()=>removeNewsletter(n.id)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tab==='offices' && (
          <section className="panel">
            <h2>Offices</h2>
            <div className="form-row">
              <input placeholder="Country" value={officeForm.country||''} onChange={e=>setOfficeForm({...officeForm, country:e.target.value})} />
              <input placeholder="City" value={officeForm.city||''} onChange={e=>setOfficeForm({...officeForm, city:e.target.value})} />
              <input placeholder="Address" value={officeForm.address||''} onChange={e=>setOfficeForm({...officeForm, address:e.target.value})} />
              <input placeholder="Latitude" type="number" value={officeForm.lat||'' as any} onChange={e=>setOfficeForm({...officeForm, lat: e.target.value? parseFloat(e.target.value): undefined})} />
              <input placeholder="Longitude" type="number" value={officeForm.lng||'' as any} onChange={e=>setOfficeForm({...officeForm, lng: e.target.value? parseFloat(e.target.value): undefined})} />
              <div className="form-actions"><button onClick={addOffice}>Add office</button></div>
            </div>

            <ul className="entity-list">
              {offices.map(o=> (
                <li key={o.id}>
                  <div className="entity-head"><strong>{o.country}</strong> <span>{o.city}</span></div>
                  <div className="entity-meta">{o.address} {o.lat && o.lng ? `(${o.lat}, ${o.lng})` : ''}</div>
                  <div className="entity-actions"><button onClick={()=>removeOffice(o.id)}>Remove</button></div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tab==='data' && (
          <section className="panel">
            <h2>Raw Data</h2>
            <div className="data-columns">
              <div>
                <h3>Projects JSON</h3>
                <pre className="json-block">{JSON.stringify(projects, null, 2)}</pre>
              </div>
              <div>
                <h3>Jobs JSON</h3>
                <pre className="json-block">{JSON.stringify(jobs, null, 2)}</pre>
              </div>
              <div>
                <h3>Partners JSON</h3>
                <pre className="json-block">{JSON.stringify(partners, null, 2)}</pre>
              </div>
              <div>
                <h3>Newsletters JSON</h3>
                <pre className="json-block">{JSON.stringify(newsletters, null, 2)}</pre>
              </div>
              <div>
                <h3>Offices JSON</h3>
                <pre className="json-block">{JSON.stringify(offices, null, 2)}</pre>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
