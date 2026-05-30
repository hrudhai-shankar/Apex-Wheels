const jwt = require('jsonwebtoken');
const supabase = require('../supabase');

const verifyToken = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    
    if (!token || !token.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    token = token.split(' ')[1];

    // Handle mock admin token bypass
    if (token === 'mock_admin_token_bypass') {
      req.user = {
        id: 'admin_bypass_id',
        name: 'System Admin',
        email: 'admin@apexwheels.com',
        role: 'admin',
        plan: 'pro'
      };
      return next();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    
    // Query users table from Supabase with fallback to JWT info if DB fails
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email, role, plan, created_at')
        .eq('id', decoded.id)
        .single();

      if (error || !user) {
        req.user = {
          id: decoded.id,
          role: decoded.role || 'user',
          plan: decoded.plan || 'free',
          name: decoded.name || 'User ' + decoded.id,
          email: decoded.email || 'user@example.com'
        };
      } else {
        req.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          plan: user.plan || 'free',
          createdAt: user.created_at
        };
      }
    } catch (dbErr) {
      console.warn('Database query in verifyToken failed, using JWT payload:', dbErr.message);
      req.user = {
        id: decoded.id,
        role: decoded.role || 'user',
        plan: decoded.plan || 'free',
        name: 'User ' + decoded.id,
        email: 'user@example.com'
      };
    }
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

module.exports = {
  verifyToken,
  verifyAdmin,
};
