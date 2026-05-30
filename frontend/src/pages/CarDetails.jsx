import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../utils/api';
import { Users, Fuel, Sparkles, AlertCircle, ArrowLeft, Calendar, Shield, Heart, ShoppingBag, Car } from 'lucide-react';

const SKETCHFAB_MODELS = {
  'Model Y': 'https://sketchfab.com/models/619601e7800d418da5922c4fa7833f74/embed?autostart=1&autospin=0.1&ui_infos=0&ui_watermark=0&ui_help=0',
  'M4 Competition': 'https://sketchfab.com/models/8e87379f40fd40dcac0a751e22c1a188/embed?autostart=1&autospin=0.1&ui_infos=0&ui_watermark=0&ui_help=0',
  'A6 Sedan': 'https://sketchfab.com/models/c9b7cf9c176b458785edd0b12e235364/embed?autostart=1&autospin=0.1&ui_infos=0&ui_watermark=0&ui_help=0',
  'G-Class AMG 63': 'https://sketchfab.com/models/52296f1a65d54a85a2ed7cb67604e554/embed?autostart=1&autospin=0.1&ui_infos=0&ui_watermark=0&ui_help=0',
  'Ioniq 5': 'https://sketchfab.com/models/8d16325eb7974a948627b3cd77f30f52/embed?autostart=1&autospin=0.1&ui_infos=0&ui_watermark=0&ui_help=0',
  'Mustang GT': 'https://sketchfab.com/models/16f0753d26a04a089223f2d9107a777f/embed?autostart=1&autospin=0.1&ui_infos=0&ui_watermark=0&ui_help=0',
  'Fortuner Legend': 'https://sketchfab.com/models/85848bb2609c4d9fae155bc2950553bb/embed?autostart=1&autospin=0.1&ui_infos=0&ui_watermark=0&ui_help=0',
  'Civic Type R': 'https://sketchfab.com/models/e74f17972b2246c0989f64bfca4a0b22/embed?autostart=1&autospin=0.1&ui_infos=0&ui_watermark=0&ui_help=0',
  '911 Carrera S': 'https://sketchfab.com/models/03099042b32943e2840cf2027170327f/embed?autostart=1&autospin=0.1&ui_infos=0&ui_watermark=0&ui_help=0',
  'i20 N Line': 'https://sketchfab.com/models/462ccbe566934c9c81216d7a46cbaee1/embed?autostart=1&autospin=0.1&ui_infos=0&ui_watermark=0&ui_help=0',
};

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist, addToCart, isInCart } = useWishlist();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('3d');

  // Form Booking State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalDays, setTotalDays] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const data = await api.cars.getById(id);
        setCar(data);
      } catch (err) {
        setError(err.message || 'Car details could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    fetchCarDetails();
  }, [id]);

  // Recalculate duration & price in real-time when dates change
  useEffect(() => {
    if (startDate && endDate && car) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start >= end) {
        setBookingError('Drop-off date must be after pickup date');
        setTotalDays(0);
        setTotalAmount(0);
        return;
      }
      
      setBookingError('');
      const diffTime = Math.abs(end - start);
      const hours = diffTime / (1000 * 60 * 60);
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

      const userPlan = user?.plan || 'free';
      
      if (userPlan === 'free' && hours > 12) {
        setBookingError('Free plan allows a maximum rental of 12 hours. Please upgrade to Pro.');
        setTotalDays(0);
        setTotalAmount(0);
        return;
      }
      
      if (userPlan === 'pro' && days > 7) {
        setBookingError('Pro plan is limited to a maximum of 7 days per rental.');
        setTotalDays(0);
        setTotalAmount(0);
        return;
      }

      setTotalDays(days);
      setTotalAmount(days * car.pricePerDay);
    } else {
      setTotalDays(0);
      setTotalAmount(0);
      setBookingError('');
    }
  }, [startDate, endDate, car]);

  const handleBookingSubmit = (e) => {
    e.preventDefault();

    if (!user) {
      // Redirect to login page and preserve checkout state if desired,
      // but standard simple login redirect is highly beginner friendly
      navigate('/login');
      return;
    }

    if (!startDate || !endDate) {
      setBookingError('Please select both Pickup and Drop-off dates');
      return;
    }

    if (totalDays <= 0) {
      setBookingError('Invalid rental duration chosen');
      return;
    }

    // Redirect to checkout and pass data via route state
    navigate('/checkout', {
      state: {
        car,
        startDate,
        endDate,
        totalDays,
        totalAmount,
      }
    });
  };

  // Get tomorrow's date formatted as YYYY-MM-DDTHH:MM for min date attribute
  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const hh = String(today.getHours()).padStart(2, '0');
    const min = String(today.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const getTomorrowString = () => {
    if (!startDate) return getTodayString();
    const pickup = new Date(startDate);
    pickup.setDate(pickup.getDate() + 1);
    const yyyy = pickup.getFullYear();
    const mm = String(pickup.getMonth() + 1).padStart(2, '0');
    const dd = String(pickup.getDate()).padStart(2, '0');
    const hh = String(pickup.getHours()).padStart(2, '0');
    const min = String(pickup.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  if (loading) {
    return (
      <div className="custom-loader-wrapper animate-fade-in" style={{ minHeight: '60vh' }}>
        <div className="car-loader-container">
          <div className="car-svg-icon">
            <Car size={32} strokeWidth={1.5} />
          </div>
          <div className="car-loader-track">
            <div className="car-loader-progress"></div>
          </div>
        </div>
        <p className="car-loader-text">Loading vehicle specifications...</p>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="alert alert-danger" style={{ maxWidth: '500px', margin: '0 auto 2rem auto' }}>
          <AlertCircle size={20} />
          <span>{error || 'Vehicle not found.'}</span>
        </div>
        <Link to="/cars" className="btn btn-secondary">
          <ArrowLeft size={16} />
          Back to Browse Cars
        </Link>
      </div>
    );
  }

  return (
    <div className="details-page container animate-fade-in">
      <Link to="/cars" className="back-link">
        <ArrowLeft size={16} />
        Back to Cars List
      </Link>

      <div className="details-layout">
        {/* Car Details Left Panel */}
        <div className="details-main">
          <div className="details-image-container">
            {SKETCHFAB_MODELS[car.name] && (
              <div className="media-toggle-tabs">
                <button 
                  className={`tab-btn ${viewMode === 'image' ? 'active' : ''}`} 
                  onClick={() => setViewMode('image')}
                >
                  📷 Photos
                </button>
                <button 
                  className={`tab-btn ${viewMode === '3d' ? 'active' : ''}`} 
                  onClick={() => setViewMode('3d')}
                >
                  🚘 Interactive 3D
                </button>
              </div>
            )}
            
            <div className="details-image card">
              {viewMode === '3d' && SKETCHFAB_MODELS[car.name] ? (
                <iframe 
                  title={car.name}
                  className="threed-iframe"
                  src={SKETCHFAB_MODELS[car.name]}
                  frameBorder="0" 
                  allowFullScreen 
                  mozallowfullscreen="true" 
                  webkitallowfullscreen="true" 
                  allow="autoplay; fullscreen; xr-spatial-tracking" 
                  xr-spatial-tracking 
                  execution-while-out-of-viewport 
                  execution-while-not-rendered 
                  web-share
                ></iframe>
              ) : (
                <img src={car.image} alt={car.name} onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
                }} />
              )}
            </div>
          </div>

          <div className="booking-horizontal-bar card">
            <div className="booking-bar-header">
              <h3>Reserve this Vehicle</h3>
              <div className="price-tag-horizontal">
                <span className="tag-price">₹{car.pricePerDay}</span>
                <span className="tag-unit">/ day</span>
              </div>
            </div>

            {bookingError && (
              <div className="alert alert-danger booking-alert">
                <AlertCircle size={16} />
                <span>{bookingError}</span>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="booking-bar-form">
              <div className="form-row-horizontal">
                <div className="form-group-horizontal">
                  <label className="form-label">
                    <Calendar size={14} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                    Pickup Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    className="form-input animate-fade-in"
                    min={getTodayString()}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="form-group-horizontal">
                  <label className="form-label">
                    <Calendar size={14} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                    Drop-off Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    className="form-input animate-fade-in"
                    min={startDate || getTomorrowString()}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={!startDate}
                  />
                </div>

                <div className="booking-actions-horizontal">
                  {totalDays > 0 && (
                    <div className="total-amount-display">
                      <span className="total-label">Total:</span>
                      <span className="total-value">₹{totalAmount}</span>
                    </div>
                  )}
                  <button type="submit" className="btn btn-primary btn-full booking-submit-btn" disabled={!car.available || !!bookingError}>
                    {car.available ? (user ? 'Checkout' : 'Login to Book') : 'Rented out'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="car-info-section">
            <div className="info-header">
              <div>
                <span className="car-brand-large">{car.brand}</span>
                <h1 className="car-title-large">{car.name}</h1>
              </div>
              <span className="car-type-badge-large">{car.type}</span>
            </div>

            <div className="car-specs-grid">
              <div className="spec-card card">
                <Users size={24} className="spec-icon" />
                <div>
                  <h4>Capacity</h4>
                  <p>{car.seats} Seats</p>
                </div>
              </div>

              <div className="spec-card card">
                <Sparkles size={24} className="spec-icon" />
                <div>
                  <h4>Transmission</h4>
                  <p>{car.transmission}</p>
                </div>
              </div>

              <div className="spec-card card">
                <Fuel size={24} className="spec-icon" />
                <div>
                  <h4>Fuel Type</h4>
                  <p>{car.fuelType}</p>
                </div>
              </div>
            </div>

            <div className="car-description card">
              <h3>About this vehicle</h3>
              <p>{car.description}</p>
            </div>
            
            <div className="insurance-card card">
              <Shield size={24} className="insurance-icon" />
              <div>
                <h4>Apex Wheels Standard Coverage included</h4>
                <p>Collision damage waiver, theft protection, and 24/7 roadside mechanical assistance are automatically included in your daily quote.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .details-page {
          padding: 2rem 1.5rem 4rem 1.5rem;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 2rem;
          transition: var(--transition-fast);
        }
        .back-link:hover {
          color: var(--primary);
        }
        
        .details-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
          align-items: start;
          max-width: 1000px;
          margin: 0 auto;
        }
        
        .details-image-container {
          position: relative;
          margin-bottom: 2rem;
        }
        .media-toggle-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .tab-btn {
          background-color: var(--bg-light);
          border: 1px solid var(--border);
          padding: 0.5rem 1rem;
          font-weight: 600;
          font-size: 0.85rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: var(--transition-fast);
          color: var(--text-dark);
        }
        .tab-btn:hover {
          background-color: var(--border);
        }
        .tab-btn.active {
          background-color: var(--primary);
          color: white;
          border-color: var(--primary);
        }
        .threed-iframe {
          width: 100%;
          height: 100%;
          border: none;
          border-radius: var(--radius-md);
        }
        
        .details-image {
          height: 400px;
          width: 100%;
          overflow: hidden;
          background-color: #f8fafc;
          border-radius: var(--radius-md);
        }
        @media (max-width: 576px) {
          .details-image {
            height: 250px;
          }
        }
        .details-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .sidebar-wishlist-btn.active {
          background-color: hsl(0, 84%, 97%) !important;
          border-color: var(--danger) !important;
          color: var(--danger) !important;
        }
        .sidebar-cart-btn.active {
          background-color: var(--primary-light) !important;
          border-color: var(--primary) !important;
          color: var(--primary) !important;
        }

        .car-info-section {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .info-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .car-brand-large {
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .car-title-large {
          font-size: 2.25rem;
          font-weight: 800;
          margin-top: 0.25rem;
        }
        .car-type-badge-large {
          font-size: 0.85rem;
          font-weight: 700;
          background-color: var(--primary-light);
          color: var(--primary);
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-focus);
        }
        
        .car-specs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        @media (max-width: 576px) {
          .car-specs-grid {
            grid-template-columns: 1fr;
          }
        }
        .spec-card {
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          background-color: var(--bg-white);
        }
        .spec-icon {
          color: var(--primary);
        }
        .spec-card h4 {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
        }
        .spec-card p {
          font-size: 1.05rem;
          font-weight: 700;
        }
        
        .car-description, .insurance-card {
          padding: 1.75rem;
          background-color: var(--bg-white);
        }
        .car-description h3 {
          margin-bottom: 0.75rem;
        }
        .car-description p {
          color: var(--text-dark);
          line-height: 1.7;
        }
        .insurance-card {
          display: flex;
          gap: 1rem;
          border-left: 4px solid var(--primary);
        }
        .insurance-icon {
          color: var(--primary);
          flex-shrink: 0;
        }
        .insurance-card h4 {
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }
        .insurance-card p {
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        
        .booking-horizontal-bar {
          padding: 1.5rem 2rem;
          background-color: var(--bg-white);
          border-radius: var(--radius-lg);
          margin-bottom: 2rem;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border);
        }
        .booking-bar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 0.75rem;
        }
        .price-tag-horizontal {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
        }
        .tag-price {
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--primary);
        }
        .tag-unit {
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 500;
        }
        .booking-alert {
          padding: 0.75rem 1rem !important;
          margin-bottom: 1.25rem !important;
          font-size: 0.85rem !important;
        }
        .form-row-horizontal {
          display: grid;
          grid-template-columns: 1fr 1fr auto;
          gap: 1.5rem;
          align-items: end;
        }
        .datetime-inputs {
          display: flex;
          gap: 0.5rem;
        }
        .time-input {
          max-width: 110px;
        }
        .booking-actions-horizontal {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-width: 200px;
        }
        .total-amount-display {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0.75rem;
          background-color: var(--bg-light);
          border-radius: var(--radius-sm);
        }
        .total-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .total-value {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--dark);
        }
        @media (max-width: 768px) {
          .form-row-horizontal {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default CarDetails;
