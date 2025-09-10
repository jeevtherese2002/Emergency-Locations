import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // 'Bearer token'

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { _id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const checkRole = (allowedRole) => {
  return (req, res, next) => {
    if (req.user.role !== allowedRole) {
      return res.status(403).json({ message: `Access denied for role: ${req.user.role}` });
    }
    next();
  };
};
