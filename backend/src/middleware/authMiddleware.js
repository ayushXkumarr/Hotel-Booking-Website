import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Authentication Middleware: verifyToken
 * Validates the JWT Bearer token passed in the Authorization HTTP header.
 * Attaches the authenticated user document to req.user for downstream controllers.
 */
export const verifyToken = async (req, res, next) => {
  let token;

  // Check for Authorization header formatted as: 'Bearer <token>'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract the raw token string
      token = req.headers.authorization.split(' ')[1];

      // Cryptographically verify token using JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from database by decoded ID (omit password field)
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User belonging to this token no longer exists.',
        });
      }

      // Attach user document to request object
      req.user = user;
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Your session has expired. Please log in again.',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid or malformed authentication token.',
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
  }
};

/**
 * Role-Based Access Control Middleware: authorizeRole
 * Restricts access to endpoints based on user roles (e.g., 'admin').
 *
 * @param  {...string} roles - List of allowed roles (e.g., 'admin', 'customer')
 */
export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required prior to role verification.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${roles.join(', ')}] role(s). Your role: ${req.user.role}`,
      });
    }

    next();
  };
};

export default { verifyToken, authorizeRole };
