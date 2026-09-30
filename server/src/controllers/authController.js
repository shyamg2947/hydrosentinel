import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logAuditEvent } from '../services/auditService.js';

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'hydrosentinel_super_secure_jwt_secret_key_2026_capstone',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password').populate('assignedFacilities', 'name code');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact your system administrator.'
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    await logAuditEvent({
      actor: user,
      action: 'USER_LOGIN',
      targetEntity: 'Authentication',
      entityId: user._id,
      ipAddress: req.ip || req.connection.remoteAddress
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      token,
      user: userObj
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('assignedFacilities', 'name code location status');
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, department, notificationPreferences } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (phone !== undefined) fieldsToUpdate.phone = phone;
    if (department) fieldsToUpdate.department = department;
    if (notificationPreferences) fieldsToUpdate.notificationPreferences = notificationPreferences;

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    }).populate('assignedFacilities', 'name code');

    await logAuditEvent({
      actor: req.user,
      action: 'USER_PROFILE_UPDATED',
      targetEntity: 'User',
      entityId: user._id
    });

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Current password does not match'
      });
    }

    user.password = newPassword;
    await user.save();

    await logAuditEvent({
      actor: req.user,
      action: 'USER_PASSWORD_CHANGED',
      targetEntity: 'User',
      entityId: user._id
    });

    res.status(200).json({
      success: true,
      message: 'Password successfully updated'
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
};
