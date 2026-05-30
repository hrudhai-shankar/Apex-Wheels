import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import CarCard from '../components/CarCard';
import { Search, Filter, RefreshCw, SlidersHorizontal, Car } from 'lucide-react';

const CarsListing = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('');
  const [type, setType] = useState('');
  const [rentalType, setRentalType] = useState('');
  const [minRating, setMinRating] = useState('');
  const [seats, setSeats] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Dropdown options extracted dynamically or static
  const brands = ['Tesla', 'BMW', 'Audi', 'Mercedes', 'Ford', 'Toyota', 'Honda', 'Hyundai', 'Porsche', 'Rolls Royce'];
  const types = ['Sedan', 'SUV', 'Electric', 'Coupe', 'Hatchback', 'Luxury', 'Convertible'];
  const rentalTypesList = ['standard', 'luxury', 'vintage', 'wedding'];

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.cars.getAll({
        search,
        brand,
        type,
        rentalType,
        minRating,
        seats,
        maxPrice,
        available: 'true', // Only show available cars to users for renting
      });
      setCars(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  // Fetch cars on initial load
  useEffect(() => {
    fetchCars();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCars();
  };

  const handleResetFilters = () => {
    setSearch('');
    setBrand('');
    setType('');
    setRentalType('');
    setMinRating('');
    setSeats('');
    setMaxPrice('');
    // Trigger fetch after state resets (we can do a simple timeout or direct call if we use a state trigger, let's just trigger a reload)
    setTimeout(() => {
      fetchCars();
    }, 50);
  };

  return (
    <div className="listing-page container animate-fade-in">
      <div className="listing-header">
        <h1>Explore Our <span className="text-gradient">Fleet</span></h1>
        <p>Choose from our diverse fleet of meticulously maintained vehicles suited for any trip.</p>
      </div>

      <div className="listing-layout">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar card">
          <div className="sidebar-header">
            <SlidersHorizontal size={18} />
            <h2>Filters</h2>
          </div>

          <div className="filter-group">
            <label className="form-label">Brand</label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="form-input"
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="form-label">Rental Type</label>
            <select
              value={rentalType}
              onChange={(e) => setRentalType(e.target.value)}
              className="form-input"
            >
              <option value="">All Rental Types</option>
              {rentalTypesList.map((rt) => (
                <option key={rt} value={rt} style={{textTransform: 'capitalize'}}>{rt}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="form-label">Min Rating</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="form-input"
            >
              <option value="">Any Rating</option>
              <option value="3">3+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="5">5 Stars</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="form-label">Min Seats</label>
            <select
              value={seats}
              onChange={(e) => setSeats(e.target.value)}
              className="form-input"
            >
              <option value="">Any Capacity</option>
              <option value="2">2 Seats</option>
              <option value="4">4 Seats</option>
              <option value="5">5 Seats</option>
              <option value="7">7+ Seats</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="form-label">Max Price per Day (₹)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="form-input"
              placeholder="e.g. 5000"
              min="0"
            />
          </div>

          <div className="sidebar-actions">
            <button onClick={fetchCars} className="btn btn-primary btn-full">
              Apply Filters
            </button>
            <button onClick={handleResetFilters} className="btn btn-secondary btn-full reset-btn">
              <RefreshCw size={14} />
              Reset All
            </button>
          </div>
        </aside>

        {/* Cars List Main Section */}
        <main className="listing-main">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="search-bar-form card">
            <div className="search-input-wrapper">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by car model or brand..."
                className="search-input"
              />
            </div>
            <button type="submit" className="btn btn-primary search-submit-btn">
              Search
            </button>
          </form>

          {/* Cars Grid */}
          {loading ? (
            <div className="custom-loader-wrapper animate-fade-in" style={{ padding: '6rem 0' }}>
              <div className="car-loader-container">
                <div className="car-svg-icon">
                  <Car size={32} strokeWidth={1.5} />
                </div>
                <div className="car-loader-track">
                  <div className="car-loader-progress"></div>
                </div>
              </div>
              <p className="car-loader-text">Searching the perfect ride for you...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger listing-error">
              <p>{error}</p>
            </div>
          ) : cars.length > 0 ? (
            <div className="grid grid-cols-2">
              {cars.map((car) => (
                <CarCard key={car._id} car={car} />
              ))}
            </div>
          ) : (
            <div className="card no-results-card">
              <h3>No Vehicles Match Your Search</h3>
              <p>Try resetting the filters or tweaking your search queries to see more available options.</p>
              <button onClick={handleResetFilters} className="btn btn-primary btn-sm">
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .listing-page {
          padding: 3rem 1.5rem;
        }
        .listing-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        .listing-header h1 {
          font-size: 2.25rem;
          margin-bottom: 0.5rem;
        }
        .listing-header p {
          color: var(--text-muted);
        }
        
        .listing-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 2rem;
          align-items: start;
        }
        @media (max-width: 900px) {
          .listing-layout {
            grid-template-columns: 1fr;
          }
        }
        
        .filters-sidebar {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          background-color: var(--bg-white);
        }
        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 0.75rem;
          margin-bottom: 0.5rem;
        }
        .sidebar-header h2 {
          font-size: 1.15rem;
        }
        .sidebar-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
        .reset-btn {
          gap: 0.35rem !important;
        }
        
        .search-bar-form {
          display: flex;
          padding: 0.5rem;
          background-color: var(--bg-white);
          margin-bottom: 2rem;
          gap: 0.5rem;
        }
        .search-input-wrapper {
          position: relative;
          flex-grow: 1;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-muted);
        }
        .search-input {
          width: 100%;
          border: none;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          font-size: 1rem;
          outline: none;
          color: var(--dark);
        }
        
        .listing-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 6rem 0;
          color: var(--text-muted);
          font-weight: 500;
        }
        .no-results-card {
          text-align: center;
          padding: 4rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          background-color: var(--bg-white);
        }
        .no-results-card h3 {
          font-size: 1.35rem;
        }
        .no-results-card p {
          color: var(--text-muted);
          max-width: 450px;
          margin-bottom: 0.5rem;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default CarsListing;
