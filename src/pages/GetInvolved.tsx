import React from 'react';
import { Link } from 'react-router-dom';
import './GetInvolved.css';

interface JobItem {
  id: number;
  title: string;
  description: string;
  link: string;
}

const GetInvolved: React.FC = () => {
  const jobs: JobItem[] = [
    {
      id: 1,
      title: 'Environmental Safeguard Specialist',
      description:
        'IMADEL is recruiting an Environmental Safeguard Specialist for the project "Implementation of Community Mobilization Activities, Prevention."',
      link: '#',
    },
    {
      id: 2,
      title: 'Coordinator – Protection of Refugees Project',
      description:
        'Notice of recruitment of a Coordinator for the implementation of activities under the project "Sectoral Measures for the Protection of Refugees."',
      link: '#',
    },
    {
      id: 3,
      title: 'Coordinator – Social Cohesion Project',
      description:
        'Recruitment of a Coordinator for the project "Implementation of Community Mobilization, Social Cohesion and Achievement Activities."',
      link: '#',
    },
    {
      id: 4,
      title: 'Health Supervisor',
      description:
        'Terms of Reference (ToR) for the recruitment of a Health Supervisor for upcoming community health initiatives.',
      link: '#',
    },
  ];

  return (
    <div className="get-involved-page">
      <section className="intro">
        <h1>Get Involved</h1>
        <p>
          Explore opportunities to work with us or support ongoing community health and development projects. 
          Join our team of passionate individuals making a difference across Ghana.
        </p>
      </section>

      <section className="job-offers">
        <h2>Job Offers & Recruitment Notices</h2>
        <div className="job-list">
          {jobs.map((job) => (
            <div className="job-card" key={job.id}>
              <h3>{job.title}</h3>
              <p>{job.description}</p>
              <Link to={`/job/${job.id}`} className="read-more">
                Read more →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default GetInvolved;
