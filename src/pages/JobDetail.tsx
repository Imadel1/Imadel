import React, { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaBriefcase } from 'react-icons/fa';
import './JobDetail.css';

interface JobItem {
  id: string;
  title: string;
  description?: string;
  fullDescription?: string;
  requirements?: string[];
  responsibilities?: string[];
  location?: string;
  type?: string;
  applyUrl?: string;
  published?: boolean;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  coverLetter: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  resume?: string;
}

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobItem | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    coverLetter: ''
  });
  const [resume, setResume] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Scroll to top when component mounts or ID changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Default fallback jobs if no admin data
  const defaultJobs: JobItem[] = [
    {
      id: '1',
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
      ],
      location: 'Bamako, Mali',
      type: 'Full-time'
    },
    {
      id: '2',
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
      ],
      location: 'Bamako, Mali',
      type: 'Full-time'
    },
    {
      id: '3',
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
      ],
      location: 'Various locations, Mali',
      type: 'Full-time'
    },
    {
      id: '4',
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
      ],
      location: 'Bamako, Mali',
      type: 'Full-time'
    }
  ];

  // Load jobs from admin panel
  useEffect(() => {
    const loadJob = () => {
      try {
        const stored = localStorage.getItem('imadel_admin_jobs');
        let foundJob: JobItem | undefined;
        
        if (stored) {
          const adminJobs = JSON.parse(stored);
          foundJob = adminJobs.find((j: any) => j.id === id && j.published);
          
          if (foundJob) {
            setJob({
              id: foundJob.id,
              title: foundJob.title,
              description: foundJob.description,
              fullDescription: foundJob.description,
              location: foundJob.location,
              applyUrl: foundJob.applyUrl,
              type: 'Full-time'
            });
            return;
          }
        }
        
        // Fall back to default jobs if not found in admin
        const defaultJob = defaultJobs.find(j => j.id === id);
        if (defaultJob) {
          setJob(defaultJob);
        }
      } catch (error) {
        console.error('Error loading job:', error);
        // Fall back to default jobs on error
        const defaultJob = defaultJobs.find(j => j.id === id);
        if (defaultJob) {
          setJob(defaultJob);
        }
      }
    };

    loadJob();

    // Listen for updates from admin panel
    const handleUpdate = () => loadJob();
    window.addEventListener('imadel:jobs:updated', handleUpdate);

    return () => {
      window.removeEventListener('imadel:jobs:updated', handleUpdate);
    };
  }, [id]);

  if (!job) {
    return (
      <div className="job-detail-page">
        <div className="container">
          <div className="error-message">
            <h1>Job Not Found</h1>
            <p>The job posting you're looking for doesn't exist or has been removed.</p>
            <Link to="/getinvolved" className="btn-primary">
              View All Job Openings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 8;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!resume) {
      newErrors.resume = 'Resume/CV is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          resume: 'File size must be less than 5MB'
        }));
        return;
      }

      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          resume: 'Please upload a PDF or Word document'
        }));
        return;
      }

      setResume(file);
      setErrors(prev => ({
        ...prev,
        resume: undefined
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // TODO: Handle form submission with backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', address: '', coverLetter: '' });
      setResume(null);
      
      setTimeout(() => {
        navigate('/getinvolved');
      }, 2000);
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="job-detail-page">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true"> / </span>
          <Link to="/getinvolved">Get Involved</Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{job.title}</span>
        </nav>

        <div className="job-detail-container">
          <div className="job-detail-content">
            <Link to="/getinvolved" className="back-button" aria-label="Back to job offers">
              Back to Job Offers
            </Link>

            <header className="job-header">
              <h1>{job.title}</h1>
              {(job.location || job.type) && (
                <div className="job-meta">
                  {job.location && <span className="job-location"><FaMapMarkerAlt /> {job.location}</span>}
                  {job.type && <span className="job-type"><FaBriefcase /> {job.type}</span>}
                </div>
              )}
            </header>

            <div className="job-description">
              <h2>Job Description</h2>
              <p>{job.fullDescription}</p>
            </div>

            {job.requirements && job.requirements.length > 0 && (
              <div className="job-requirements">
                <h2>Requirements</h2>
                <ul role="list">
                  {job.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="job-responsibilities">
                <h2>Responsibilities</h2>
                <ul role="list">
                  {job.responsibilities.map((resp, index) => (
                    <li key={index}>{resp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="application-form" aria-label="Job application form">
            <h2>Apply for this Position</h2>
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="name">
                  Full Name <span className="required" aria-label="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  aria-invalid={errors.name ? 'true' : 'false'}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                  <span id="name-error" className="error-message" role="alert">
                    {errors.name}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email Address <span className="required" aria-label="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <span id="email-error" className="error-message" role="alert">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  Phone Number <span className="required" aria-label="required">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  aria-invalid={errors.phone ? 'true' : 'false'}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                />
                {errors.phone && (
                  <span id="phone-error" className="error-message" role="alert">
                    {errors.phone}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="address">
                  Address <span className="required" aria-label="required">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  aria-invalid={errors.address ? 'true' : 'false'}
                  aria-describedby={errors.address ? 'address-error' : undefined}
                />
                {errors.address && (
                  <span id="address-error" className="error-message" role="alert">
                    {errors.address}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="resume">
                  Resume/CV <span className="required" aria-label="required">*</span>
                </label>
                <input
                  type="file"
                  id="resume"
                  name="resume"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  required
                  aria-invalid={errors.resume ? 'true' : 'false'}
                  aria-describedby={errors.resume ? 'resume-error' : undefined}
                />
                {resume && <span className="file-name">{resume.name}</span>}
                {errors.resume && (
                  <span id="resume-error" className="error-message" role="alert">
                    {errors.resume}
                  </span>
                )}
                <small>PDF or Word document, max 5MB</small>
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

              {submitStatus === 'success' && (
                <div className="success-message" role="alert">
                  Application submitted successfully! Redirecting...
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="error-message" role="alert">
                  There was an error submitting your application. Please try again.
                </div>
              )}

              <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting}
                aria-label={isSubmitting ? 'Submitting application' : 'Submit job application'}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
