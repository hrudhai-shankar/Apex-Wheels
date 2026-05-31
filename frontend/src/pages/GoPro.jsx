import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ShieldCheck, Crown, ArrowLeft, Check, Sparkles } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const GoPro = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { user, updateUserPlan } = useAuth();
  const navigate = useNavigate();

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
      navigate('/login');
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
              updateUserPlan('pro');
              setSuccess(true);
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
    <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="card" style={{ maxWidth: '650px', width: '100%', padding: '3rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 40px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
        
        {/* Sleek Golden Glow Decoration */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #d97706, #fbbf24)' }}></div>

        {success ? (
          <div className="upgrade-success" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '1rem 0' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '96px', height: '96px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#fbbf24', animation: 'scaleUp 0.5s ease-out' }}>
              <Crown size={48} />
            </div>
            
            <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Welcome to Pro Mode</h1>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', lineHeight: '1.6', maxWidth: '480px' }}>
              Congratulations! Your account has been upgraded successfully. You now have access to 7-day rentals, priority support, and exclusive benefits.
            </p>

            <button onClick={() => navigate('/cars')} className="btn btn-primary" style={{ marginTop: '1rem', padding: '0.85rem 2rem' }}>
              Start Browsing Cars
            </button>
          </div>
        ) : (
          <div className="upgrade-prompt">
            <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', border: 'none', background: 'transparent', padding: 0 }}>
              <ArrowLeft size={16} /> Back
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706' }}>
                <Crown size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Upgrade to <span style={{ color: '#d97706' }}>Go Pro</span></h1>
                <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Unlock the ultimate Apex Wheels experience</p>
              </div>
            </div>

            <hr style={{ border: 'none', borderBottom: '1px solid var(--border)', margin: '1.5rem 0' }} />

            <div className="plan-comparison" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: 'var(--bg-light)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Free Plan</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <Check size={16} color="var(--success)" /> Max 12-hour rental
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <Check size={16} color="var(--success)" /> Standard support
                  </li>
                </ul>
              </div>

              <div style={{ background: '#fffbeb', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #fef3c7' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#b45309', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Pro Plan <Sparkles size={16} />
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#78350f', fontWeight: 600 }}>
                    <Check size={16} color="#d97706" /> Max 7-day rental
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#78350f', fontWeight: 600 }}>
                    <Check size={16} color="#d97706" /> Priority 24/7 support
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#78350f', fontWeight: 600 }}>
                    <Check size={16} color="#d97706" /> Exclusive fleet access
                  </li>
                </ul>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
                <p style={{ margin: 0 }}>{error}</p>
              </div>
            )}

            <button 
              className="btn btn-primary btn-full" 
              style={{ backgroundColor: '#fbbf24', color: '#000', padding: '1.15rem', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              onClick={handleUpgrade}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Pay ₹5,000 to Go Pro'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoPro;
