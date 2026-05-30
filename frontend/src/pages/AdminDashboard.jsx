import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Car, Calendar, Users, IndianRupee, ShieldCheck, AlertCircle, Plus, Edit2, Trash2, X, Check, PieChart, Activity, DollarSign } from 'lucide-react';

const AdminDashboard = () => {
  const { user: authUser } = useAuth();
  
  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, cars, bookings, users, payments

  // Data States
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Car Form Modal States
  const [showCarModal, setShowCarModal] = useState(false);
  const [editingCarId, setEditingCarId] = useState(null);
  const [carFormData, setCarFormData] = useState({
    name: '',
    brand: '',
    type: 'Sedan',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    pricePerDay: '',
    image: '',
    description: '',
    available: true,
  });

  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Fetch Dashboard Data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
        if (activeTab === 'analytics') {
          const [carsData, bookingsData, usersData] = await Promise.all([
            api.cars.getAll(),
            api.bookings.getAllBookings(),
            api.users.getAll()
          ]);
          setCars(carsData);
          setBookings(bookingsData);
          setUsers(usersData);
        } else if (activeTab === 'cars') {
          const data = await api.cars.getAll();
          setCars(data);
        } else if (activeTab === 'bookings' || activeTab === 'payments') {
          const data = await api.bookings.getAllBookings();
          setBookings(data);
        } else if (activeTab === 'users') {
          const data = await api.users.getAll();
          setUsers(data);
        }
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // CAR CRUD OPERATIONS
  const handleCarFormChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setCarFormData({
      ...carFormData,
      [e.target.name]: val,
    });
  };

  const handleOpenAddModal = () => {
    setEditingCarId(null);
    setCarFormData({
      name: '',
      brand: '',
      type: 'Sedan',
      transmission: 'Automatic',
      fuelType: 'Petrol',
      seats: 5,
      pricePerDay: '',
      image: '',
      description: '',
      available: true,
    });
    setFormError('');
    setShowCarModal(true);
  };

  const handleOpenEditModal = (car) => {
    setEditingCarId(car._id);
    setCarFormData({
      name: car.name,
      brand: car.brand,
      type: car.type,
      transmission: car.transmission,
      fuelType: car.fuelType,
      seats: car.seats,
      pricePerDay: car.pricePerDay,
      image: car.image,
      description: car.description,
      available: car.available,
    });
    setFormError('');
    setShowCarModal(true);
  };

  const handleCarFormSubmit = async (e) => {
    e.preventDefault();
    const { name, brand, pricePerDay, image, description } = carFormData;

    if (!name || !brand || !pricePerDay || !image || !description) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      setFormLoading(true);
      setFormError('');

      const carPayload = {
        ...carFormData,
        seats: Number(carFormData.seats),
        pricePerDay: Number(carFormData.pricePerDay),
      };

      if (editingCarId) {
        await api.cars.update(editingCarId, carPayload);
        showSuccess('Car updated successfully!');
      } else {
        await api.cars.create(carPayload);
        showSuccess('New car added successfully!');
      }

      setShowCarModal(false);
      fetchData();
    } catch (err) {
      setFormError(err.message || 'Error processing vehicle request.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCar = async (id) => {
    if (window.confirm('Are you sure you want to delete this car? This action is irreversible.')) {
      try {
        await api.cars.delete(id);
        showSuccess('Car removed successfully!');
        fetchData();
      } catch (err) {
        setError(err.message || 'Failed to remove car');
      }
    }
  };

  // USER DELETION
  const handleDeleteUser = async (id) => {
    if (id === authUser._id) {
      alert('You cannot delete your own admin account.');
      return;
    }

    if (window.confirm('Are you sure you want to remove this user? All their bookings will be cancelled and deleted.')) {
      try {
        await api.users.delete(id);
        showSuccess('User account and related bookings deleted successfully!');
        fetchData();
      } catch (err) {
        setError(err.message || 'Failed to remove user account');
      }
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="admin-page container animate-fade-in">
      <div className="admin-header">
        <div>
          <h1>Admin <span className="text-gradient">Control Panel</span></h1>
          <p>Fleet metrics, booking transactions, and user management.</p>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger animate-fade-in">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="admin-layout card">
        {/* Sidebar Nav */}
        <aside className="admin-sidebar">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`admin-side-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          >
            <PieChart size={18} />
            <span>Analytics Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('cars')}
            className={`admin-side-btn ${activeTab === 'cars' ? 'active' : ''}`}
          >
            <Car size={18} />
            <span>Manage Cars</span>
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`admin-side-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          >
            <Calendar size={18} />
            <span>View Bookings</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`admin-side-btn ${activeTab === 'users' ? 'active' : ''}`}
          >
            <Users size={18} />
            <span>Manage Users</span>
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`admin-side-btn ${activeTab === 'payments' ? 'active' : ''}`}
          >
            <ShieldCheck size={18} />
            <span>View Payments</span>
          </button>
        </aside>

        {/* Dashboard Main Area */}
        <main className="admin-main">
          {/* TAB 0: ANALYTICS & STATS */}
          {activeTab === 'analytics' && (
            <div>
              <div className="tab-title-row">
                <h2>Company Analytics & Statistics</h2>
              </div>
              
              {loading ? (
                <div className="tab-loader"><div className="spinner"></div></div>
              ) : (
                <div className="analytics-grid">
                  <div className="stat-card card">
                    <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                      <DollarSign size={24} />
                    </div>
                    <div className="stat-info">
                      <h3>Total Revenue</h3>
                      <p className="stat-value">₹{bookings.filter(b => b.paymentStatus === 'Paid').reduce((acc, curr) => acc + curr.totalAmount, 0).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="stat-card card">
                    <div className="stat-icon-wrapper" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                      <Calendar size={24} />
                    </div>
                    <div className="stat-info">
                      <h3>Total Bookings</h3>
                      <p className="stat-value">{bookings.length}</p>
                    </div>
                  </div>

                  <div className="stat-card card">
                    <div className="stat-icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                      <Car size={24} />
                    </div>
                    <div className="stat-info">
                      <h3>Fleet Size</h3>
                      <p className="stat-value">{cars.length}</p>
                    </div>
                  </div>

                  <div className="stat-card card">
                    <div className="stat-icon-wrapper" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                      <Users size={24} />
                    </div>
                    <div className="stat-info">
                      <h3>Registered Users</h3>
                      <p className="stat-value">{users.length}</p>
                    </div>
                  </div>

                  <div className="stat-card card">
                    <div className="stat-icon-wrapper" style={{ backgroundColor: '#f3e8ff', color: '#7c3aed' }}>
                      <ShieldCheck size={24} />
                    </div>
                    <div className="stat-info">
                      <h3>Paid Users</h3>
                      <p className="stat-value">{users.filter(u => u.plan === 'pro').length}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 1: MANAGE CARS */}
          {activeTab === 'cars' && (
            <div>
              <div className="tab-title-row">
                <h2>Registered Vehicles ({cars.length})</h2>
                <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm add-car-btn">
                  <Plus size={16} />
                  Add New Car
                </button>
              </div>

              {loading ? (
                <div className="tab-loader"><div className="spinner"></div></div>
              ) : cars.length > 0 ? (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Preview</th>
                        <th>Brand & Model</th>
                        <th>Specification</th>
                        <th>Seats</th>
                        <th>Price/Day</th>
                        <th>Availability</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cars.map((car) => (
                        <tr key={car._id}>
                          <td>
                            <img className="admin-car-thumb" src={car.image} alt={car.name} onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=100&q=80';
                            }} />
                          </td>
                          <td>
                            <strong>{car.brand} {car.name}</strong>
                            <span className="table-subtext">{car.type}</span>
                          </td>
                          <td>
                            <span className="table-badge">{car.transmission}</span>
                            <span className="table-badge" style={{ marginLeft: '4px' }}>{car.fuelType}</span>
                          </td>
                          <td>{car.seats} Seats</td>
                          <td><strong>₹{car.pricePerDay}</strong></td>
                          <td>
                            <span className={`badge ${car.available ? 'badge-success' : 'badge-danger'}`}>
                              {car.available ? 'Available' : 'Rented'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="table-actions">
                              <button onClick={() => handleOpenEditModal(car)} className="action-btn edit-btn" title="Edit Car">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => handleDeleteCar(car._id)} className="action-btn delete-btn" title="Delete Car">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-data">No cars found in the database. Get started by adding a vehicle!</p>
              )}
            </div>
          )}

          {/* TAB 2: VIEW BOOKINGS */}
          {activeTab === 'bookings' && (
            <div>
              <div className="tab-title-row">
                <h2>All Bookings ({bookings.length})</h2>
              </div>

              {loading ? (
                <div className="tab-loader"><div className="spinner"></div></div>
              ) : bookings.length > 0 ? (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>User Account</th>
                        <th>Car Model</th>
                        <th>Dates</th>
                        <th>Days</th>
                        <th>Total Cost</th>
                        <th>Booking Status</th>
                        <th>Payment Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking._id}>
                          <td>
                            {booking.user ? (
                              <div>
                                <strong>{booking.user.name}</strong>
                                <span className="table-subtext">{booking.user.email}</span>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Deleted User</span>
                            )}
                          </td>
                          <td>
                            <strong>{booking.car.brand} {booking.car.name}</strong>
                            <span className="table-subtext">{booking.car.type}</span>
                          </td>
                          <td>
                            <strong>{formatDate(booking.startDate)}</strong>
                            <span className="table-subtext">to {formatDate(booking.endDate)}</span>
                          </td>
                          <td>{booking.totalDays} Days</td>
                          <td><strong>₹{booking.totalAmount}</strong></td>
                          <td>
                            <span className={`badge ${
                              booking.status === 'Confirmed' ? 'badge-success' :
                              booking.status === 'Pending' ? 'badge-warning' : 'badge-danger'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${
                              booking.paymentStatus === 'Paid' ? 'badge-success' :
                              booking.paymentStatus === 'Pending' ? 'badge-warning' : 'badge-danger'
                            }`} style={{ textTransform: 'none' }}>
                              {booking.paymentStatus === 'Paid' ? 'Paid' : booking.paymentStatus === 'Pending' ? 'Pending' : 'Failed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-data">No reservation transactions have been made yet.</p>
              )}
            </div>
          )}

          {/* TAB 3: MANAGE USERS */}
          {activeTab === 'users' && (
            <div>
              <div className="tab-title-row">
                <h2>Registered Users ({users.length})</h2>
              </div>

              {loading ? (
                <div className="tab-loader"><div className="spinner"></div></div>
              ) : users.length > 0 ? (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Account Name</th>
                        <th>Email Address</th>
                        <th>Platform Role</th>
                        <th>Subscription Plan</th>
                        <th>Registered Date</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id}>
                          <td><strong>{u.name}</strong></td>
                          <td>{u.email}</td>
                          <td>
                            <span className={`badge ${u.role === 'admin' ? 'badge-danger' : 'badge-success'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${u.plan === 'pro' ? 'badge-primary' : 'badge-warning'}`} style={{ backgroundColor: u.plan === 'pro' ? '#7c3aed' : '', color: u.plan === 'pro' ? '#ffffff' : '' }}>
                              {u.plan === 'pro' ? 'Paid User (Pro)' : 'Free User'}
                            </span>
                          </td>
                          <td>{formatDate(u.createdAt)}</td>
                          <td style={{ textAlign: 'right' }}>
                            {u._id !== authUser._id ? (
                              <button onClick={() => handleDeleteUser(u._id)} className="action-btn delete-btn" title="Delete User">
                                <Trash2 size={16} />
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Admin</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-data">No accounts registered on the platform.</p>
              )}
            </div>
          )}

          {/* TAB 4: VIEW PAYMENTS */}
          {activeTab === 'payments' && (
            <div>
              <div className="tab-title-row">
                <h2>Payment Logs</h2>
              </div>

              {loading ? (
                <div className="tab-loader"><div className="spinner"></div></div>
              ) : bookings.filter(b => b.paymentStatus === 'Paid').length > 0 ? (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Car</th>
                        <th>Razorpay Order ID</th>
                        <th>Razorpay Payment ID</th>
                        <th>Paid Fare</th>
                        <th>Booking Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.filter(b => b.paymentStatus === 'Paid').map((b) => (
                        <tr key={b._id}>
                          <td>
                            {b.user ? (
                              <div>
                                <strong>{b.user.name}</strong>
                                <span className="table-subtext">{b.user.email}</span>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Deleted User</span>
                            )}
                          </td>
                          <td><strong>{b.car.brand} {b.car.name}</strong></td>
                          <td><span className="code-font">{b.razorpayOrderId}</span></td>
                          <td><span className="code-font">{b.razorpayPaymentId}</span></td>
                          <td><strong className="success-text-bold">₹{b.totalAmount}</strong></td>
                          <td>
                            <span className="badge badge-success">Confirmed</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-data">No paid transactions have logged in yet.</p>
              )}
            </div>
          )}
        </main>
      </div>

      {/* CAR ADD/EDIT MODAL OVERLAY */}
      {showCarModal && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content card animate-fade-in">
            <div className="modal-header">
              <h3>{editingCarId ? 'Update Vehicle Properties' : 'Register New Vehicle'}</h3>
              <button onClick={() => setShowCarModal(false)} className="close-modal-btn">
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="alert alert-danger" style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCarFormSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Car Model Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="e.g. Model 3"
                    value={carFormData.name}
                    onChange={handleCarFormChange}
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Brand Maker</label>
                  <input
                    type="text"
                    name="brand"
                    className="form-input"
                    placeholder="e.g. Tesla"
                    value={carFormData.brand}
                    onChange={handleCarFormChange}
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Body Class Type</label>
                  <select
                    name="type"
                    className="form-input"
                    value={carFormData.type}
                    onChange={handleCarFormChange}
                    disabled={formLoading}
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Electric">Electric</option>
                    <option value="Coupe">Coupe</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Transmission</label>
                  <select
                    name="transmission"
                    className="form-input"
                    value={carFormData.transmission}
                    onChange={handleCarFormChange}
                    disabled={formLoading}
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Fuel Source</label>
                  <select
                    name="fuelType"
                    className="form-input"
                    value={carFormData.fuelType}
                    onChange={handleCarFormChange}
                    disabled={formLoading}
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Cabin Capacity</label>
                  <select
                    name="seats"
                    className="form-input"
                    value={carFormData.seats}
                    onChange={handleCarFormChange}
                    disabled={formLoading}
                  >
                    <option value="2">2 Seats</option>
                    <option value="4">4 Seats</option>
                    <option value="5">5 Seats</option>
                    <option value="7">7 Seats</option>
                    <option value="8">8+ Seats</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Daily Fare (₹)</label>
                  <input
                    type="number"
                    name="pricePerDay"
                    className="form-input"
                    placeholder="e.g. 79"
                    value={carFormData.pricePerDay}
                    onChange={handleCarFormChange}
                    disabled={formLoading}
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Car Image URL</label>
                  <input
                    type="url"
                    name="image"
                    className="form-input"
                    placeholder="Unsplash image URL"
                    value={carFormData.image}
                    onChange={handleCarFormChange}
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Short Description</label>
                <textarea
                  name="description"
                  className="form-input"
                  rows="3"
                  placeholder="Summarize the specifications and premium traits of the vehicle..."
                  value={carFormData.description}
                  onChange={handleCarFormChange}
                  disabled={formLoading}
                ></textarea>
              </div>

              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  name="available"
                  id="available"
                  className="checkbox-input"
                  checked={carFormData.available}
                  onChange={handleCarFormChange}
                  disabled={formLoading}
                />
                <label htmlFor="available" className="checkbox-label">
                  Car is active and immediately available for rent listings
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowCarModal(false)} className="btn btn-secondary" disabled={formLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : editingCarId ? 'Save Changes' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .admin-page {
          padding: 3rem 1.5rem 5rem 1.5rem;
        }
        .admin-header {
          margin-bottom: 2.5rem;
        }
        .admin-header h1 {
          font-size: 2.25rem;
          margin-bottom: 0.5rem;
        }
        .admin-header p {
          color: var(--text-muted);
        }
        
        .admin-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          background-color: var(--bg-white);
          min-height: 500px;
        }
        @media (max-width: 768px) {
          .admin-layout {
            grid-template-columns: 1fr;
          }
        }
        
        .admin-sidebar {
          border-right: 1px solid var(--border);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        @media (max-width: 768px) {
          .admin-sidebar {
            border-right: none;
            border-bottom: 1px solid var(--border);
            flex-direction: row;
            overflow-x: auto;
            padding: 1rem;
          }
        }
        .admin-side-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          color: var(--text-dark);
          font-weight: 600;
          font-size: 0.95rem;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition-fast);
          text-align: left;
        }
        @media (max-width: 768px) {
          .admin-side-btn {
            flex-shrink: 0;
          }
        }
        .admin-side-btn:hover {
          background-color: var(--bg-light);
          color: var(--primary);
        }
        .admin-side-btn.active {
          background-color: var(--primary-light);
          color: var(--primary);
        }
        
        .admin-main {
          padding: 2.5rem;
        }
        @media (max-width: 576px) {
          .admin-main {
            padding: 1.25rem;
          }
        }
        .tab-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 1rem;
        }
        .tab-title-row h2 {
          font-size: 1.35rem;
        }
        .add-car-btn {
          gap: 0.25rem !important;
        }
        
        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.9rem;
        }
        .admin-table th {
          padding: 0.75rem 1rem;
          background-color: var(--bg-light);
          color: var(--text-muted);
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid var(--border);
        }
        .admin-table td {
          padding: 1rem;
          border-bottom: 1px solid var(--border);
          color: var(--text-dark);
          vertical-align: middle;
        }
        
        /* Analytics Tab Styles */
        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }
        .stat-card {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          background-color: var(--bg-white);
        }
        .stat-icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .stat-info h3 {
          font-size: 0.9rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }
        .stat-value {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--text-dark);
        }

        .admin-car-thumb {
          width: 60px;
          height: 40px;
          object-fit: cover;
          border-radius: var(--radius-sm);
          background-color: #f1f5f9;
          border: 1px solid var(--border);
        }
        .table-subtext {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.1rem;
          font-weight: 500;
        }
        .table-badge {
          font-size: 0.7rem;
          font-weight: 600;
          background-color: var(--bg-light);
          padding: 0.15rem 0.4rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
        }
        .table-actions {
          display: inline-flex;
          gap: 0.5rem;
        }
        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-fast);
          border: 1px solid var(--border);
          background: none;
        }
        .edit-btn {
          color: var(--primary);
        }
        .edit-btn:hover {
          background-color: var(--primary-light);
          border-color: var(--border-focus);
        }
        .delete-btn {
          color: var(--danger);
        }
        .delete-btn:hover {
          background-color: var(--danger-light);
          border-color: hsl(0, 84%, 90%);
        }
        .code-font {
          font-family: monospace;
          font-size: 0.8rem;
          color: var(--text-muted);
          background-color: var(--bg-light);
          padding: 0.2rem 0.4rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
        }
        .no-data {
          text-align: center;
          padding: 3rem;
          color: var(--text-muted);
          font-size: 0.95rem;
        }
        
        /* Modal Popup Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }
        .modal-content {
          width: 100%;
          max-width: 650px;
          background-color: var(--bg-white);
          padding: 2rem;
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border);
          padding-bottom: 1rem;
          margin-bottom: 1.5rem;
        }
        .close-modal-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          transition: var(--transition-fast);
        }
        .close-modal-btn:hover {
          color: var(--dark);
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        @media (max-width: 576px) {
          .form-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        .checkbox-input {
          width: 16px;
          height: 16px;
          accent-color: var(--primary);
        }
        .checkbox-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-dark);
          user-select: none;
          cursor: pointer;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1.5rem;
          border-top: 1px solid var(--border);
          padding-top: 1.25rem;
        }
        
        .tab-loader {
          display: flex;
          justify-content: center;
          padding: 4rem 0;
        }
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid var(--primary);
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default AdminDashboard;
