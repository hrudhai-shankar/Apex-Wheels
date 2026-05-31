import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { Car, Menu, X, LogOut, User, LayoutDashboard, Calendar, Heart, ShoppingBag, Trash2, Crown } from 'lucide-react';
import SubscriptionModal from './SubscriptionModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { wishlist, cart, removeFromWishlist, removeFromCart, addToCart } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleQuickRent = (car) => {
    addToCart(car);
    setWishlistOpen(false);
    setCartOpen(true);
  };

  return (
    <>
      <nav className="navbar">
        <div className="container nav-container">
          <Link to="/" className="nav-logo" onClick={() => setMobileMenuOpen(false)}>
            <Car size={32} className="logo-icon" />
            <span>Apex<span className="logo-accent">Wheels</span></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-links desktop-links">
            <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
            <Link to="/cars" className={`nav-link ${isActive('/cars')}`}>Browse Cars</Link>
            
            {user && user.role !== 'admin' && (
              <Link to="/my-bookings" className={`nav-link ${isActive('/my-bookings')}`}>
                <Calendar size={18} />
                My Bookings
              </Link>
            )}

            {user && user.role === 'admin' && (
              <Link to="/admin" className={`nav-link admin-nav-link ${isActive('/admin')}`}>
                <LayoutDashboard size={18} />
                Admin Panel
              </Link>
            )}
          </div>

          <div className="nav-actions-wrapper desktop-auth">
            {user && user.role !== 'admin' && (!user.plan || user.plan === 'free') && (
              <Link 
                to="/go-pro" 
                className="btn btn-sm" 
                style={{ backgroundColor: '#fbbf24', color: '#000', gap: '0.35rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}
              >
                <Crown size={16} /> Go Pro
              </Link>
            )}

            {/* Wishlist Icon */}
            <button className="nav-action-btn" onClick={() => { setWishlistOpen(true); setCartOpen(false); }} title="Wishlist">
              <Heart size={20} />
              {wishlist.length > 0 && <span className="nav-badge">{wishlist.length}</span>}
            </button>

            {/* Cart Icon */}
            <button className="nav-action-btn" onClick={() => { setCartOpen(true); setWishlistOpen(false); }} title="Rental Cart">
              <ShoppingBag size={20} />
              {cart.length > 0 && <span className="nav-badge badge-primary">{cart.length}</span>}
            </button>

            <span className="nav-divider"></span>

            {user ? (
              <div className="user-menu">
                <span className="user-welcome">
                  <User size={16} />
                  Hi, <strong>{user.name.split(' ')[0]}</strong>
                </span>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </div>
            )}
          </div>

          {/* Mobile Actions Container */}
          <div className="mobile-actions">
            <button className="nav-action-btn" onClick={() => setWishlistOpen(true)}>
              <Heart size={20} />
              {wishlist.length > 0 && <span className="nav-badge">{wishlist.length}</span>}
            </button>

            <button className="nav-action-btn" onClick={() => setCartOpen(true)}>
              <ShoppingBag size={20} />
              {cart.length > 0 && <span className="nav-badge badge-primary">{cart.length}</span>}
            </button>

            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-menu animate-fade-in">
            <Link to="/" className={`mobile-link ${isActive('/')}`} onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/cars" className={`mobile-link ${isActive('/cars')}`} onClick={() => setMobileMenuOpen(false)}>Browse Cars</Link>
            
            {user && user.role !== 'admin' && (
              <Link to="/my-bookings" className={`mobile-link ${isActive('/my-bookings')}`} onClick={() => setMobileMenuOpen(false)}>
                My Bookings
              </Link>
            )}

            {user && user.role === 'admin' && (
              <Link to="/admin" className={`mobile-link mobile-admin-link ${isActive('/admin')}`} onClick={() => setMobileMenuOpen(false)}>
                Admin Panel
              </Link>
            )}

            <div className="mobile-auth-section">
              {user && user.role !== 'admin' && (!user.plan || user.plan === 'free') && (
                <Link 
                  to="/go-pro" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-full" 
                  style={{ backgroundColor: '#fbbf24', color: '#000', marginBottom: '1rem', fontWeight: 700, gap: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Crown size={18} /> Go Pro Upgrade
                </Link>
              )}
              {user ? (
                <div className="mobile-user-info">
                  <p className="mobile-welcome">Logged in as <strong>{user.name}</strong></p>
                  <button onClick={handleLogout} className="btn btn-danger btn-full">
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="mobile-auth-buttons">
                  <Link to="/login" className="btn btn-secondary btn-full" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="btn btn-primary btn-full" onClick={() => setMobileMenuOpen(false)}>Register</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Drawers Overlay */}
      {(wishlistOpen || cartOpen) && (
        <div className="drawer-overlay" onClick={() => { setWishlistOpen(false); setCartOpen(false); }}></div>
      )}

      {/* Wishlist Drawer */}
      <div className={`drawer ${wishlistOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h3>Your Wishlist</h3>
          <button className="drawer-close" onClick={() => setWishlistOpen(false)}><X size={22} /></button>
        </div>
        <div className="drawer-content">
          {wishlist.length === 0 ? (
            <div className="drawer-empty">
              <Heart size={48} className="empty-icon" />
              <p>Your wishlist is empty.</p>
              <Link to="/cars" className="btn btn-primary btn-sm" onClick={() => setWishlistOpen(false)}>Browse Cars</Link>
            </div>
          ) : (
            <div className="drawer-list">
              {wishlist.map((car) => (
                <div key={car.id} className="drawer-item">
                  <img src={car.image || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d'} alt={car.name} className="drawer-item-img" />
                  <div className="drawer-item-info">
                    <h4>{car.brand} {car.name}</h4>
                    <p className="drawer-item-price">₹{car.price_per_day || car.pricePerDay} / day</p>
                    <div className="drawer-item-actions">
                      <button className="btn btn-primary btn-sm" onClick={() => handleQuickRent(car)}>Rent Now</button>
                      <button className="drawer-delete-btn" onClick={() => removeFromWishlist(car.id)}><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart Drawer */}
      <div className={`drawer ${cartOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h3>Selected Rentals</h3>
          <button className="drawer-close" onClick={() => setCartOpen(false)}><X size={22} /></button>
        </div>
        <div className="drawer-content">
          {cart.length === 0 ? (
            <div className="drawer-empty">
              <ShoppingBag size={48} className="empty-icon" />
              <p>No vehicles added for checkout.</p>
              <Link to="/cars" className="btn btn-primary btn-sm" onClick={() => setCartOpen(false)}>Choose a Ride</Link>
            </div>
          ) : (
            <div className="drawer-list">
              {cart.map((car) => (
                <div key={car.id} className="drawer-item">
                  <img src={car.image || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d'} alt={car.name} className="drawer-item-img" />
                  <div className="drawer-item-info">
                    <h4>{car.brand} {car.name}</h4>
                    <p className="drawer-item-price">₹{car.price_per_day || car.pricePerDay} / day</p>
                    <div className="drawer-item-actions">
                      <Link to={`/cars/${car.id}`} className="btn btn-secondary btn-sm" onClick={() => setCartOpen(false)}>Configure Dates</Link>
                      <button className="drawer-delete-btn" onClick={() => removeFromCart(car.id)}><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="drawer-footer">
                <p>Configure dates on the vehicle details page to complete booking.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <SubscriptionModal 
        isOpen={subscriptionModalOpen} 
        onClose={() => setSubscriptionModalOpen(false)} 
      />

      <style dangerouslySetInnerHTML={{__html: `
        .navbar {
          background-color: var(--bg-white);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 100;
          height: 70px;
          display: flex;
          align-items: center;
        }
        .nav-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--dark);
          transition: var(--transition-fast);
        }
        .nav-logo:hover {
          opacity: 0.9;
        }
        .logo-icon {
          color: var(--primary);
        }
        .logo-accent {
          color: var(--primary);
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .nav-link {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text-dark);
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-sm);
          transition: var(--transition-fast);
        }
        .nav-link:hover {
          color: var(--primary);
          background-color: var(--primary-light);
        }
        .nav-link.active {
          color: var(--primary);
          background-color: var(--primary-light);
        }
        .admin-nav-link {
          color: hsl(270, 75%, 60%);
        }
        .admin-nav-link:hover, .admin-nav-link.active {
          color: hsl(270, 75%, 65%);
          background-color: hsl(270, 75%, 97%);
        }
        
        /* Action Buttons & Badges */
        .nav-actions-wrapper {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .nav-action-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-dark);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          transition: var(--transition-fast);
        }
        .nav-action-btn:hover {
          background-color: var(--primary-light);
          color: var(--primary);
        }
        .nav-badge {
          position: absolute;
          top: 0;
          right: 0;
          background-color: var(--danger);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          height: 16px;
          min-width: 16px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
        }
        .nav-badge.badge-primary {
          background-color: var(--primary);
        }
        .nav-divider {
          width: 1px;
          height: 24px;
          background-color: var(--border);
        }
        
        .user-menu {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .user-welcome {
          font-size: 0.9rem;
          color: var(--text-dark);
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .auth-buttons {
          display: flex;
          gap: 0.75rem;
        }
        
        /* Mobile Layout */
        .mobile-actions {
          display: none;
          align-items: center;
          gap: 0.5rem;
        }
        .mobile-menu-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--dark);
          padding: 0.25rem;
        }
        .mobile-menu {
          position: absolute;
          top: 70px;
          left: 0;
          width: 100%;
          background-color: var(--bg-white);
          border-bottom: 1px solid var(--border);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          box-shadow: var(--shadow-lg);
        }
        .mobile-link {
          font-weight: 600;
          padding: 0.75rem 0.5rem;
          border-bottom: 1px solid var(--bg-light);
          color: var(--text-dark);
        }
        .mobile-link.active {
          color: var(--primary);
          padding-left: 0.75rem;
          border-left: 3px solid var(--primary);
        }
        .mobile-admin-link {
          color: hsl(270, 75%, 60%);
        }
        .mobile-auth-section {
          margin-top: 0.5rem;
        }
        .mobile-user-info {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .mobile-welcome {
          font-size: 0.95rem;
          color: var(--text-dark);
          text-align: center;
        }

        /* Drawers CSS */
        .drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }
        .drawer {
          position: fixed;
          right: -400px;
          top: 0;
          width: 400px;
          max-width: 100vw;
          height: 100vh;
          background-color: var(--bg-white);
          box-shadow: var(--shadow-xl);
          transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 1001;
          display: flex;
          flex-direction: column;
        }
        .drawer.open {
          right: 0;
        }
        .drawer-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .drawer-header h3 {
          font-size: 1.2rem;
          font-weight: 700;
        }
        .drawer-close {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          transition: var(--transition-fast);
        }
        .drawer-close:hover {
          color: var(--dark);
        }
        .drawer-content {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
        }
        .drawer-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          height: 60%;
          text-align: center;
          color: var(--text-muted);
        }
        .empty-icon {
          color: var(--border);
        }
        .drawer-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .drawer-item {
          display: flex;
          gap: 1rem;
          align-items: center;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid var(--border);
        }
        .drawer-item-img {
          width: 80px;
          height: 60px;
          object-fit: cover;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
        }
        .drawer-item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .drawer-item-info h4 {
          font-size: 0.95rem;
          font-weight: 700;
        }
        .drawer-item-price {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .drawer-item-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.25rem;
        }
        .drawer-delete-btn {
          background: none;
          border: 1px solid var(--border);
          color: var(--danger);
          padding: 0.35rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-fast);
        }
        .drawer-delete-btn:hover {
          background-color: var(--danger-light);
          border-color: var(--danger);
        }
        .drawer-footer {
          margin-top: 1rem;
          padding: 1rem;
          background-color: var(--bg-light);
          border-radius: var(--radius-md);
          font-size: 0.8rem;
          color: var(--text-muted);
          text-align: center;
        }
        
        @media (max-width: 768px) {
          .desktop-links, .desktop-auth {
            display: none;
          }
          .mobile-actions {
            display: flex;
          }
        }
      `}} />
    </>
  );
};

export default Navbar;
