import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { CreditCard, Calendar, CheckCircle, XCircle, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const checkoutState = location.state;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Checkout Outcome State
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, success, failed
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Load Razorpay Script Dynamically
  useEffect(() => {
    const loadRazorpay = () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    };
    loadRazorpay();
  }, []);

  if (!checkoutState || !checkoutState.car) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="alert alert-danger" style={{ maxWidth: '500px', margin: '0 auto 2rem auto' }}>
          <AlertCircle size={20} />
          <span>No active checkout session found. Please select a vehicle first.</span>
        </div>
        <Link to="/cars" className="btn btn-primary">
          Browse Vehicles
        </Link>
      </div>
    );
  }

  const { car, startDate, endDate, totalDays, totalAmount } = checkoutState;

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Create order on the backend
      const orderData = await api.bookings.createOrder({
        carId: car._id,
        startDate,
        endDate,
      });

      const { razorpayOrderId, amount, currency, keyId, booking } = orderData;

      // 2. Check if mock mode is active (when developer doesn't supply valid Razorpay Keys)
      if (razorpayOrderId.startsWith('mock_order_')) {
        console.log('Mock payment environment identified. Automating checkout verification...');
        
        // Simulating a delay of 1.5 seconds for visual premium feel
        setTimeout(async () => {
          try {
            const verification = await api.bookings.verifyPayment({
              razorpayOrderId,
              razorpayPaymentId: `mock_payment_${Date.now()}`,
              razorpaySignature: 'mock_signature',
            });
            
            setConfirmedBooking(verification.booking);
            setPaymentStatus('success');
            setLoading(false);
          } catch (verifErr) {
            setError(verifErr.message || 'Verification failed');
            setPaymentStatus('failed');
            setLoading(false);
          }
        }, 1500);
        return;
      }

      // 3. Trigger Razorpay Standard SDK Checkout Modal
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'Apex Wheels Rentals',
        description: `Rent payment for ${car.brand} ${car.name}`,
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=120&h=120&q=80',
        order_id: razorpayOrderId,
        prefill: {
          name: user ? user.name : '',
          email: user ? user.email : '',
        },
        theme: {
          color: '#c5a059', // Matches Gold --primary
        },
        handler: async (response) => {
          try {
            setLoading(true);
            const verification = await api.bookings.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            setConfirmedBooking(verification.booking);
            setPaymentStatus('success');
          } catch (verifError) {
            setError(verifError.message || 'Signature verification failed.');
            setPaymentStatus('failed');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setError('Payment process was cancelled.');
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message || 'Failed to initiate checkout.');
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // SUCCESS PAGE VIEW
  if (paymentStatus === 'success') {
    return (
      <div className="checkout-page container animate-fade-in" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="outcome-card card success">
          <CheckCircle size={64} className="outcome-icon" />
          <h2>Booking Confirmed!</h2>
          <p className="outcome-sub">Your rental has been successfully processed. Check your booking details below.</p>
          
          <div className="outcome-details">
            <div className="detail-row">
              <span>Car</span>
              <strong>{car.brand} {car.name}</strong>
            </div>
            <div className="detail-row">
              <span>Rental Period</span>
              <span>{formatDate(startDate)} &mdash; {formatDate(endDate)}</span>
            </div>
            <div className="detail-row">
              <span>Total Duration</span>
              <strong>{totalDays} {totalDays === 1 ? 'Day' : 'Days'}</strong>
            </div>
            <div className="detail-row">
              <span>Paid Amount</span>
              <strong className="success-text">₹{totalAmount}</strong>
            </div>
            {confirmedBooking && (
              <div className="detail-row" style={{ borderTop: '1px dashed var(--border)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                <span>Payment ID</span>
                <span className="code-text">{confirmedBooking.razorpayPaymentId}</span>
              </div>
            )}
          </div>

          <div className="outcome-actions">
            <Link to="/my-bookings" className="btn btn-primary btn-full">
              Go to My Bookings
            </Link>
            <Link to="/" className="btn btn-secondary btn-full">
              Back to Home
            </Link>
          </div>
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          .outcome-card {
            max-width: 500px;
            width: 100%;
            padding: 3rem;
            text-align: center;
            background-color: var(--bg-white);
            margin: 4rem 0;
          }
          .outcome-icon {
            margin: 0 auto 1.5rem auto;
          }
          .success .outcome-icon {
            color: var(--success);
          }
          .failed .outcome-icon {
            color: var(--danger);
          }
          .outcome-sub {
            color: var(--text-muted);
            margin-bottom: 2rem;
            font-size: 0.95rem;
          }
          .outcome-details {
            background-color: var(--bg-light);
            border-radius: var(--radius-md);
            padding: 1.25rem 1.5rem;
            text-align: left;
            margin-bottom: 2rem;
            border: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            font-size: 0.9rem;
          }
          .detail-row strong {
            color: var(--dark);
          }
          .success-text {
            color: var(--success) !important;
            font-size: 1.1rem;
          }
          .code-text {
            font-family: monospace;
            font-size: 0.8rem;
            color: var(--text-muted);
          }
          .outcome-actions {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }
        `}} />
      </div>
    );
  }

  // FAILED PAGE VIEW
  if (paymentStatus === 'failed') {
    return (
      <div className="checkout-page container animate-fade-in" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="outcome-card card failed">
          <XCircle size={64} className="outcome-icon" />
          <h2>Booking Failed</h2>
          <p className="outcome-sub">We were unable to complete your payment transaction. Please review card inputs and try again.</p>
          
          {error && (
            <div className="alert alert-danger" style={{ textAlign: 'left', fontSize: '0.85rem' }}>
              <span>{error}</span>
            </div>
          )}

          <div className="outcome-actions" style={{ marginTop: '1.5rem' }}>
            <button onClick={() => setPaymentStatus('pending')} className="btn btn-primary btn-full">
              Retry Booking
            </button>
            <Link to="/cars" className="btn btn-secondary btn-full">
              Browse Vehicles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // STANDARD CHECKOUT VIEW
  return (
    <div className="checkout-page container animate-fade-in">
      <button onClick={() => navigate(-1)} className="back-link" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
        <ArrowLeft size={16} />
        Back to Details
      </button>

      <div className="checkout-layout">
        {/* Checkout Summary left card */}
        <div className="checkout-summary card">
          <h2>Booking Review</h2>
          <p className="summary-desc">Please double-check your booking parameters and dates before locking in the checkout.</p>
          
          <div className="summary-car-specs">
            <img src={car.image} alt={car.name} onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80';
            }} />
            <div>
              <span className="car-brand">{car.brand}</span>
              <h3>{car.name}</h3>
              <p className="car-type">{car.type} &bull; {car.seats} Seats &bull; {car.transmission}</p>
            </div>
          </div>

          <div className="date-summary">
            <div className="date-box">
              <Calendar size={18} />
              <div>
                <span>Pickup Time</span>
                <strong>{formatDate(startDate)}</strong>
              </div>
            </div>
            <div className="date-box">
              <Calendar size={18} />
              <div>
                <span>Drop-off Time</span>
                <strong>{formatDate(endDate)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Card Right Sidebar */}
        <aside className="checkout-payment-box card">
          <h3>Fare Calculations</h3>
          
          <div className="fare-rows">
            <div className="fare-row">
              <span>Daily Fare ({totalDays} {totalDays === 1 ? 'Day' : 'Days'})</span>
              <span>₹{totalAmount}</span>
            </div>
            <div className="fare-row">
              <span>Taxes & Service Fees</span>
              <span className="success-text-bold">FREE</span>
            </div>
            <div className="fare-row total-fare-row">
              <span>Total Price</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger checkout-alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="checkout-cta-section">
            <button
              onClick={handlePayment}
              className="btn btn-primary btn-full checkout-pay-btn"
              disabled={loading}
            >
              <CreditCard size={18} />
              {loading ? 'Processing Transaction...' : 'Pay with Razorpay'}
            </button>
            
            <div className="secure-badge">
              <ShieldCheck size={16} />
              <span>Razorpay 256-bit Secure Layer Active</span>
            </div>
          </div>
        </aside>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .checkout-page {
          padding: 2rem 1.5rem 4rem 1.5rem;
        }
        .checkout-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 2.5rem;
          margin-top: 1rem;
          align-items: start;
        }
        @media (max-width: 900px) {
          .checkout-layout {
            grid-template-columns: 1fr;
          }
        }
        
        .checkout-summary {
          padding: 2.5rem;
          background-color: var(--bg-white);
        }
        .checkout-summary h2 {
          font-size: 1.5rem;
          margin-bottom: 0.25rem;
        }
        .summary-desc {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 1rem;
        }
        .summary-car-specs {
          display: flex;
          gap: 1.5rem;
          align-items: center;
          margin-bottom: 2rem;
        }
        @media (max-width: 576px) {
          .summary-car-specs {
            flex-direction: column;
            align-items: flex-start;
          }
        }
        .summary-car-specs img {
          width: 150px;
          height: 100px;
          object-fit: cover;
          border-radius: var(--radius-md);
          background-color: #f1f5f9;
          border: 1px solid var(--border);
        }
        .summary-car-specs h3 {
          font-size: 1.25rem;
          margin-top: 0.15rem;
        }
        .car-type {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }
        
        .date-summary {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          background-color: var(--bg-light);
          padding: 1.5rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
        }
        @media (max-width: 576px) {
          .date-summary {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
        .date-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--primary);
        }
        .date-box div {
          display: flex;
          flex-direction: column;
        }
        .date-box span {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
        }
        .date-box strong {
          font-size: 0.95rem;
          color: var(--dark);
        }
        
        .checkout-payment-box {
          padding: 2rem;
          background-color: var(--bg-white);
        }
        .checkout-payment-box h3 {
          margin-bottom: 1.25rem;
          font-size: 1.2rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 0.75rem;
        }
        .fare-rows {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .fare-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-dark);
        }
        .success-text-bold {
          color: var(--success);
          font-weight: 700;
        }
        .total-fare-row {
          border-top: 1px solid var(--border);
          padding-top: 0.75rem;
          margin-top: 0.5rem;
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--dark);
        }
        
        .checkout-alert {
          margin-bottom: 1.25rem !important;
          font-size: 0.85rem !important;
          padding: 0.75rem 1rem !important;
        }
        
        .checkout-cta-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .checkout-pay-btn {
          gap: 0.5rem !important;
        }
        .secure-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }
      `}} />
    </div>
  );
};

export default Checkout;
