const jwt = require('jsonwebtoken');
const supabase = require('../supabase');

const verifyToken = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    
    if (!token || !token.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    token = token.split(' ')[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    
    // Query users table from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Attach user (with fields id, name, email, role) to request
    req.user = user;
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
