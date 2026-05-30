import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const SubscriptionModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { user, login } = useAuth(); // We might just reload or update user context

  if (!isOpen) return null;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async () => {
    if (!user) {
      setError('Please login to purchase a subscription.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await loadRazorpayScript();
      if (!res) {
        throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
      }

      // Create Order
      const { razorpayOrderId, amount, currency, keyId } = await api.auth.createUpgradeOrder();

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'Apex Wheels',
        description: 'Go Pro Subscription - 7 Days Rental Extension',
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            const verifyRes = await api.auth.verifyUpgrade({
              razorpayOrderId: response.razorpay_order_id || razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes) {
              setSuccess(true);
              setTimeout(() => {
                window.location.reload(); // Reload to reflect plan changes
              }, 2000);
            }
          } catch (err) {
            setError(err.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#fbbf24', // Accent color
        },
      };

      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', function (response) {
        setError(response.error.description || 'Payment failed. Please try again.');
      });

      paymentObject.open();

    } catch (err) {
      setError(err.message || 'Failed to initiate upgrade process.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" style={{ zIndex: 9999 }}>
      <div className="modal-content card animate-fade-in" style={{ maxWidth: '500px', textAlign: 'center', padding: '2.5rem' }}>
        <button onClick={onClose} className="close-modal-btn" style={{ position: 'absolute', top: '15px', right: '15px' }}>
          <X size={24} />
        </button>

        {success ? (
          <div className="upgrade-success">
            <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Welcome to Pro!</h2>
            <p style={{ color: 'var(--text-muted)' }}>Your account has been upgraded successfully. You can now rent cars for up to 7 days!</p>
          </div>
        ) : (
          <div className="upgrade-prompt">
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706', marginBottom: '1.5rem' }}>
              <ShieldCheck size={32} />
            </div>
            
            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Upgrade to <span style={{ color: '#d97706' }}>Go Pro</span></h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Unlock the full potential of your rentals. Pro members enjoy extended rental durations and exclusive perks.</p>
            
            <div className="plan-comparison" style={{ textAlign: 'left', background: 'var(--bg-light)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                <strong>Current Plan: Free</strong>
                <span style={{ color: 'var(--text-muted)' }}>Max 12-hour rental</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <strong style={{ color: '#d97706', fontSize: '1.1rem' }}>Pro Subscription</strong>
                <span style={{ fontWeight: 'bold' }}>Max 7-day rental</span>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                <p>{error}</p>
              </div>
            )}

            <button 
              className="btn btn-primary btn-full" 
              style={{ backgroundColor: '#fbbf24', color: '#000', padding: '1rem', fontSize: '1.1rem' }}
              onClick={handleUpgrade}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Pay ₹5,000 to Upgrade'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionModal;
