import User from '../models/User.js';
import { logAuditEvent } from '../services/auditService.js';

export const getUsers = async (req, res, next) => {
  try {
    const { role, search, isActive, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate('assignedFacilities', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: users
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('assignedFacilities', 'name code location status');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, phone, assignedFacilities } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password: password || 'Hydrogen@2026',
      role,
      department,
      phone,
      assignedFacilities: assignedFacilities || []
    });

    await logAuditEvent({
      actor: req.user,
      action: 'USER_CREATED',
      targetEntity: 'User',
      entityId: user._id,
      details: { name, email, role, department }
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({ success: true, data: userObj });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { name, role, department, phone, assignedFacilities, isActive, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (department) user.department = department;
    if (phone !== undefined) user.phone = phone;
    if (assignedFacilities) user.assignedFacilities = assignedFacilities;
    if (isActive !== undefined) user.isActive = isActive;
    if (password) user.password = password;

    await user.save();

    await logAuditEvent({
      actor: req.user,
      action: 'USER_UPDATED',
      targetEntity: 'User',
      entityId: user._id,
      details: { role, isActive, assignedFacilitiesCount: assignedFacilities?.length }
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({ success: true, data: userObj });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Instead of hard delete, deactivate
    user.isActive = false;
    await user.save({ validateBeforeSave: false });

    await logAuditEvent({
      actor: req.user,
      action: 'USER_DEACTIVATED',
      targetEntity: 'User',
      entityId: user._id
    });

    res.status(200).json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    next(error);
  }
};
