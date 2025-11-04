import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './JobDetail.css';

interface JobItem {
  id: number;
  title: string;
  description: string;
  fullDescription: string;
  requirements: string[];
  responsibilities: string[];
}

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    coverLetter: ''
  });
  const [resume, setResume] = useState<File | null>(null);

  const jobs: JobItem[] = [
    {
      id: 1,
      title: 'Environmental Safeguard Specialist',
      description: 'IMADEL is recruiting an Environmental Safeguard Specialist for the project "Implementation of Community Mobilization Activities, Prevention."',
      fullDescription: 'IMADEL is seeking a qualified Environmental Safeguard Specialist to support our environmental protection initiatives. This role involves implementing environmental safeguards, conducting assessments, and ensuring compliance with environmental standards in community development projects.',
      requirements: [
        'Bachelor\'s degree in Environmental Science, Environmental Engineering, or related field',
        'Minimum 3 years of experience in environmental safeguards',
        'Knowledge of environmental impact assessment processes',
        'Strong analytical and reporting skills',
        'Fluency in French and English'
      ],
      responsibilities: [
        'Conduct environmental impact assessments',
        'Develop and implement environmental management plans',
        'Monitor environmental compliance',
        'Prepare environmental safeguard reports',
        'Coordinate with project teams and stakeholders'
      ]
    },
    {
      id: 2,
      title: 'Coordinator – Protection of Refugees Project',
      description: 'Notice of recruitment of a Coordinator for the implementation of activities under the project "Sectoral Measures for the Protection of Refugees."',
      fullDescription: 'We are looking for an experienced Coordinator to lead the implementation of refugee protection activities. This position will oversee project coordination, stakeholder engagement, and ensure effective delivery of protection services to refugee communities.',
      requirements: [
        'Master\'s degree in International Relations, Humanitarian Affairs, or related field',
        'Minimum 5 years of experience in refugee protection or humanitarian work',
        'Experience in project coordination and management',
        'Knowledge of refugee protection frameworks',
        'Strong communication and interpersonal skills'
      ],
      responsibilities: [
        'Coordinate project activities and implementation',
        'Manage stakeholder relationships and partnerships',
        'Oversee project budget and resource allocation',
        'Monitor project progress and impact',
        'Prepare progress reports and documentation'
      ]
    },
    {
      id: 3,
      title: 'Coordinator – Social Cohesion Project',
      description: 'Recruitment of a Coordinator for the project "Implementation of Community Mobilization, Social Cohesion and Achievement Activities."',
      fullDescription: 'IMADEL seeks a dedicated Coordinator to lead social cohesion initiatives aimed at strengthening community bonds and promoting inclusive development. This role focuses on community mobilization and fostering social harmony.',
      requirements: [
        'Bachelor\'s degree in Social Sciences, Community Development, or related field',
        'Minimum 4 years of experience in community development',
        'Experience in social cohesion and conflict resolution',
        'Strong facilitation and training skills',
        'Knowledge of local cultural contexts'
      ],
      responsibilities: [
        'Coordinate community mobilization activities',
        'Facilitate social cohesion workshops and training',
        'Develop community engagement strategies',
        'Monitor social impact and cohesion indicators',
        'Collaborate with local authorities and organizations'
      ]
    },
    {
      id: 4,
      title: 'Health Supervisor',
      description: 'Terms of Reference (ToR) for the recruitment of a Health Supervisor for upcoming community health initiatives.',
      fullDescription: 'We are recruiting a Health Supervisor to oversee community health programs and ensure the effective delivery of health services. This position will focus on health promotion, disease prevention, and community health education.',
      requirements: [
        'Bachelor\'s degree in Public Health, Nursing, or Medicine',
        'Minimum 3 years of experience in community health',
        'Knowledge of health promotion and disease prevention',
        'Experience in health program supervision',
        'Strong community engagement skills'
      ],
      responsibilities: [
        'Supervise community health program implementation',
        'Conduct health education and awareness campaigns',
        'Monitor health indicators and program outcomes',
        'Coordinate with health facilities and providers',
        'Prepare health program reports and documentation'
      ]
    }
  ];

  const job = jobs.find(j => j.id === parseInt(id || '0'));

  if (!job) {
    return <div>Job not found</div>;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResume(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    alert('Application submitted successfully!');
    navigate('/getinvolved');
  };

  return (
    <div className="job-detail-page">
      <div className="job-detail-container">
        <div className="job-detail-content">
          <button onClick={() => navigate('/getinvolved')} className="back-button">
            ← Back to Job Offers
          </button>

          <h1>{job.title}</h1>

          <div className="job-description">
            <h2>Job Description</h2>
            <p>{job.fullDescription}</p>
          </div>

          <div className="job-requirements">
            <h2>Requirements</h2>
            <ul>
              {job.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>

          <div className="job-responsibilities">
            <h2>Responsibilities</h2>
            <ul>
              {job.responsibilities.map((resp, index) => (
                <li key={index}>{resp}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="application-form">
          <h2>Apply for this Position</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="resume">Resume/CV *</label>
              <input
                type="file"
                id="resume"
                name="resume"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                required
              />
              {resume && <span className="file-name">{resume.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="coverLetter">Cover Letter</label>
              <textarea
                id="coverLetter"
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleInputChange}
                rows={6}
                placeholder="Tell us why you're interested in this position..."
              />
            </div>

            <button type="submit" className="submit-button">
              Submit Application
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
