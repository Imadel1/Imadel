import React, { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaBriefcase } from 'react-icons/fa';
import './JobDetail.css';
import { jobsApi, applicationsApi } from '../services/api';
import { useTranslation } from '../utils/i18n';

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
  deadline?: string;
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
  const { t } = useTranslation();

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
          // Check if job deadline has passed
          const deadline = jobData.deadline ? new Date(jobData.deadline) : null;
          const isExpired = deadline && deadline < new Date();
          
          // If expired or not published, don't show the job
          if (isExpired || !jobData.published) {
            setJob(null);
            return;
          }
          
          setJob({
            id: jobData._id || jobData.id,
            title: jobData.title,
            description: jobData.description || '',
            fullDescription: jobData.fullDescription || jobData.description || '',
            location: jobData.location || '',
            type: jobData.type || jobData.employmentType || '',
            applyUrl: jobData.applyUrl || '',
            published: jobData.published,
            deadline: jobData.deadline,
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
            <h1>{t('jobNotFoundTitle')}</h1>
            <p>{t('jobNotFoundDesc')}</p>
            <Link to="/getinvolved" className="btn-primary">
              {t('viewAllJobOpenings')}
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

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Échec de la conversion du fichier'));
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Check if deadline has passed
    if (job?.deadline) {
      const deadline = new Date(job.deadline);
      if (deadline < new Date()) {
        setSubmitStatus('error');
        alert(t('deadlinePassedAlert'));
        return;
      }
    }
    
    if (!validateForm()) {
      return;
    }
    if (!formData.coverLetter.trim()) {
      setErrors(prev => ({ ...prev, coverLetter: t('coverLetter') }));
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      if (!job || !resume) {
        throw new Error('Missing required information');
      }

      // Convert resume to base64 data URL (backend expects a string URL)
      const uploadedUrl = await fileToBase64(resume);

      // Submit application to backend
      const response = await applicationsApi.create({
        jobId: job.id,
        jobTitle: job.title,
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        coverLetter: formData.coverLetter || 'N/A',
        resumeUrl: uploadedUrl,
      });

      if (response.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', address: '', coverLetter: '' });
        setResume(null);
        
        // Show success message and redirect after a delay
        setTimeout(() => {
          navigate('/getinvolved');
        }, 3000);
      } else {
        throw new Error(response.message || 'Failed to submit application');
      }
    } catch (error: any) {
      console.error('Error submitting application:', error);
      setSubmitStatus('error');
      // Show error message to user
      alert(error.message || 'There was an error submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="job-detail-page">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">{t('home')}</Link>
          <span aria-hidden="true"> / </span>
          <Link to="/getinvolved">{t('getInvolved')}</Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{job.title}</span>
        </nav>

        <div className="job-detail-container">
          <div className="job-detail-content">
            <Link to="/getinvolved" className="back-button" aria-label={t('backToJobs')}>
              {t('backToJobs')}
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
              <h2>{t('jobDescription')}</h2>
              <p>{job.fullDescription}</p>
            </div>

            {job.requirements && job.requirements.length > 0 && (
              <div className="job-requirements">
                <h2>{t('requirements')}</h2>
                <ul role="list">
                  {job.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="job-responsibilities">
                <h2>{t('responsibilities')}</h2>
                <ul role="list">
                  {job.responsibilities.map((resp, index) => (
                    <li key={index}>{resp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="application-form" aria-label="Job application form">
            <h2>{t('applyForPosition')}</h2>
            {job.deadline && new Date(job.deadline) < new Date() ? (
              <div style={{ 
                padding: '2rem', 
                background: '#fee', 
                border: '2px solid #dc3545', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#dc3545', marginBottom: '1rem' }}>{t('deadlinePassedTitle')}</h3>
                <p style={{ color: '#666', marginBottom: '1rem' }}>
                  {t('deadlinePassedDescPrefix')} {new Date(job.deadline).toLocaleString()}.
                </p>
                <p style={{ color: '#666' }}>
                  {t('deadlinePassedDescSuffix')}
                </p>
              </div>
            ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="name">
                  {t('fullName')} <span className="required" aria-label="required">*</span>
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
                  {t('emailAddress')} <span className="required" aria-label="required">*</span>
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
                  {t('phoneNumber')} <span className="required" aria-label="required">*</span>
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
                  {t('addressLabel')} <span className="required" aria-label="required">*</span>
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
                  {t('resumeLabel')} <span className="required" aria-label="required">*</span>
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
                <small>{t('resumeHelp')}</small>
              </div>

              <div className="form-group">
                <label htmlFor="coverLetter">{t('coverLetter')}</label>
                <textarea
                  id="coverLetter"
                  name="coverLetter"
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder={t('coverLetterPlaceholder')}
                />
              </div>

              {submitStatus === 'success' && (
                <div className="success-message" role="alert">
                  <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{t('applicationSubmittedTitle')}</h3>
                  <p style={{ marginBottom: '0.5rem' }}>
                    {t('applicationSubmittedMessagePrefix')} <strong>{formData.email}</strong>.
                  </p>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                    {t('redirectingToJobs')}
                  </p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="error-message" role="alert">
                  {t('applicationError')}
                </div>
              )}

              <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting}
                aria-label={isSubmitting ? t('submittingApplication') : t('submitJobApplication')}
              >
                {isSubmitting ? t('submitting') : t('submitApplication')}
              </button>
            </form>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
