import Facility from '../models/Facility.js';
import StorageUnit from '../models/StorageUnit.js';
import Sensor from '../models/Sensor.js';
import Alert from '../models/Alert.js';
import WorkOrder from '../models/WorkOrder.js';
import ComplianceRecord from '../models/ComplianceRecord.js';
import AuditLog from '../models/AuditLog.js';
import { logAuditEvent } from '../services/auditService.js';

export const getFacilities = async (req, res, next) => {
  try {
    const { search, status, sortBy = 'name', sortOrder = 'asc', page = 1, limit = 20 } = req.query;
    const query = {};

    // Filter by user facility assignments if not Super Admin
    if (req.user.role !== 'Super Admin') {
      query._id = { $in: req.user.assignedFacilities };
    }

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.state': { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Facility.countDocuments(query);
    const facilities = await Facility.find(query).sort(sort).skip(skip).limit(Number(limit)).lean();

    // Augment facilities with dynamic aggregated counts
    const facilityIds = facilities.map(f => f._id);

    const [storageCounts, sensorCounts, activeAlertCounts] = await Promise.all([
      StorageUnit.aggregate([
        { $match: { facility: { $in: facilityIds } } },
        { $group: { _id: '$facility', count: { $sum: 1 } } }
      ]),
      Sensor.aggregate([
        { $match: { facility: { $in: facilityIds } } },
        { $group: {
          _id: '$facility',
          total: { $sum: 1 },
          online: { $sum: { $cond: [{ $eq: ['$connectionStatus', 'Online'] }, 1, 0] } }
        }}
      ]),
      Alert.aggregate([
        { $match: { facility: { $in: facilityIds }, status: { $in: ['New', 'Acknowledged', 'Assigned', 'Investigating'] } } },
        { $group: {
          _id: '$facility',
          totalActive: { $sum: 1 },
          critical: { $sum: { $cond: [{ $eq: ['$severity', 'Critical'] }, 1, 0] } }
        }}
      ])
    ]);

    const storageMap = Object.fromEntries(storageCounts.map(s => [s._id.toString(), s.count]));
    const sensorMap = Object.fromEntries(sensorCounts.map(s => [s._id.toString(), s]));
    const alertMap = Object.fromEntries(activeAlertCounts.map(a => [a._id.toString(), a]));

    const enriched = facilities.map(f => {
      const fId = f._id.toString();
      const sStats = sensorMap[fId] || { total: 0, online: 0 };
      const aStats = alertMap[fId] || { totalActive: 0, critical: 0 };
      return {
        ...f,
        storageUnitCount: storageMap[fId] || 0,
        sensorCount: sStats.total,
        onlineSensorCount: sStats.online,
        activeAlertCount: aStats.totalActive,
        criticalAlertCount: aStats.critical
      };
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: enriched
    });
  } catch (error) {
    next(error);
  }
};

export const getFacilityById = async (req, res, next) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    const [storageUnits, sensors, activeAlerts, recentWorkOrders, recentCompliance, auditTrail] = await Promise.all([
      StorageUnit.find({ facility: facility._id }).sort({ unitId: 1 }),
      Sensor.find({ facility: facility._id }).populate('storageUnit', 'name unitId').sort({ sensorId: 1 }),
      Alert.find({
        facility: facility._id,
        status: { $in: ['New', 'Acknowledged', 'Assigned', 'Investigating'] }
      }).sort({ createdAt: -1 }).limit(10),
      WorkOrder.find({ facility: facility._id })
        .populate('assignedTo', 'name')
        .sort({ dueDate: 1 })
        .limit(5),
      ComplianceRecord.find({ facility: facility._id })
        .populate('checklist', 'title category')
        .populate('completedBy', 'name')
        .sort({ inspectionDate: -1 })
        .limit(5),
      AuditLog.find({ facility: facility._id }).sort({ timestamp: -1 }).limit(15)
    ]);

    res.status(200).json({
      success: true,
      data: {
        facility,
        storageUnits,
        sensors,
        activeAlerts,
        recentWorkOrders,
        recentCompliance,
        auditTrail
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createFacility = async (req, res, next) => {
  try {
    const facility = await Facility.create(req.body);

    await logAuditEvent({
      actor: req.user,
      action: 'FACILITY_CREATED',
      targetEntity: 'Facility',
      entityId: facility._id,
      facility: facility._id,
      details: { name: facility.name, code: facility.code }
    });

    res.status(201).json({ success: true, data: facility });
  } catch (error) {
    next(error);
  }
};

export const updateFacility = async (req, res, next) => {
  try {
    const facility = await Facility.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    await logAuditEvent({
      actor: req.user,
      action: 'FACILITY_UPDATED',
      targetEntity: 'Facility',
      entityId: facility._id,
      facility: facility._id,
      details: req.body
    });

    res.status(200).json({ success: true, data: facility });
  } catch (error) {
    next(error);
  }
};

export const deleteFacility = async (req, res, next) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    facility.status = 'Offline';
    await facility.save();

    await logAuditEvent({
      actor: req.user,
      action: 'FACILITY_SET_OFFLINE',
      targetEntity: 'Facility',
      entityId: facility._id,
      facility: facility._id
    });

    res.status(200).json({ success: true, message: 'Facility marked as offline' });
  } catch (error) {
    next(error);
  }
};
