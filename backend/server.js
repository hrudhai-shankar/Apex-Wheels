require('dotenv').config();
const express = require('express');
const cors = require('cors');
const supabase = require('./supabase');

// Import routes
const authRoutes = require('./routes/auth.routes');
const carRoutes = require('./routes/car.routes');
const bookingRoutes = require('./routes/booking.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // For development, allow all. In production, restrict to frontend domain.
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Basic welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Apex Wheels API!' });
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    message: 'An internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start Express Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Apex Wheels API running on port ${PORT}`);
  console.log(`📦 Database: Supabase PostgreSQL connected`);
  console.log(`=========================================`);
});
