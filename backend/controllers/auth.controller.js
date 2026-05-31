const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../supabase');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { getUserPlan, setUserPlan } = require('../utils/userPlanRegistry');

const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!keyId || !keySecret || keyId.includes('your_razorpay') || keySecret.includes('your_razorpay')) {
    return null;
  }
  
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

// Helper function to generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, adminSecret } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user already exists in Supabase
    const { data: existingUsers, error: existError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase());

    if (existError) {
      throw existError;
    }

    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Determine role based on admin secret
    let role = 'user';
    if (adminSecret && adminSecret === process.env.ADMIN_SECRET) {
      role = 'admin';
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into Supabase
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          role,
        }
      ])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    if (newUser) {
      res.status(201).json({
        _id: newUser.id, // Keep _id mapping for easy frontend compatibility!
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        plan: getUserPlan(newUser.id),
        token: generateToken(newUser.id, newUser.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user in Supabase
    const { data: users, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase());

    if (findError) {
      throw findError;
    }

    if (!users || users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // Check password match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user.id, // Keep _id mapping for easy frontend compatibility!
      name: user.name,
      email: user.email,
      role: user.role,
      plan: getUserPlan(user.id),
      token: generateToken(user.id, user.role),
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    // req.user is already populated by verifyToken middleware
    if (req.user) {
      res.json({
        _id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        plan: getUserPlan(req.user.id),
        created_at: req.user.created_at
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a razorpay order for Go Pro subscription
// @route   POST /api/auth/upgrade-order
// @access  Private
exports.createUpgradeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const amount = 5000; // ₹5000 for Go Pro

    let razorpayOrderId = `mock_upgrade_${Date.now()}`;
    const razorpay = getRazorpayInstance();

    if (razorpay) {
      try {
        const options = {
          amount: amount * 100, // in paisa
          currency: 'INR',
          receipt: `receipt_upgrade_${Date.now().toString().slice(-6)}`,
        };
        const order = await razorpay.orders.create(options);
        razorpayOrderId = order.id;
      } catch (err) {
        console.error('Razorpay Upgrade Order Error:', err.message);
        return res.status(500).json({ message: 'Failed to initiate payment gateway', error: err.message });
      }
    }

    res.status(201).json({
      razorpayOrderId,
      amount: amount * 100, // in paisa
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
    });
  } catch (error) {
    console.error('Create upgrade order error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify payment and upgrade user plan
// @route   POST /api/auth/upgrade-verify
// @access  Private
exports.verifyUpgrade = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const userId = req.user.id;

    // Verify mock mode
    if (razorpayOrderId.startsWith('mock_upgrade_')) {
      try {
        await supabase
          .from('users')
          .update({ plan: 'pro' })
          .eq('id', userId);
      } catch (dbErr) {
        console.warn('Could not update plan to database users table, updating registry fallback:', dbErr.message);
      }
      
      setUserPlan(userId, 'pro');
      
      return res.json({ 
        message: 'Upgraded to Pro successfully (Mock Mode)!',
        plan: 'pro'
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(razorpayOrderId + '|' + razorpayPaymentId);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === razorpaySignature) {
      try {
        await supabase
          .from('users')
          .update({ plan: 'pro' })
          .eq('id', userId);
      } catch (dbErr) {
        console.warn('Could not update plan to database users table, updating registry fallback:', dbErr.message);
      }
      
      setUserPlan(userId, 'pro');
      
      res.json({ 
        message: 'Payment verified and upgraded to Pro successfully!',
        plan: 'pro'
      });
    } else {
      res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }
  } catch (error) {
    console.error('Verify upgrade error:', error);
    res.status(500).json({ message: `Verify upgrade error: ${error.message}`, error: error.stack });
  }
};
