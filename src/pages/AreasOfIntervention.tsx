import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AreasOfIntervention.css';

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

  // TODO: Replace with API call - GET /api/projects?published=true
  useEffect(() => {
    try {
      const raw = localStorage.getItem('imadel_admin_projects');
      if (raw) {
        const allProjects = JSON.parse(raw) as Project[];
        const publishedProjects = allProjects.filter(p => p.published);
        setProjects(publishedProjects);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
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

