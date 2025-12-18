import React, { useState, useEffect } from 'react';
import './OurWork.css';
import { Link, useSearchParams } from "react-router-dom";
import { projectsApi } from '../services/api';
import ResponsiveImage from '../components/ResponsiveImage';
import { apiCache } from '../utils/cache';

const AREAS_OF_INTERVENTION = [
  "Eaux, Hygiène et Assainissement",
  "Décentralisation",
  "Éducation",
  "Renforcement de capacités",
  "Plaidoyer/Lobbyisme",
  "Environnement",
  "Santé et Nutrition",
  "Services Sociaux et Résilience",
  "Protection",
];

// Mapping between different possible area name formats
const AREA_NAME_MAPPINGS: Record<string, string> = {
  // French / English variations for new standard labels
  'eaux, hygiene et assainissement': 'Eaux, Hygiène et Assainissement',
  'hydraulique rurale et urbaine': 'Eaux, Hygiène et Assainissement',
  'rural and urban hydraulics': 'Eaux, Hygiène et Assainissement',
  'hygiene/sanitation': 'Eaux, Hygiène et Assainissement',
  'hygiène/assainissement': 'Eaux, Hygiène et Assainissement',

  'decentralisation': 'Décentralisation',
  'décentralisation': 'Décentralisation',
  'decentralization': 'Décentralisation',

  'education': 'Éducation',
  'éducation': 'Éducation',

  'formation': 'Renforcement de capacités',
  'training': 'Renforcement de capacités',
  'renforcement de capacites': 'Renforcement de capacités',

  'plaidoyer/lobbyisme': 'Plaidoyer/Lobbyisme',
  'advocacy/lobbying': 'Plaidoyer/Lobbyisme',

  'environnement': 'Environnement',
  'environment': 'Environnement',

  'sante': 'Santé et Nutrition',
  'santé': 'Santé et Nutrition',
  'health': 'Santé et Nutrition',
  'nutrition': 'Santé et Nutrition',

  'developpement local': 'Services Sociaux et Résilience',
  'développement local': 'Services Sociaux et Résilience',
  'local development': 'Services Sociaux et Résilience',
  'services sociaux et resilience': 'Services Sociaux et Résilience',

  'protection': 'Protection',
};

// Normalize area name (remove accents, lowercase, trim)
const normalizeAreaName = (name: string): string => {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove accents
};

type SortOption = 'newest' | 'oldest' | 'a-z' | 'z-a';
type StatusFilter = 'all' | 'current' | 'completed';

// Helper function to extract areas from a project
const getProjectAreas = (project: any): string[] => {
  // Check if areasOfIntervention exists and is an array
  if (Array.isArray(project.areasOfIntervention) && project.areasOfIntervention.length > 0) {
    // Map each area to the standard French name
    return project.areasOfIntervention.map((area: string) => {
      const normalized = normalizeAreaName(area);
      // Check direct mapping first
      if (AREA_NAME_MAPPINGS[normalized]) {
        return AREA_NAME_MAPPINGS[normalized];
      }
      // Check if it matches any area in our list
      const match = AREAS_OF_INTERVENTION.find(a => normalizeAreaName(a) === normalized);
      if (match) {
        return match;
      }
      // Return as-is if no match
      return area;
    });
  }
  
  // If category exists, map it to areasOfIntervention format
  if (project.category) {
    const categoryNormalized = normalizeAreaName(project.category);
    
    // Special case for news
    if (categoryNormalized === 'news' || categoryNormalized === 'actualités') {
      return ['Actualités'];
    }
    
    // Try to find a match in mappings
    if (AREA_NAME_MAPPINGS[categoryNormalized]) {
      return [AREA_NAME_MAPPINGS[categoryNormalized]];
    }
    
    // Try to match category to an area name (case-insensitive, accent-insensitive)
    const categoryMatch = AREAS_OF_INTERVENTION.find(area => {
      return normalizeAreaName(area) === categoryNormalized;
    });
    
    if (categoryMatch) {
      return [categoryMatch];
    } else {
      // Return the category as-is if no match found
      return [project.category];
    }
  }
  
  return [];
};

const OurWork: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const itemsPerPage = 9;

  // Get area, status, and sort from URL parameters on mount and when they change
  useEffect(() => {
    const areaParam = searchParams.get('area');
    const statusParam = searchParams.get('status') as StatusFilter;
    const sortParam = searchParams.get('sort') as SortOption;
    
    if (areaParam) {
      const decodedArea = decodeURIComponent(areaParam);
      if (decodedArea !== selectedArea) {
        setSelectedArea(decodedArea);
        setCurrentPage(1);
      }
    } else if (selectedArea) {
      setSelectedArea(null);
      setCurrentPage(1);
    }
    
    if (statusParam && ['all', 'current', 'completed'].includes(statusParam)) {
      setSelectedStatus(statusParam);
      setCurrentPage(1);
    } else if (!statusParam) {
      setSelectedStatus('all');
    }
    
    if (sortParam && ['newest', 'oldest', 'a-z', 'z-a'].includes(sortParam)) {
      setSortBy(sortParam);
    }
  }, [searchParams]);

  // Load projects from API
  useEffect(() => {
    const loadProjects = async () => {
      try {
        // Check cache first
        const cacheKey = `projects-ourwork-${selectedArea || 'all'}-${selectedStatus}-${sortBy}`;
        const cached = apiCache.get<any[]>(cacheKey);
        if (cached) {
          setProjects(cached);
          return;
        }

        const response = await projectsApi.getAll({ published: true });

        // Support multiple possible response shapes: { projects }, { data: [...] }, or direct array
        const rawProjects =
          (response as any).projects ||
          (response as any).data ||
          response;

        if (response.success !== false && Array.isArray(rawProjects)) {
          // Process projects (filter and sort)
          let processedProjects = rawProjects;
          
          // Filter by status first
          if (selectedStatus !== 'all') {
            processedProjects = processedProjects.filter((p: any) => {
              const projectStatus = p.category || p.status || 'current';
              return projectStatus === selectedStatus;
            });
          }
          
          // Filter by selected area if one is selected
          if (selectedArea) {
            const normalizedSelectedArea = normalizeAreaName(selectedArea);
            
            processedProjects = rawProjects.filter((p: any) => {
              const areas = getProjectAreas(p);
              
              // Normalize area names for comparison (accent-insensitive, case-insensitive)
              const matches = areas.some(area => {
                const normalizedArea = normalizeAreaName(area);
                return normalizedArea === normalizedSelectedArea;
              });
              
              return matches;
            });
          }

          // Sort projects
          processedProjects = [...processedProjects].sort((a: any, b: any) => {
            switch (sortBy) {
              case 'newest':
                // Try multiple date fields: createdAt, updatedAt, date, startDate
                const getDateA = (a.createdAt || a.updatedAt || a.date || a.startDate || 0);
                const getDateB = (b.createdAt || b.updatedAt || b.date || b.startDate || 0);
                const dateA = new Date(getDateA).getTime();
                const dateB = new Date(getDateB).getTime();
                // If dates are invalid, put them at the end
                if (isNaN(dateA) && isNaN(dateB)) return 0;
                if (isNaN(dateA)) return 1;
                if (isNaN(dateB)) return -1;
                return dateB - dateA; // Newest first
              case 'oldest':
                const getDateAOld = (a.createdAt || a.updatedAt || a.date || a.startDate || 0);
                const getDateBOld = (b.createdAt || b.updatedAt || b.date || b.startDate || 0);
                const dateAOld = new Date(getDateAOld).getTime();
                const dateBOld = new Date(getDateBOld).getTime();
                // If dates are invalid, put them at the end
                if (isNaN(dateAOld) && isNaN(dateBOld)) return 0;
                if (isNaN(dateAOld)) return 1;
                if (isNaN(dateBOld)) return -1;
                return dateAOld - dateBOld; // Oldest first
              case 'a-z':
                return (a.title || '').localeCompare(b.title || '', 'fr');
              case 'z-a':
                return (b.title || '').localeCompare(a.title || '', 'fr');
              default:
                return 0;
            }
          });

          const mappedProjects = processedProjects.map((p: any) => ({
            id: p._id || p.id,
            title: p.title,
            description: p.description || p.fullDescription || '',
            images: p.images && p.images.length > 0 
              ? p.images.map((img: any) => img.url || img)
              : ['https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop'],
            country: p.location || 'Mali',
            areasOfIntervention: getProjectAreas(p), // Use extracted areas
            createdAt: p.createdAt,
            updatedAt: p.updatedAt
          }));

          setProjects(mappedProjects);
        }
      } catch (error) {
        console.error('Error loading projects from API:', error);
        // Do not fall back to localStorage – show only live backend data
        setProjects([]);
      }
    };

    loadProjects();

    // Listen for updates from admin panel
    const handleUpdate = () => loadProjects();
    window.addEventListener('imadel:projects:updated', handleUpdate);

    return () => {
      window.removeEventListener('imadel:projects:updated', handleUpdate);
    };
  }, [selectedArea, selectedStatus, sortBy]);

  // Handle area filter change
  const handleAreaFilter = (area: string | null) => {
    setSelectedArea(area);
    setCurrentPage(1);
    const params: any = {};
    if (area) params.area = encodeURIComponent(area);
    if (selectedStatus !== 'all') params.status = selectedStatus;
    if (sortBy !== 'newest') params.sort = sortBy;
    setSearchParams(params);
  };

  // Handle status filter change
  const handleStatusFilter = (status: StatusFilter) => {
    setSelectedStatus(status);
    setCurrentPage(1);
    const params: any = {};
    if (selectedArea) params.area = encodeURIComponent(selectedArea);
    if (status !== 'all') params.status = status;
    if (sortBy !== 'newest') params.sort = sortBy;
    setSearchParams(params);
  };

  // Handle sort change
  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setCurrentPage(1);
    const params: any = {};
    if (selectedArea) params.area = encodeURIComponent(selectedArea);
    if (selectedStatus !== 'all') params.status = selectedStatus;
    if (sort !== 'newest') params.sort = sort;
    setSearchParams(params);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedArea(null);
    setSelectedStatus('all');
    setSortBy('newest');
    setCurrentPage(1);
    setSearchParams({});
  };

  const totalPages = Math.ceil(projects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = projects.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of projects section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="our-work-page">
      {/* Intro Section */}
      <section className="intro" aria-labelledby="intro-heading">
        <div className="container">
          <h1 id="intro-heading">Nos Projets</h1>
          <p>
            Découvrez les projets impactants qu'IMADEL a entrepris à travers le Mali,
            se concentrant sur le développement durable, l'autonomisation des communautés et l'aide humanitaire.
          </p>
          
          {/* Filters and Sort Section */}
          <div className="filters-section">
            <div className="filters-row">
              <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
              >
                <option value="newest">Plus récents</option>
                <option value="oldest">Plus anciens</option>
                <option value="a-z">A-Z</option>
                <option value="z-a">Z-A</option>
              </select>

              <select
                className="filter-select"
                value={selectedStatus}
                onChange={(e) => handleStatusFilter(e.target.value as StatusFilter)}
              >
                <option value="all">Tous les statuts</option>
                <option value="current">En cours</option>
                <option value="completed">Terminés</option>
              </select>

              <select
                className="filter-select"
                value={selectedArea || ''}
                onChange={(e) => handleAreaFilter(e.target.value || null)}
              >
                <option value="">Tous les domaines</option>
                {AREAS_OF_INTERVENTION.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>

              {(selectedArea || selectedStatus !== 'all' || sortBy !== 'newest') && (
                <button
                  className="clear-filters-btn"
                  onClick={handleClearFilters}
                  aria-label="Effacer les filtres"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <p className="project-count">
            {projects.length} projet{projects.length !== 1 ? 's' : ''} trouvé{projects.length !== 1 ? 's' : ''}
            {selectedArea && ` dans "${selectedArea}"`}
          </p>
        </div>
      </section>

      {/* Projects Section */}
      <section className="projects" aria-labelledby="projects-heading">
        <div className="container">
          <h2 id="projects-heading" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', borderWidth: 0 }}>Liste des Projets</h2>
          <div className="projects-grid" role="list" aria-label="Liste des projets">
            {currentProjects.map((project) => (
              <article key={project.id} className="project-card-wrapper" role="listitem">
                <Link 
                  to={`/projet/${project.id}`} 
                  className="project-card-link"
                  aria-label={`Voir les détails pour ${project.title}`}
                >
                  <div className="project-card">
                    <div className="project-image-container">
                      <ResponsiveImage
                        src={project.images[0] || '/placeholder-image.jpg'}
                        alt={project.title}
                        className="project-image"
                        aspectRatio="wide"
                        size="medium"
                        loading="lazy"
                        objectFit="cover"
                      />
                      <div className="project-image-overlay"></div>
                      <div className="project-image-content">
                      <h3>{project.title}</h3>
                      <span className="read-more" aria-hidden="true">
                          LIRE PLUS →
                      </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="page-navigation" aria-label="Pagination des projets">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="pagination-button"
                aria-label="Page précédente"
              >
                Précédent
              </button>

              <div className="page-numbers" role="list" aria-label="Numéros de page">
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="page-ellipsis" aria-hidden="true">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page as number)}
                      className={`page-number ${currentPage === page ? 'active' : ''}`}
                      aria-label={`Aller à la page ${page}`}
                      aria-current={currentPage === page ? 'page' : undefined}
                      role="listitem"
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="pagination-button"
                aria-label="Page suivante"
              >
                Suivant
              </button>
            </nav>
          )}
        </div>
      </section>

      {/* Call To Action Section */}
      <section className="cta" aria-labelledby="cta-heading">
        <div className="container">
          <h2 id="cta-heading">Impliquez-vous dans notre mission</h2>
          <p>Rejoignez-nous pour faire la différence dans les communautés à travers le Mali</p>
          <Link to="/s-engager" className="cta-button">
            S'impliquer
          </Link>
        </div>
      </section>
    </div>
  );
};

export default OurWork;
