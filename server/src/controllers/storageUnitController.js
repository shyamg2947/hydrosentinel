import StorageUnit from '../models/StorageUnit.js';
import Sensor from '../models/Sensor.js';
import Alert from '../models/Alert.js';
import WorkOrder from '../models/WorkOrder.js';
import { logAuditEvent } from '../services/auditService.js';

export const getStorageUnits = async (req, res, next) => {
  try {
    const { facilityId } = req.params;
    const query = facilityId ? { facility: facilityId } : {};

    const units = await StorageUnit.find(query).populate('facility', 'name code').sort({ unitId: 1 });
    res.status(200).json({ success: true, count: units.length, data: units });
  } catch (error) {
    next(error);
  }
};

export const getStorageUnitById = async (req, res, next) => {
  try {
    const unit = await StorageUnit.findById(req.params.id).populate('facility', 'name code thresholds location');
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Storage unit not found' });
    }

    const [sensors, activeAlerts, workOrders] = await Promise.all([
      Sensor.find({ storageUnit: unit._id }).sort({ sensorId: 1 }),
      Alert.find({
        storageUnit: unit._id,
        status: { $in: ['New', 'Acknowledged', 'Assigned', 'Investigating'] }
      }).sort({ createdAt: -1 }),
      WorkOrder.find({ storageUnit: unit._id }).populate('assignedTo', 'name').sort({ dueDate: 1 }).limit(10)
    ]);

    res.status(200).json({
      success: true,
      data: {
        unit,
        sensors,
        activeAlerts,
        workOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createStorageUnit = async (req, res, next) => {
  try {
    const unit = await StorageUnit.create(req.body);

    await logAuditEvent({
      actor: req.user,
      action: 'STORAGE_UNIT_CREATED',
      targetEntity: 'StorageUnit',
      entityId: unit._id,
      facility: unit.facility,
      details: { unitId: unit.unitId, name: unit.name }
    });

    res.status(201).json({ success: true, data: unit });
  } catch (error) {
    next(error);
  }
};

export const updateStorageUnit = async (req, res, next) => {
  try {
    const unit = await StorageUnit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!unit) {
      return res.status(404).json({ success: false, message: 'Storage unit not found' });
    }

    await logAuditEvent({
      actor: req.user,
      action: 'STORAGE_UNIT_UPDATED',
      targetEntity: 'StorageUnit',
      entityId: unit._id,
      facility: unit.facility,
      details: req.body
    });

    res.status(200).json({ success: true, data: unit });
  } catch (error) {
    next(error);
  }
};
