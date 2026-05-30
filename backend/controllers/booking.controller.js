const Razorpay = require('razorpay');
const crypto = require('crypto');
const supabase = require('../supabase');

// Helper to map DB snake_case columns to frontend camelCase
const mapBooking = (b) => {
  if (!b) return null;
  return {
    _id: b.id,
    startDate: b.start_date,
    endDate: b.end_date,
    totalDays: b.total_days,
    totalAmount: Number(b.total_amount),
    status: b.status,
    paymentStatus: b.payment_status,
    razorpayOrderId: b.razorpay_order_id,
    razorpayPaymentId: b.razorpay_payment_id,
    razorpaySignature: b.razorpay_signature,
    createdAt: b.created_at,
    car: b.car ? {
      _id: b.car.id,
      name: b.car.name,
      brand: b.car.brand,
      type: b.car.type,
      seats: b.car.seats,
      pricePerDay: Number(b.car.price_per_day),
      image: b.car.image,
    } : null,
    user: b.user ? {
      _id: b.user.id,
      name: b.user.name,
      email: b.user.email,
    } : null,
  };
};

const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!keyId || !keySecret || keyId.includes('your_razorpay') || keySecret.includes('your_razorpay')) {
    console.warn('WARNING: Razorpay API keys are missing. Sandbox mock active.');
    return null;
  }
  
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

// @desc    Create a new booking and generate Razorpay Order
// @route   POST /api/bookings/order
// @access  Private
exports.createBookingOrder = async (req, res) => {
  try {
    const { carId, startDate, endDate } = req.body;
    const userId = req.user.id;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid start or end date' });
    }

    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // 1. Check if car exists and is available
    const { data: car, error: carError } = await supabase
      .from('cars')
      .select('*')
      .eq('id', carId)
      .maybeSingle();

    if (carError || !car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (!car.available) {
      return res.status(400).json({ message: 'This car is currently not available' });
    }

    // 2. Check for overlapping bookings in Supabase PostgreSQL
    // Condition: start_date <= end AND end_date >= start
    const { data: overlappingBookings, error: overlapError } = await supabase
      .from('bookings')
      .select('*')
      .eq('car_id', carId)
      .eq('status', 'Confirmed')
      .lte('start_date', end.toISOString())
      .gte('end_date', start.toISOString());

    if (overlapError) {
      throw overlapError;
    }

    if (overlappingBookings && overlappingBookings.length > 0) {
      return res.status(400).json({ message: 'Car is already booked for these dates' });
    }

    // Calculate duration & price
    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const totalAmount = totalDays * Number(car.price_per_day);

    let razorpayOrderId = `mock_order_${Date.now()}`;
    const razorpay = getRazorpayInstance();

    if (razorpay) {
      try {
        const options = {
          amount: totalAmount * 100, // in paisa
          currency: 'INR',
          receipt: `receipt_booking_${Date.now().toString().slice(-6)}`,
        };
        const order = await razorpay.orders.create(options);
        razorpayOrderId = order.id;
      } catch (err) {
        console.error('Razorpay Order Creation Error:', err.message);
        return res.status(500).json({ message: 'Failed to initiate payment gateway', error: err.message });
      }
    }

    // Create a pending booking in Supabase
    const { data: newBooking, error: insertError } = await supabase
      .from('bookings')
      .insert([
        {
          user_id: userId,
          car_id: carId,
          start_date: start.toISOString(),
          end_date: end.toISOString(),
          total_days: totalDays,
          total_amount: totalAmount,
          razorpay_order_id: razorpayOrderId,
          status: 'Pending',
          payment_status: 'Pending',
        }
      ])
      .select('*, car:cars(*)')
      .single();

    if (insertError) {
      throw insertError;
    }

    res.status(201).json({
      booking: mapBooking(newBooking),
      razorpayOrderId,
      amount: totalAmount * 100, // in paisa
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
    });
  } catch (error) {
    console.error('Create booking order error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify payment and confirm booking
// @route   POST /api/bookings/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // Fetch booking
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*, car:cars(*)')
      .eq('razorpay_order_id', razorpayOrderId)
      .maybeSingle();

    if (fetchError || !booking) {
      return res.status(404).json({ message: 'Booking record not found' });
    }

    // Check if mock mode is active
    if (razorpayOrderId.startsWith('mock_order_')) {
      const { data: updatedBooking, error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'Confirmed',
          payment_status: 'Paid',
          razorpay_payment_id: razorpayPaymentId || `mock_pay_${Date.now()}`,
          razorpay_signature: razorpaySignature || 'mock_sig',
        })
        .eq('id', booking.id)
        .select('*, car:cars(*)')
        .single();

      if (updateError) {
        throw updateError;
      }

      return res.json({ message: 'Payment verified successfully (Mock Mode)!', booking: mapBooking(updatedBooking) });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    // Standard Razorpay verification
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(razorpayOrderId + '|' + razorpayPaymentId);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === razorpaySignature) {
      const { data: updatedBooking, error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'Confirmed',
          payment_status: 'Paid',
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature,
        })
        .eq('id', booking.id)
        .select('*, car:cars(*)')
        .single();

      if (updateError) {
        throw updateError;
      }
      
      res.json({ message: 'Payment verified and booking confirmed successfully!', booking: mapBooking(updatedBooking) });
    } else {
      // Cancel booking
      await supabase
        .from('bookings')
        .update({
          status: 'Cancelled',
          payment_status: 'Failed',
        })
        .eq('id', booking.id);
      
      res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }
  } catch (error) {
    console.error('Verify payment error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*, car:cars(*)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(bookings.map(mapBooking));
  } catch (error) {
    console.error('Get my bookings error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*, car:cars(*), user:users(name, email)')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(bookings.map(mapBooking));
  } catch (error) {
    console.error('Get all bookings error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
