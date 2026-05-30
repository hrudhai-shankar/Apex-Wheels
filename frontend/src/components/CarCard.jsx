import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { Users, Fuel, Sparkles, ArrowRight, Heart, ShoppingBag, Star } from 'lucide-react';

const CarCard = ({ car }) => {
  const { _id, name, brand, type, transmission, fuelType, seats, pricePerDay, image, available, rating = 4.5, reviews = 0 } = car;
  const { addToWishlist, removeFromWishlist, isInWishlist, addToCart, isInCart } = useWishlist();

  const isFavorited = isInWishlist(_id);
  const isAddedToCart = isInCart(_id);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorited) {
      removeFromWishlist(_id);
    } else {
      addToWishlist(car);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(car);
  };

  return (
    <div className="card car-card animate-fade-in">
      <div className="car-card-image">
        <img src={image} alt={`${brand} ${name}`} onError={(e) => {
          e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80';
        }} />
        
        {/* Wishlist Icon Button */}
        <button 
          className={`car-wishlist-btn ${isFavorited ? 'active' : ''}`} 
          onClick={handleWishlistToggle}
          title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart size={18} fill={isFavorited ? 'var(--danger)' : 'none'} />
        </button>

        <span className={`badge car-status-badge ${available ? 'badge-success' : 'badge-danger'}`}>
          {available ? 'Available' : 'Rented'}
        </span>
      </div>

      <div className="car-card-content">
        <div className="car-card-header">
          <div>
            <span className="car-brand">{brand}</span>
            <h3 className="car-title">{name}</h3>
            <div className="car-rating" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <Star size={14} fill="#fbbf24" color="#fbbf24" />
              <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{rating}</span>
              <span>({reviews} reviews)</span>
            </div>
          </div>
          <span className="car-type-badge">{type}</span>
        </div>

        <div className="car-specs">
          <div className="spec-item">
            <Users size={16} />
            <span>{seats} Seats</span>
          </div>
          <div className="spec-item">
            <Sparkles size={16} />
            <span>{transmission}</span>
          </div>
          <div className="spec-item">
            <Fuel size={16} />
            <span>{fuelType}</span>
          </div>
        </div>

        <div className="car-card-footer">
          <div className="car-price">
            <span className="price-num">₹{pricePerDay}</span>
            <span className="price-unit">/ day</span>
          </div>
          <div className="car-actions">
            <button 
              className={`btn btn-secondary btn-sm car-cart-btn ${isAddedToCart ? 'added' : ''}`}
              onClick={handleAddToCart}
              disabled={!available}
              title={isAddedToCart ? 'Added to Cart' : 'Add to Cart'}
            >
              <ShoppingBag size={15} />
            </button>
            <Link to={`/cars/${_id}`} className="btn btn-primary btn-sm car-details-btn">
              View
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .car-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          position: relative;
        }
        .car-card-image {
          position: relative;
          height: 200px;
          overflow: hidden;
          background-color: #f1f5f9;
        }
        .car-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .car-card:hover .car-card-image img {
          transform: scale(1.08);
        }
        .car-wishlist-btn {
          position: absolute;
          top: 1rem;
          left: 1rem;
          z-index: 5;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(4px);
          border: none;
          border-radius: var(--radius-full);
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-dark);
          box-shadow: var(--shadow-sm);
          transition: var(--transition-fast);
        }
        .car-wishlist-btn:hover {
          transform: scale(1.1);
          background-color: white;
          color: var(--danger);
        }
        .car-wishlist-btn.active {
          color: var(--danger);
        }
        .car-status-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          z-index: 2;
          font-weight: 700;
          box-shadow: var(--shadow-md);
        }
        .car-card-content {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .car-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        .car-brand {
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }
        .car-title {
          font-size: 1.2rem;
          margin-top: 0.15rem;
          font-weight: 700;
        }
        .car-type-badge {
          font-size: 0.75rem;
          font-weight: 600;
          background-color: var(--bg-light);
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-sm);
          color: var(--text-dark);
          border: 1px solid var(--border);
        }
        .car-specs {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 0.75rem 0;
          margin-bottom: 1.25rem;
        }
        .spec-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.85rem;
          color: var(--text-dark);
          font-weight: 500;
        }
        .car-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }
        .price-num {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--primary);
        }
        .price-unit {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .car-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .car-cart-btn {
          padding: 0.4rem 0.6rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-color: var(--border-focus);
        }
        .car-cart-btn:hover {
          background-color: var(--primary-light);
          color: var(--primary);
          border-color: var(--primary);
        }
        .car-cart-btn.added {
          background-color: var(--primary);
          color: white;
          border-color: var(--primary);
        }
        .car-details-btn {
          gap: 0.25rem !important;
        }
      `}} />
    </div>
  );
};

export default CarCard;
