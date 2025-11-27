import React, { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaBriefcase } from 'react-icons/fa';
import './JobDetail.css';
import { jobsApi } from '../services/api';

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

  // Load job from backend API
  useEffect(() => {
    if (!id) return;

    const loadJob = async () => {
      try {
        const response = await jobsApi.getById(id);

        // Expecting backend shape: { success, job }
        const jobData = (response as any).job || (response as any).data;

        if (response.success && jobData) {
          setJob({
            id: jobData._id || jobData.id,
            title: jobData.title,
            description: jobData.description || '',
            fullDescription: jobData.fullDescription || jobData.description || '',
            location: jobData.location || '',
            type: jobData.type || jobData.employmentType || '',
            applyUrl: jobData.applyUrl || '',
            published: jobData.published,
          });
        } else {
          setJob(null);
        }
      } catch (error) {
        console.error('Error loading job from API:', error);
        setJob(null);
      }
    };

    loadJob();
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
