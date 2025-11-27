import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AreasOfIntervention.css';
import { projectsApi } from '../services/api';

interface Project {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  country?: string;
  published?: boolean;
  images?: string[];
  areasOfIntervention?: string[];
}

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

const AREA_ICONS: { [key: string]: string } = {
  "Rural and urban hydraulics": "💧",
  "Decentralization": "🏛️",
  "Hygiene/sanitation": "🧼",
  "Education": "📚",
  "Formation": "🎓",
  "Advocacy/lobbying": "📢",
  "Environment": "🌱",
  "Health": "⚕️",
  "Local development": "🏘️"
};

export default function AreasOfIntervention() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  // Load projects from API
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await projectsApi.getAll({ published: true });

        const rawProjects =
          (response as any).projects ||
          (response as any).data ||
          response;

        if (response.success !== false && Array.isArray(rawProjects)) {
          const publishedProjects = rawProjects.map((p: any) => ({
            id: p._id || p.id,
            title: p.title,
            summary: p.description || '',
            content: p.fullDescription || '',
            country: p.location || '',
            published: p.published,
            images: p.images && p.images.length > 0 
              ? p.images.map((img: any) => img.url || img)
              : [],
            // Note: Backend may need to be updated to support areasOfIntervention field
            areasOfIntervention: p.areasOfIntervention || p.category ? [p.category] : []
          })) as Project[];
          
          setProjects(publishedProjects);
        }
      } catch (error) {
        console.error('Error loading projects from API:', error);
        // Do not fall back to localStorage – show only live backend data
        setProjects([]);
      }
    };

    loadProjects();
  }, []);

  const getProjectsByArea = (area: string) => {
    return projects.filter(p => p.areasOfIntervention?.includes(area));
  };

  const filteredProjects = selectedArea ? getProjectsByArea(selectedArea) : [];

  return (
    <div className="areas-page">
      {/* Hero Section */}
      <section className="areas-hero">
        <div className="container">
          <h1>Our Areas of Intervention</h1>
          <p>Discover the diverse fields where IMADEL makes a lasting impact in communities across Mali</p>
        </div>
      </section>

      {/* Areas Grid */}
      <section className="areas-section">
        <div className="container">
          <div className="areas-grid">
            {AREAS_OF_INTERVENTION.map(area => {
              const projectCount = getProjectsByArea(area).length;
              return (
                <div 
                  key={area}
                  className={`area-card ${selectedArea === area ? 'active' : ''}`}
                  onClick={() => setSelectedArea(selectedArea === area ? null : area)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedArea(selectedArea === area ? null : area);
                    }
                  }}
                >
                  <div className="area-icon">{AREA_ICONS[area] || "📌"}</div>
                  <h3>{area}</h3>
                  <p className="project-count">{projectCount} Project{projectCount !== 1 ? 's' : ''}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      {selectedArea && (
        <section className="projects-section">
          <div className="container">
            <div className="section-header">
              <h2>Projects in {selectedArea}</h2>
              <button 
                className="btn-clear"
                onClick={() => setSelectedArea(null)}
              >
                Clear Filter
              </button>
            </div>
            
            {filteredProjects.length === 0 ? (
              <div className="no-projects">
                <p>No published projects yet in this area.</p>
              </div>
            ) : (
              <div className="projects-grid">
                {filteredProjects.map(project => (
                  <Link 
                    to={`/project/${project.id}`} 
                    key={project.id}
                    className="project-card"
                  >
                    {project.images && project.images[0] && (
                      <div className="project-image">
                        <img src={project.images[0]} alt={project.title} />
                      </div>
                    )}
                    <div className="project-content">
                      <h3>{project.title}</h3>
                      {project.summary && <p>{project.summary}</p>}
                      {project.country && (
                        <span className="project-location">📍 {project.country}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

