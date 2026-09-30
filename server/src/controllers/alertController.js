import Alert from '../models/Alert.js';
import { ALERT_STATUSES, ALERT_SEVERITIES } from '../config/constants.js';
import { logAuditEvent } from '../services/auditService.js';
import { createNotificationForRoles } from '../services/notificationService.js';

export const getAlerts = async (req, res, next) => {
  try {
    const { facility, severity, status, category, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (req.user.role !== 'Super Admin' && !facility) {
      query.facility = { $in: req.user.assignedFacilities };
    } else if (facility) {
      query.facility = facility;
    }

    if (severity) query.severity = severity;
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Alert.countDocuments(query);
    const alerts = await Alert.find(query)
      .populate('facility', 'name code location')
      .populate('storageUnit', 'name unitId')
      .populate('sensor', 'name sensorId type')
      .populate('acknowledgedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: alerts.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

export const getAlertById = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('facility', 'name code location thresholds')
      .populate('storageUnit', 'name unitId volumeM3 maxWorkingPressureBar')
      .populate('sensor', 'name sensorId type unit locationDescription lastCalibrationDate')
      .populate('acknowledgedBy', 'name role email')
      .populate('assignedTo', 'name role email')
      .populate('resolvedBy', 'name role email')
      .populate('auditTrail.actor', 'name role');

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    res.status(200).json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

export const acknowledgeAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    alert.status = ALERT_STATUSES.ACKNOWLEDGED;
    alert.acknowledgedBy = req.user._id;
    alert.acknowledgedAt = new Date();
    alert.auditTrail.push({
      actor: req.user._id,
      action: 'Alert Acknowledged',
      timestamp: new Date(),
      notes: `Alert acknowledged by ${req.user.name} (${req.user.role}).`
    });

    await alert.save();

    await logAuditEvent({
      actor: req.user,
      action: 'ALERT_ACKNOWLEDGED',
      targetEntity: 'Alert',
      entityId: alert._id,
      facility: alert.facility
    });

    res.status(200).json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

export const assignAlert = async (req, res, next) => {
  try {
    const { assignedTo, notes } = req.body;
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    alert.status = ALERT_STATUSES.ASSIGNED;
    alert.assignedTo = assignedTo;
    alert.assignedAt = new Date();
    alert.auditTrail.push({
      actor: req.user._id,
      action: 'Alert Assigned',
      timestamp: new Date(),
      notes: notes || `Assigned to user ID ${assignedTo}`
    });

    await alert.save();

    await logAuditEvent({
      actor: req.user,
      action: 'ALERT_ASSIGNED',
      targetEntity: 'Alert',
      entityId: alert._id,
      facility: alert.facility,
      details: { assignedTo }
    });

    res.status(200).json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

export const updateAlertStatus = async (req, res, next) => {
  try {
    const { status, resolutionNotes, rootCauseAnalysis } = req.body;
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    alert.status = status;
    if (status === ALERT_STATUSES.RESOLVED || status === ALERT_STATUSES.CLOSED) {
      alert.resolvedBy = req.user._id;
      alert.resolvedAt = new Date();
      if (resolutionNotes) alert.resolutionNotes = resolutionNotes;
      if (rootCauseAnalysis) alert.rootCauseAnalysis = rootCauseAnalysis;
    }

    alert.auditTrail.push({
      actor: req.user._id,
      action: `Status Changed to ${status}`,
      timestamp: new Date(),
      notes: resolutionNotes || `Status updated to ${status}`
    });

    await alert.save();

    await logAuditEvent({
      actor: req.user,
      action: `ALERT_STATUS_${status.toUpperCase()}`,
      targetEntity: 'Alert',
      entityId: alert._id,
      facility: alert.facility,
      details: { status, resolutionNotes }
    });

    res.status(200).json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

export const getAlertSummaryStats = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role !== 'Super Admin') {
      query.facility = { $in: req.user.assignedFacilities };
    }

    const [total, unackCritical, bySeverity, byCategory, byStatus] = await Promise.all([
      Alert.countDocuments(query),
      Alert.countDocuments({ ...query, severity: ALERT_SEVERITIES.CRITICAL, status: ALERT_STATUSES.NEW }),
      Alert.aggregate([
        { $match: query },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),
      Alert.aggregate([
        { $match: query },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Alert.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        unackCritical,
        bySeverity: Object.fromEntries(bySeverity.map(s => [s._id, s.count])),
        byCategory: Object.fromEntries(byCategory.map(c => [c._id, c.count])),
        byStatus: Object.fromEntries(byStatus.map(st => [st._id, st.count]))
      }
    });
  } catch (error) {
    next(error);
  }
};
