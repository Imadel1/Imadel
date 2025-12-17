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
  listingType?: 'emploi' | 'benevolat' | 'opportunite' | 'appel-offres';
}

const GetInvolved: React.FC = () => {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [proposals, setProposals] = useState<JobItem[]>([]);
  const [volunteerJobs, setVolunteerJobs] = useState<JobItem[]>([]);

  // Load jobs and proposals from API
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await jobsApi.getAll();
        // Support multiple possible response shapes: { jobs }, { data: [...] }, or direct array
        const rawJobs =
          (response as any).jobs ||
          (response as any).data ||
          response;

        if ((response as any).success !== false && Array.isArray(rawJobs)) {
          // Filter only published items that haven't passed their deadline
          const now = new Date();
          const publishedItems = rawJobs
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
            .map((j: any) => {
              // Normalize older values: map old English to new French values
              const rawType: string | undefined = j.listingType;
              let listingType: JobItem['listingType'];

              if (!rawType || rawType === 'job' || rawType === 'employment') {
                listingType = 'emploi';
              } else if (rawType === 'volunteer') {
                listingType = 'benevolat';
              } else if (rawType === 'opportunity') {
                listingType = 'opportunite';
              } else if (rawType === 'proposal') {
                listingType = 'appel-offres';
              } else {
                // If it's already in the new French set, trust it; otherwise default to emploi
                listingType =
                  (['emploi', 'benevolat', 'opportunite', 'appel-offres'] as JobItem['listingType'][]).includes(
                    rawType as JobItem['listingType']
                  )
                    ? (rawType as JobItem['listingType'])
                    : 'emploi';
              }

              return {
                id: j._id || j.id,
                title: j.title,
                description: j.description || '',
                location: j.location || '',
                applyUrl: j.applyUrl || '',
                link: `/opportunite/${j._id || j.id}`,
                category: j.location || 'General',
                deadline: j.deadline,
                listingType,
                status: j.status || 'open',
              };
            });
          
          // Separate by listingType
          const jobsList = publishedItems.filter(
            (item: JobItem & { status?: string }) =>
              (item.listingType === 'emploi' || item.listingType === 'opportunite') &&
              (item.status === 'open' || item.status === 'filled' || !item.status)
          );

          const proposalsList = publishedItems.filter(
            (item: JobItem) => item.listingType === 'appel-offres'
          );

          const volunteerList = publishedItems.filter(
            (item: JobItem) => item.listingType === 'benevolat'
          );
          
          setJobs(jobsList);
          setProposals(proposalsList);
          setVolunteerJobs(volunteerList);
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
                  <Link 
                    to={proposal.link || `/opportunite/${proposal.id}`} 
                    className="job-card-link"
                    aria-label={`En savoir plus sur ${proposal.title}`}
                  >
                    {(proposal.category || proposal.location) && (
                      <span className="job-category" aria-label={`Catégorie: ${proposal.category || proposal.location}`}>
                        {proposal.category || proposal.location}
                      </span>
                    )}
                    <h3>{proposal.title}</h3>
                    <p>{proposal.description}</p>
                    <span className="read-more">
                      Lire plus →
                    </span>
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
                  <Link 
                    to={job.link || `/opportunite/${job.id}`} 
                    className="job-card-link"
                    aria-label={`En savoir plus sur le poste ${job.title}`}
                  >
                    {(job.category || job.location) && (
                      <span className="job-category" aria-label={`Catégorie: ${job.category || job.location}`}>
                        {job.category || job.location}
                      </span>
                    )}
                    <h3>{job.title}</h3>
                    <p>{job.description}</p>
                    <span className="read-more">
                      Lire plus →
                    </span>
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
          {volunteerJobs.length > 0 ? (
            <div className="job-list" role="list" aria-label="Opportunités de bénévolat">
              {volunteerJobs.map((job) => (
                <article key={job.id} className="job-card" role="listitem">
                  <Link
                    to={job.link || `/opportunite/${job.id}`}
                    className="job-card-link"
                    aria-label={`En savoir plus sur l'opportunité bénévole ${job.title}`}
                  >
                    {(job.category || job.location) && (
                      <span className="job-category" aria-label={`Catégorie: ${job.category || job.location}`}>
                        {job.category || job.location}
                      </span>
                    )}
                    <h3>{job.title}</h3>
                    <p>{job.description}</p>
                    <span className="read-more">
                      Lire plus →
                    </span>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <>
              <p>
                Vous ne cherchez pas un poste à temps plein ? Nous accueillons également des bénévoles qui souhaitent consacrer leur temps et leurs compétences
                à notre mission. Que vous soyez intéressé par le travail de terrain, le soutien administratif ou une expertise spécialisée,
                nous avons des opportunités pour vous.
              </p>
              <Link to="/contact" className="btn-secondary">
                Contactez-nous pour le Bénévolat
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="partnership-section" aria-labelledby="partnership-heading">
        <div className="container">
          <h2 id="partnership-heading">Opportunités de Partenariat</h2>
          <p>
            Vous êtes une organisation cherchant à collaborer ? IMADEL valorise les partenariats avec les ONG, les agences gouvernementales
            et les organisations du secteur privé qui partagent notre engagement envers le développement local.
          </p>
          <Link to="/partenaires" className="btn-outline">
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
