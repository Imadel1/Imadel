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
}

// Default fallback jobs if admin hasn't added any
const DEFAULT_JOBS: JobItem[] = [
  {
    id: '1',
    title: 'Environmental Safeguard Specialist',
    description:
      'IMADEL is recruiting an Environmental Safeguard Specialist for the project "Implementation of Community Mobilization Activities, Prevention."',
    link: '/job/1',
    category: 'Environment'
  },
  {
    id: '2',
    title: 'Coordinator – Protection of Refugees Project',
    description:
      'Notice of recruitment of a Coordinator for the implementation of activities under the project "Sectoral Measures for the Protection of Refugees."',
    link: '/job/2',
    category: 'Protection'
  },
  {
    id: '3',
    title: 'Coordinator – Social Cohesion Project',
    description:
      'Recruitment of a Coordinator for the project "Implementation of Community Mobilization, Social Cohesion and Achievement Activities."',
    link: '/job/3',
    category: 'Social Development'
  },
  {
    id: '4',
    title: 'Health Supervisor',
    description:
      'Terms of Reference (ToR) for the recruitment of a Health Supervisor for upcoming community health initiatives.',
    link: '/job/4',
    category: 'Health'
  },
];

const GetInvolved: React.FC = () => {
  const [jobs, setJobs] = useState<JobItem[]>(DEFAULT_JOBS);

  // Load jobs from API
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await jobsApi.getAll();
        
        if (response.success && response.jobs) {
          // Filter only published jobs and map format
          const publishedJobs = response.jobs
            .filter((j: any) => j.published)
            .map((j: any) => ({
              id: j._id || j.id,
              title: j.title,
              description: j.description || '',
              location: j.location || '',
              applyUrl: j.applyUrl || '',
              link: `/job/${j._id || j.id}`,
              category: j.location || 'General'
            }));
          
          if (publishedJobs.length > 0) {
            setJobs(publishedJobs);
          }
        }
      } catch (error) {
        console.error('Error loading jobs from API:', error);
        // Do not fall back to localStorage – show only live backend data
        setJobs([]);
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
          <h1 id="intro-heading">Get Involved</h1>
          <p>
            Explore opportunities to work with us or support ongoing community health and development projects.
            Join our team of passionate individuals making a difference across Mali.
          </p>
        </div>
      </section>

      <section className="job-offers" aria-labelledby="job-offers-heading">
        <div className="container">
          <h2 id="job-offers-heading">Job Offers & Recruitment Notices</h2>
          <p className="section-description">
            We are always looking for dedicated professionals to join our team. Browse our current openings below.
          </p>
          <div className="job-list" role="list" aria-label="Job openings">
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <article key={job.id} className="job-card" role="listitem">
                  {(job.category || job.location) && (
                    <span className="job-category" aria-label={`Category: ${job.category || job.location}`}>
                      {job.category || job.location}
                    </span>
                  )}
                  <h3>{job.title}</h3>
                  <p>{job.description}</p>
                  <Link 
                    to={job.link || `/job/${job.id}`} 
                    className="read-more"
                    aria-label={`Read more about ${job.title} position`}
                  >
                    Read more →
                  </Link>
                </article>
              ))
            ) : (
              <p className="no-jobs-message" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary, #616161)' }}>
                No job openings available at the moment. Please check back later.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="volunteer-section" aria-labelledby="volunteer-heading">
        <div className="container">
          <h2 id="volunteer-heading">Volunteer Opportunities</h2>
          <p>
            Not looking for a full-time position? We also welcome volunteers who want to contribute their time and skills 
            to our mission. Whether you're interested in field work, administrative support, or specialized expertise, 
            we have opportunities for you.
          </p>
          <Link to="/contact" className="btn-secondary">
            Contact Us About Volunteering
          </Link>
        </div>
      </section>

      <section className="partnership-section" aria-labelledby="partnership-heading">
        <div className="container">
          <h2 id="partnership-heading">Partnership Opportunities</h2>
          <p>
            Are you an organization looking to collaborate? IMADEL values partnerships with NGOs, government agencies, 
            and private sector organizations that share our commitment to local development.
          </p>
          <Link to="/partners" className="btn-outline">
            View Our Partners
          </Link>
        </div>
      </section>

      {/* Call To Action Section */}
      <section className="cta" aria-labelledby="cta-heading">
        <div className="container">
          <h2 id="cta-heading">Partner with Us</h2>
          <p>Interested in partnering with IMADEL? We'd love to hear from you.</p>
          <Link to="/contact" className="cta-button">
            Contact Us for Partnerships
          </Link>
        </div>
      </section>
    </div>
  );
};

export default GetInvolved;
