import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { donationsApi } from '../services/api';
import './DonationCallback.css';

const DonationCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference');
      
      if (!reference) {
        setStatus('failed');
        setMessage('No payment reference found');
        return;
      }

      try {
        const response = await donationsApi.verify(reference);
        
        if (response.success && response.donation?.status === 'success') {
          setStatus('success');
          setMessage('Thank you! Your donation has been successfully processed.');
        } else {
          setStatus('failed');
          setMessage(response.message || 'Payment verification failed');
        }
      } catch (error: any) {
        setStatus('failed');
        setMessage(error.message || 'An error occurred while verifying your payment');
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="donation-callback">
      <div className="donation-callback-content">
        {status === 'verifying' && (
          <>
            <div className="spinner"></div>
            <h2>Verifying your payment...</h2>
            <p>Please wait while we confirm your donation.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="success-icon">✓</div>
            <h2>Thank You!</h2>
            <p className="success-message">{message}</p>
            <p className="success-note">
              A confirmation email has been sent to your email address.
            </p>
            <div className="callback-actions">
              <button onClick={() => navigate('/donate')} className="btn-primary">
                Make Another Donation
              </button>
              <button onClick={() => navigate('/')} className="btn-secondary">
                Return to Home
              </button>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="error-icon">✕</div>
            <h2>Payment Verification Failed</h2>
            <p className="error-message">{message}</p>
            <div className="callback-actions">
              <button onClick={() => navigate('/donate')} className="btn-primary">
                Try Again
              </button>
              <button onClick={() => navigate('/')} className="btn-secondary">
                Return to Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DonationCallback;

