import React, { useState, useRef, useEffect } from 'react';
import './OurWork.css';
import { Link, useSearchParams } from "react-router-dom";
import { projectsApi } from '../services/api';

// Lazy Image Component with Intersection Observer
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className, width = 300, height = 200 }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="lazy-image-wrapper" ref={containerRef}>
      {!isLoaded && <div className="image-placeholder" aria-hidden="true" />}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={className}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={(e) => {
            // Hide broken images
            (e.target as HTMLImageElement).style.display = 'none';
          }}
          style={{ opacity: isLoaded ? 1 : 0 }}
        />
      )}
    </div>
  );
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

// Mapping between different possible area name formats
const AREA_NAME_MAPPINGS: Record<string, string> = {
  // French variations
  'décentralisation': 'Décentralisation',
  'decentralisation': 'Décentralisation',
  'Décentralisation': 'Décentralisation',
  'Decentralisation': 'Décentralisation',
  // English variations
  'decentralization': 'Décentralisation',
  'Decentralization': 'Décentralisation',
  // Other areas
  'hydraulique rurale et urbaine': 'Hydraulique rurale et urbaine',
  'rural and urban hydraulics': 'Hydraulique rurale et urbaine',
  'hygiène/assainissement': 'Hygiène/Assainissement',
  'hygiene/sanitation': 'Hygiène/Assainissement',
  'éducation': 'Éducation',
  'education': 'Éducation',
  'formation': 'Formation',
  'training': 'Formation',
  'plaidoyer/lobbyisme': 'Plaidoyer/Lobbyisme',
  'advocacy/lobbying': 'Plaidoyer/Lobbyisme',
  'environnement': 'Environnement',
  'environment': 'Environnement',
  'santé': 'Santé',
  'health': 'Santé',
  'développement local': 'Développement local',
  'local development': 'Développement local',
  'actualités': 'Actualités',
  'news': 'Actualités',
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
type StatusFilter = 'all' | 'current' | 'completed' | 'news';

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
  const [allProjects, setAllProjects] = useState<any[]>([]);
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
    
    if (statusParam && ['all', 'current', 'completed', 'news'].includes(statusParam)) {
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
        const response = await projectsApi.getAll({ published: true });

        // Support multiple possible response shapes: { projects }, { data: [...] }, or direct array
        const rawProjects =
          (response as any).projects ||
          (response as any).data ||
          response;

        if (response.success !== false && Array.isArray(rawProjects)) {
          // Store all projects with areasOfIntervention
          setAllProjects(rawProjects);
          
          // Debug: Log raw project data structure
          console.log('=== RAW PROJECTS DATA ===');
          console.log('Total projects:', rawProjects.length);
          rawProjects.forEach((p: any, index: number) => {
            console.log(`Project ${index + 1}:`, {
              title: p.title,
              _id: p._id,
              id: p.id,
              areasOfIntervention: p.areasOfIntervention,
              category: p.category,
              allKeys: Object.keys(p)
            });
          });
          
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
            
            // Debug: Log all projects with their extracted areas
            console.log('=== FILTER DEBUG ===');
            console.log('Selected area:', selectedArea);
            console.log('Normalized selected area:', normalizedSelectedArea);
            console.log('Extracted areas for each project:');
            rawProjects.forEach((p: any) => {
              const areas = getProjectAreas(p);
              const normalizedAreas = areas.map((a: string) => normalizeAreaName(a));
              const willMatch = areas.some((a: string) => normalizeAreaName(a) === normalizedSelectedArea);
              
              console.log(`- "${p.title}":`, {
                rawAreasOfIntervention: p.areasOfIntervention,
                rawCategory: p.category,
                extractedAreas: areas,
                extractedAreasString: areas.join(', '),
                normalizedAreas: normalizedAreas,
                normalizedAreasString: normalizedAreas.join(', '),
                normalizedSelectedArea: normalizedSelectedArea,
                willMatch: willMatch,
                matchDetails: areas.map((a: string, idx: number) => ({
                  area: a,
                  normalized: normalizedAreas[idx],
                  matches: normalizedAreas[idx] === normalizedSelectedArea
                }))
              });
            });
            
            processedProjects = rawProjects.filter((p: any) => {
              const areas = getProjectAreas(p);
              
              // Normalize area names for comparison (accent-insensitive, case-insensitive)
              const matches = areas.some(area => {
                const normalizedArea = normalizeAreaName(area);
                const isMatch = normalizedArea === normalizedSelectedArea;
                if (isMatch) {
                  console.log(`✓ MATCH: "${p.title}" - area "${area}" matches "${selectedArea}"`);
                }
                return isMatch;
              });
              
              return matches;
            });
            
            console.log(`Filtered projects: ${processedProjects.length} out of ${rawProjects.length}`);
            console.log('===================');
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

          console.log('Setting projects state:', mappedProjects.length, 'projects');
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
                <option value="news">Actualités</option>
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
                  to={`/project/${project.id}`} 
                  className="project-card-link"
                  aria-label={`Voir les détails pour ${project.title}`}
                >
                  <div className="project-card">
                    <div className="project-image-container">
                      <LazyImage
                        src={project.images[0] || '/placeholder-image.jpg'}
                        alt={project.title}
                        className="project-image"
                        width={350}
                        height={250}
                      />
                    </div>
                    <div className="project-content">
                      <h3>{project.title}</h3>
                      <p>{project.description.split('Read more')[0].trim()}</p>
                      <span className="read-more" aria-hidden="true">
                        LIRE PLUS →
                      </span>
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
          <Link to="/getinvolved" className="cta-button">
            S'impliquer
          </Link>
        </div>
      </section>
    </div>
  );
};

export default OurWork;
