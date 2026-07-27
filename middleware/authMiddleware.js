const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // Format should be: Bearer <token>
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : authHeader;

  if (!token) {
    return res.status(401).json({ message: 'Access denied. Token missing.' });
  }

  try {
    const tokenSecret = process.env.JWT_SECRET || 'super_secret_jwt_key_12345';
    const decoded = jwt.verify(token, tokenSecret);
    req.user = decoded; // Contains id, role, department_id
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(401).json({ message: 'Access denied. Invalid or expired token.' });
  }
};

module.exports = verifyToken;
