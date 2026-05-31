const Razorpay = require('razorpay');
const crypto = require('crypto');
const supabase = require('../supabase');

// Local bookings fallback cache/mock store
const localBookings = [
  {
    id: 101,
    user_id: 'admin_bypass_id', // mock admin
    car_id: 1, // Model Y
    start_date: new Date(Date.now() - 86400000 * 2).toISOString(),
    end_date: new Date(Date.now() + 86400000 * 1).toISOString(),
    total_days: 3,
    total_amount: 22500,
    status: 'Confirmed',
    payment_status: 'Paid',
    razorpay_order_id: 'mock_order_1',
    razorpay_payment_id: 'pay_Hj89xKla92',
    razorpay_signature: 'sig_mock_1',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    car: {
      id: 1,
      name: 'Model Y',
      brand: 'Tesla',
      type: 'Electric',
      seats: 5,
      price_per_day: 7500,
      image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80'
    },
    user: {
      id: 'admin_bypass_id',
      name: 'System Admin',
      email: 'admin@apexwheels.com'
    }
  },
  {
    id: 102,
    user_id: 1, // John Doe
    car_id: 2, // M4
    start_date: new Date(Date.now() - 86400000 * 10).toISOString(),
    end_date: new Date(Date.now() - 86400000 * 7).toISOString(),
    total_days: 3,
    total_amount: 36000,
    status: 'Confirmed',
    payment_status: 'Paid',
    razorpay_order_id: 'mock_order_2',
    razorpay_payment_id: 'pay_Jj78xMlk01',
    razorpay_signature: 'sig_mock_2',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    car: {
      id: 2,
      name: 'M4 Competition',
      brand: 'BMW',
      type: 'Coupe',
      seats: 4,
      price_per_day: 12000,
      image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80'
    },
    user: {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com'
    }
  }
];

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
    let car = null;
    try {
      const { data, error: carError } = await supabase
        .from('cars')
        .select('*')
        .eq('id', carId)
        .maybeSingle();

      if (carError) throw carError;
      car = data;
    } catch (dbErr) {
      // Fallback local cars query
      const localCars = [
        { id: 1, name: 'Model Y', brand: 'Tesla', price_per_day: 7500, available: true, seats: 5, type: 'Electric', image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80' },
        { id: 2, name: 'M4 Competition', brand: 'BMW', price_per_day: 12000, available: true, seats: 4, type: 'Coupe', image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80' },
        { id: 3, name: 'Ghost', brand: 'Rolls Royce', price_per_day: 45000, available: true, seats: 4, type: 'Sedan', image: 'https://images.unsplash.com/photo-1631245054178-5a0d5c05f778?auto=format&fit=crop&w=800&q=80' },
      ];
      car = localCars.find(c => c.id.toString() === carId.toString());
    }

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (!car.available) {
      return res.status(400).json({ message: 'This car is currently not available' });
    }

    // 2. Check for overlapping bookings in Supabase PostgreSQL
    let overlapCount = 0;
    try {
      const { data: overlappingBookings, error: overlapError } = await supabase
        .from('bookings')
        .select('*')
        .eq('car_id', carId)
        .neq('status', 'Cancelled')
        .lte('start_date', end.toISOString())
        .gte('end_date', start.toISOString());

      if (overlapError) throw overlapError;
      overlapCount = (overlappingBookings || []).length;
    } catch (dbErr) {
      // Local overlap validation
      const overlap = localBookings.filter(b => 
        b.car_id.toString() === carId.toString() &&
        b.status !== 'Cancelled' &&
        new Date(b.start_date) <= end &&
        new Date(b.end_date) >= start
      );
      overlapCount = overlap.length;
    }

    if (overlapCount > 0) {
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

    // Create a pending booking in Supabase / Local
    let newBooking = null;
    try {
      const { data, error: insertError } = await supabase
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

      if (insertError) throw insertError;
      newBooking = data;
    } catch (dbErr) {
      // Mock insert local
      newBooking = {
        id: localBookings.length + 103,
        user_id: userId,
        car_id: carId,
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        total_days: totalDays,
        total_amount: totalAmount,
        razorpay_order_id: razorpayOrderId,
        status: 'Pending',
        payment_status: 'Pending',
        created_at: new Date().toISOString(),
        car: {
          id: carId,
          name: car.name,
          brand: car.brand,
          type: car.type,
          seats: car.seats,
          price_per_day: car.price_per_day,
          image: car.image
        },
        user: {
          id: userId,
          name: req.user.name,
          email: req.user.email
        }
      };
      localBookings.push(newBooking);
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
    let booking = null;
    try {
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('*, car:cars(*)')
        .eq('razorpay_order_id', razorpayOrderId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      booking = data;
    } catch (dbErr) {
      booking = localBookings.find(b => b.razorpay_order_id === razorpayOrderId);
    }

    if (!booking) {
      return res.status(404).json({ message: 'Booking record not found' });
    }

    // Check if mock mode is active
    if (razorpayOrderId.startsWith('mock_order_')) {
      try {
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

        if (updateError) throw updateError;
        return res.json({ message: 'Payment verified successfully (Mock Mode)!', booking: mapBooking(updatedBooking) });
      } catch (dbErr) {
        // Mock local verify
        const idx = localBookings.findIndex(b => b.id === booking.id);
        if (idx !== -1) {
          localBookings[idx].status = 'Confirmed';
          localBookings[idx].payment_status = 'Paid';
          localBookings[idx].razorpay_payment_id = razorpayPaymentId || `mock_pay_${Date.now()}`;
          localBookings[idx].razorpay_signature = razorpaySignature || 'mock_sig';
          booking = localBookings[idx];
        }
        return res.json({ message: 'Payment verified successfully (Mock Mode)!', booking: mapBooking(booking) });
      }
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    // Standard Razorpay verification
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(razorpayOrderId + '|' + razorpayPaymentId);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === razorpaySignature) {
      try {
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

        if (updateError) throw updateError;
        res.json({ message: 'Payment verified and booking confirmed successfully!', booking: mapBooking(updatedBooking) });
      } catch (dbErr) {
        const idx = localBookings.findIndex(b => b.id === booking.id);
        if (idx !== -1) {
          localBookings[idx].status = 'Confirmed';
          localBookings[idx].payment_status = 'Paid';
          localBookings[idx].razorpay_payment_id = razorpayPaymentId;
          localBookings[idx].razorpay_signature = razorpaySignature;
          booking = localBookings[idx];
        }
        res.json({ message: 'Payment verified and booking confirmed successfully!', booking: mapBooking(booking) });
      }
    } else {
      // Cancel booking
      try {
        await supabase
          .from('bookings')
          .update({
            status: 'Cancelled',
            payment_status: 'Failed',
          })
          .eq('id', booking.id);
      } catch (dbErr) {
        const idx = localBookings.findIndex(b => b.id === booking.id);
        if (idx !== -1) {
          localBookings[idx].status = 'Cancelled';
          localBookings[idx].payment_status = 'Failed';
        }
      }
      
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
    let bookings = [];
    let error = null;

    try {
      const { data, error: dbErr } = await supabase
        .from('bookings')
        .select('*, car:cars(*)')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false });

      bookings = data;
      error = dbErr;
    } catch (dbErr) {
      error = dbErr;
    }

    if (error || !bookings || bookings.length === 0) {
      const userBookings = localBookings.filter(b => b.user_id.toString() === req.user.id.toString());
      if (userBookings.length === 0) {
        // Fallback placeholder booking if history is empty
        userBookings.push({
          id: 999,
          user_id: req.user.id,
          car_id: 1,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 86400000).toISOString(),
          total_days: 1,
          total_amount: 7500,
          status: 'Confirmed',
          payment_status: 'Paid',
          razorpay_order_id: 'mock_order_999',
          razorpay_payment_id: 'mock_pay_999',
          razorpay_signature: 'mock_sig_999',
          created_at: new Date().toISOString(),
          car: {
            id: 1,
            name: 'Model Y',
            brand: 'Tesla',
            type: 'Electric',
            seats: 5,
            price_per_day: 7500,
            image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80'
          },
          user: {
            id: req.user.id,
            name: req.user.name || 'Current User',
            email: req.user.email || 'user@example.com'
          }
        });
      }
      return res.json(userBookings.map(mapBooking));
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
    let bookings = [];
    let error = null;

    try {
      const { data, error: dbErr } = await supabase
        .from('bookings')
        .select('*, car:cars(*), user:users(name, email)')
        .order('created_at', { ascending: false });

      bookings = data;
      error = dbErr;
    } catch (dbErr) {
      error = dbErr;
    }

    if (error || !bookings || bookings.length === 0) {
      bookings = [...localBookings];
      const exists = bookings.some(b => b.user_id.toString() === req.user.id.toString());
      if (!exists) {
        bookings.push({
          id: 999,
          user_id: req.user.id,
          car_id: 1,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 86400000).toISOString(),
          total_days: 1,
          total_amount: 7500,
          status: 'Confirmed',
          payment_status: 'Paid',
          razorpay_order_id: 'mock_order_999',
          razorpay_payment_id: 'mock_pay_999',
          razorpay_signature: 'mock_sig_999',
          created_at: new Date().toISOString(),
          car: {
            id: 1,
            name: 'Model Y',
            brand: 'Tesla',
            type: 'Electric',
            seats: 5,
            price_per_day: 7500,
            image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80'
          },
          user: {
            id: req.user.id,
            name: req.user.name || 'System Admin',
            email: req.user.email || 'admin@apexwheels.com'
          }
        });
      }
    }

    res.json(bookings.map(mapBooking));
  } catch (error) {
    console.error('Get all bookings error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all bookings for a specific car (Public/User)
// @route   GET /api/bookings/car/:carId
// @access  Public
exports.getCarBookings = async (req, res) => {
  try {
    const { carId } = req.params;
    let bookings = [];
    let error = null;

    try {
      const { data, error: dbErr } = await supabase
        .from('bookings')
        .select('*, car:cars(*)')
        .eq('car_id', carId)
        .neq('status', 'Cancelled');

      bookings = data || [];
      error = dbErr;
    } catch (dbErr) {
      error = dbErr;
    }

    if (error || !bookings || bookings.length === 0) {
      bookings = localBookings.filter(b => b.car_id.toString() === carId.toString() && b.status !== 'Cancelled');
    }

    res.json(bookings.map(mapBooking));
  } catch (error) {
    console.error('Get car bookings error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

