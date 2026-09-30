import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ROLES } from '../config/constants.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token missing or invalid. Please log in.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hydrosentinel_super_secure_jwt_secret_key_2026_capstone');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Contact an administrator.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please log in again.'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!roles.includes(req.user.role) && req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource.`
      });
    }
    next();
  };
};

export const checkFacilityAccess = (facilityField = 'facility') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    const targetFacility = req.params[facilityField] || req.query[facilityField] || req.body[facilityField];

    if (!targetFacility) {
      return next();
    }

    const hasAccess = req.user.assignedFacilities.some(
      (fId) => fId.toString() === targetFacility.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not assigned to monitor this facility.'
      });
    }

    next();
  };
};
