import AuditLog from '../models/AuditLog.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const { action, targetEntity, facility, startDate, endDate, search, page = 1, limit = 25 } = req.query;
    const query = {};

    if (req.user.role !== 'Super Admin' && !facility) {
      query.facility = { $in: req.user.assignedFacilities };
    } else if (facility) {
      query.facility = facility;
    }

    if (action) query.action = action;
    if (targetEntity) query.targetEntity = targetEntity;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { actorName: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { entityId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('facility', 'name code')
      .populate('actor', 'name email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: logs
    });
  } catch (error) {
    next(error);
  }
};
