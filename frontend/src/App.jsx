import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import CarsListing from './pages/CarsListing';
import CarDetails from './pages/CarDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import GoPro from './pages/GoPro';

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          
          <main style={{ flexGrow: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/cars" element={<CarsListing />} />
              <Route path="/cars/:id" element={<CarDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected User Routes */}
              <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-bookings" 
                element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/go-pro" 
                element={
                  <ProtectedRoute>
                    <GoPro />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </WishlistProvider>
  </AuthProvider>
  );
}

export default App;
