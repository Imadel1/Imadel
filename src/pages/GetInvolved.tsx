import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './GetInvolved.css';
import { jobsApi } from '../services/api';

interface JobItem {
  id: string;
  title: string;
  description: string;
  link?: string;
  category?: string;
  location?: string;
  applyUrl?: string;
  published?: boolean;
  listingType?: 'job' | 'proposal';
}

// Default fallback jobs if admin hasn't added any
const DEFAULT_JOBS: JobItem[] = [
  {
    id: '1',
    title: 'Spécialiste en Sauvegarde Environnementale',
    description:
      'IMADEL recrute un Spécialiste en Sauvegarde Environnementale pour le projet "Mise en œuvre des Activités de Mobilisation Communautaire, Prévention."',
    link: '/job/1',
    category: 'Environnement'
  },
  {
    id: '2',
    title: 'Coordinateur – Projet Protection des Réfugiés',
    description:
      'Avis de recrutement d\'un Coordinateur pour la mise en œuvre des activités dans le cadre du projet "Mesures Sectorielles pour la Protection des Réfugiés."',
    link: '/job/2',
    category: 'Protection'
  },
  {
    id: '3',
    title: 'Coordinateur – Projet Cohésion Sociale',
    description:
      'Recrutement d\'un Coordinateur pour le projet "Mise en œuvre des Activités de Mobilisation Communautaire, Cohésion Sociale et Réalisation."',
    link: '/job/3',
    category: 'Développement Social'
  },
  {
    id: '4',
    title: 'Superviseur Santé',
    description:
      'Termes de Référence (TDR) pour le recrutement d\'un Superviseur Santé pour les initiatives de santé communautaire à venir.',
    link: '/job/4',
    category: 'Santé'
  },
];

const GetInvolved: React.FC = () => {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [proposals, setProposals] = useState<JobItem[]>([]);

  // Load jobs and proposals from API
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await jobsApi.getAll();
        
        if (response.success && response.jobs) {
          // Filter only published items that haven't passed their deadline
          const now = new Date();
          const publishedItems = response.jobs
            .filter((j: any) => {
              // Must be published
              if (!j.published) return false;
              // Must have a deadline that hasn't passed
              if (j.deadline) {
                const deadline = new Date(j.deadline);
                return deadline > now;
              }
              // If no deadline, include it (for backward compatibility)
              return true;
            })
            .map((j: any) => ({
              id: j._id || j.id,
              title: j.title,
              description: j.description || '',
              location: j.location || '',
              applyUrl: j.applyUrl || '',
              link: `/job/${j._id || j.id}`,
              category: j.location || 'General',
              deadline: j.deadline,
              listingType: j.listingType || 'job'
            }));
          
          // Separate jobs and proposals
          const jobsList = publishedItems.filter((item: JobItem) => item.listingType !== 'proposal');
          const proposalsList = publishedItems.filter((item: JobItem) => item.listingType === 'proposal');
          
          setJobs(jobsList);
          setProposals(proposalsList);
        }
      } catch (error) {
        console.error('Error loading jobs from API:', error);
        // Do not fall back to localStorage – show only live backend data
        setJobs([]);
        setProposals([]);
      }
    };

    loadJobs();

    // Listen for updates from admin panel
    const handleUpdate = () => loadJobs();
    window.addEventListener('imadel:jobs:updated', handleUpdate);

    return () => {
      window.removeEventListener('imadel:jobs:updated', handleUpdate);
    };
  }, []);

  return (
    <div className="get-involved-page">
      <section className="intro" aria-labelledby="intro-heading">
        <div className="container">
          <h1 id="intro-heading">S'impliquer</h1>
          <p>
            Découvrez les opportunités de travailler avec nous ou de soutenir les projets de santé et de développement communautaire en cours.
            Rejoignez notre équipe de personnes passionnées qui font la différence à travers le Mali.
          </p>
        </div>
      </section>

      <section className="proposals-section" aria-labelledby="proposals-heading">
        <div className="container">
          <h2 id="proposals-heading">Appels d'Offres & Appels à Propositions</h2>
          <p className="section-description">
            Découvrez nos opportunités de partenariat et nos appels d'offres pour des projets de développement communautaire.
          </p>
          <div className="job-list" role="list" aria-label="Appels d'offres">
            {proposals.length > 0 ? (
              proposals.map((proposal) => (
                <article key={proposal.id} className="job-card" role="listitem">
                  {(proposal.category || proposal.location) && (
                    <span className="job-category" aria-label={`Catégorie: ${proposal.category || proposal.location}`}>
                      {proposal.category || proposal.location}
                    </span>
                  )}
                  <h3>{proposal.title}</h3>
                  <p>{proposal.description}</p>
                  <Link 
                    to={proposal.link || `/job/${proposal.id}`} 
                    className="read-more"
                    aria-label={`En savoir plus sur ${proposal.title}`}
                  >
                    Lire plus →
                  </Link>
                </article>
              ))
            ) : (
              <p className="no-jobs-message" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary, #616161)' }}>
                Aucun appel d'offres disponible pour le moment. Veuillez vérifier plus tard.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="job-offers" aria-labelledby="job-offers-heading">
        <div className="container">
          <h2 id="job-offers-heading">Offres d'Emploi & Avis de Recrutement</h2>
          <p className="section-description">
            Nous sommes toujours à la recherche de professionnels dévoués pour rejoindre notre équipe. Consultez nos offres actuelles ci-dessous.
          </p>
          <div className="job-list" role="list" aria-label="Offres d'emploi">
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <article key={job.id} className="job-card" role="listitem">
                  {(job.category || job.location) && (
                    <span className="job-category" aria-label={`Catégorie: ${job.category || job.location}`}>
                      {job.category || job.location}
                    </span>
                  )}
                  <h3>{job.title}</h3>
                  <p>{job.description}</p>
                  <Link 
                    to={job.link || `/job/${job.id}`} 
                    className="read-more"
                    aria-label={`En savoir plus sur le poste ${job.title}`}
                  >
                    Lire plus →
                  </Link>
                </article>
              ))
            ) : (
              <p className="no-jobs-message" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary, #616161)' }}>
                Aucune offre d'emploi disponible pour le moment. Veuillez vérifier plus tard.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="volunteer-section" aria-labelledby="volunteer-heading">
        <div className="container">
          <h2 id="volunteer-heading">Opportunités de Bénévolat</h2>
          <p>
            Vous ne cherchez pas un poste à temps plein ? Nous accueillons également des bénévoles qui souhaitent consacrer leur temps et leurs compétences
            à notre mission. Que vous soyez intéressé par le travail de terrain, le soutien administratif ou une expertise spécialisée,
            nous avons des opportunités pour vous.
          </p>
          <Link to="/contact" className="btn-secondary">
            Contactez-nous pour le Bénévolat
          </Link>
        </div>
      </section>

      <section className="partnership-section" aria-labelledby="partnership-heading">
        <div className="container">
          <h2 id="partnership-heading">Opportunités de Partenariat</h2>
          <p>
            Vous êtes une organisation cherchant à collaborer ? IMADEL valorise les partenariats avec les ONG, les agences gouvernementales
            et les organisations du secteur privé qui partagent notre engagement envers le développement local.
          </p>
          <Link to="/partners" className="btn-outline">
            Voir Nos Partenaires
          </Link>
        </div>
      </section>

      {/* Call To Action Section */}
      <section className="cta" aria-labelledby="cta-heading">
        <div className="container">
          <h2 id="cta-heading">Devenez Partenaire</h2>
          <p>Intéressé par un partenariat avec IMADEL ? Nous aimerions avoir de vos nouvelles.</p>
          <Link to="/contact" className="cta-button">
            Contactez-nous pour les Partenariats
          </Link>
        </div>
      </section>
    </div>
  );
};

export default GetInvolved;
