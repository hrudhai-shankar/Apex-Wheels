import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../utils/api';
import { Calendar, CreditCard, ChevronRight, AlertCircle, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  if (user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.bookings.getMyBookings();
      setBookings(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve your booking history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return <span className="badge badge-success">Confirmed</span>;
      case 'Pending':
        return <span className="badge badge-warning">Pending</span>;
      case 'Cancelled':
        return <span className="badge badge-danger">Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <span className="badge badge-success" style={{ textTransform: 'none' }}>Paid</span>;
      case 'Pending':
        return <span className="badge badge-warning" style={{ textTransform: 'none' }}>Pending Payment</span>;
      case 'Failed':
        return <span className="badge badge-danger" style={{ textTransform: 'none' }}>Failed</span>;
      default:
        return <span className="badge" style={{ textTransform: 'none' }}>{status}</span>;
    }
  };

  return (
    <div className="bookings-page container animate-fade-in">
      <div className="bookings-header">
        <h1>My <span className="text-gradient">Bookings</span></h1>
        <p>View and manage all your active and previous car rental reservations.</p>
      </div>

      {loading ? (
        <div className="listing-loader" style={{ minHeight: '40vh' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
          <p>Retrieving your reservations...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger" style={{ maxWidth: '500px', margin: '2rem auto' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      ) : bookings.length > 0 ? (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking._id} className="card booking-item animate-fade-in">
              <div className="booking-car-info">
                <img src={booking.car.image} alt={booking.car.name} onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80';
                }} />
                <div>
                  <span className="booking-item-brand">{booking.car.brand}</span>
                  <h3>{booking.car.name}</h3>
                  <p className="booking-item-meta">{booking.car.type} &bull; {booking.car.seats} Seats</p>
                </div>
              </div>

              <div className="booking-schedule-info">
                <div className="schedule-block">
                  <Calendar size={16} />
                  <div>
                    <span>Pickup Date</span>
                    <strong>{formatDate(booking.startDate)}</strong>
                  </div>
                </div>
                <div className="schedule-block">
                  <Calendar size={16} />
                  <div>
                    <span>Drop-off Date</span>
                    <strong>{formatDate(booking.endDate)}</strong>
                  </div>
                </div>
              </div>

              <div className="booking-financial-info">
                <div>
                  <span>Total Duration</span>
                  <strong>{booking.totalDays} {booking.totalDays === 1 ? 'Day' : 'Days'}</strong>
                </div>
                <div>
                  <span>Total Cost</span>
                  <strong className="booking-cost-highlight">₹{booking.totalAmount}</strong>
                </div>
              </div>

              <div className="booking-status-info">
                <div className="status-row">
                  <span>Booking Status:</span>
                  {getStatusBadge(booking.status)}
                </div>
                <div className="status-row">
                  <span>Payment:</span>
                  {getPaymentBadge(booking.paymentStatus)}
                </div>
                {booking.paymentStatus === 'Paid' && (
                  <div className="payment-id-tag">
                    <ShieldCheck size={12} />
                    <span>ID: {booking.razorpayPaymentId.slice(0, 16)}...</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card empty-bookings card">
          <ShoppingBag size={48} className="empty-icon" />
          <h3>No Reservations Found</h3>
          <p>You haven't rented any cars yet! Explore our premium selection of vehicles to start your first trip.</p>
          <Link to="/cars" className="btn btn-primary">
            Explore Vehicles
          </Link>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .bookings-page {
          padding: 3rem 1.5rem 5rem 1.5rem;
        }
        .bookings-header {
          text-align: center;
          margin-bottom: 3.5rem;
        }
        .bookings-header h1 {
          font-size: 2.25rem;
          margin-bottom: 0.5rem;
        }
        .bookings-header p {
          color: var(--text-muted);
        }
        
        .bookings-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 1000px;
          margin: 0 auto;
        }
        .booking-item {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1fr 1fr;
          padding: 1.5rem;
          background-color: var(--bg-white);
          align-items: center;
          gap: 1.5rem;
        }
        @media (max-width: 900px) {
          .booking-item {
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
          }
        }
        @media (max-width: 576px) {
          .booking-item {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
        }
        
        .booking-car-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .booking-car-info img {
          width: 100px;
          height: 70px;
          object-fit: cover;
          border-radius: var(--radius-md);
          background-color: #f1f5f9;
          border: 1px solid var(--border);
        }
        .booking-item-brand {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .booking-car-info h3 {
          font-size: 1.1rem;
          line-height: 1.2;
          margin-top: 0.1rem;
        }
        .booking-item-meta {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }
        
        .booking-schedule-info {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .schedule-block {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary);
        }
        .schedule-block div {
          display: flex;
          flex-direction: column;
        }
        .schedule-block span {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
          line-height: 1.2;
        }
        .schedule-block strong {
          font-size: 0.9rem;
          color: var(--dark);
          line-height: 1.2;
        }
        
        .booking-financial-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .booking-financial-info div {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .booking-financial-info strong {
          color: var(--dark);
        }
        .booking-cost-highlight {
          color: var(--primary) !important;
          font-size: 1.15rem;
          font-weight: 800 !important;
        }
        
        .booking-status-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .status-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .payment-id-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          background-color: var(--bg-light);
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
          font-family: monospace;
          border: 1px solid var(--border);
          margin-top: 0.25rem;
        }
        
        .empty-bookings {
          text-align: center;
          padding: 5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          background-color: var(--bg-white);
          max-width: 600px;
          margin: 0 auto;
        }
        .empty-icon {
          color: var(--text-muted);
        }
        .empty-bookings h3 {
          font-size: 1.35rem;
        }
        .empty-bookings p {
          color: var(--text-muted);
          max-width: 450px;
          margin-bottom: 0.5rem;
        }
      `}} />
    </div>
  );
};

export default MyBookings;
