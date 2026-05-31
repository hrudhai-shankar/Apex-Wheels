const express = require('express');
const router = express.Router();
const { createBookingOrder, verifyPayment, getMyBookings, getAllBookings, getCarBookings } = require('../controllers/booking.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

router.post('/order', verifyToken, createBookingOrder);
router.post('/verify', verifyToken, verifyPayment);
router.get('/my-bookings', verifyToken, getMyBookings);
router.get('/car/:carId', getCarBookings);

// Admin-only route
router.get('/', verifyToken, verifyAdmin, getAllBookings);

module.exports = router;
