import Sensor from '../models/Sensor.js';
import Telemetry from '../models/Telemetry.js';
import Alert from '../models/Alert.js';
import WorkOrder from '../models/WorkOrder.js';
import { logAuditEvent } from '../services/auditService.js';

export const getSensors = async (req, res, next) => {
  try {
    const { facility, storageUnit, type, status, connectionStatus, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (req.user.role !== 'Super Admin' && !facility) {
      query.facility = { $in: req.user.assignedFacilities };
    } else if (facility) {
      query.facility = facility;
    }

    if (storageUnit) query.storageUnit = storageUnit;
    if (type) query.type = type;
    if (status) query.status = status;
    if (connectionStatus) query.connectionStatus = connectionStatus;

    if (search) {
      query.$or = [
        { sensorId: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
        { locationDescription: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Sensor.countDocuments(query);
    const sensors = await Sensor.find(query)
      .populate('facility', 'name code')
      .populate('storageUnit', 'name unitId')
      .sort({ sensorId: 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Check for calibration overdue dynamically
    const now = new Date();
    const enriched = sensors.map(s => {
      const isCalOverdue = s.nextCalibrationDue && new Date(s.nextCalibrationDue) < now;
      let effectiveStatus = s.status;
      if (s.connectionStatus === 'Offline') {
        effectiveStatus = 'Offline';
      } else if (isCalOverdue && s.status === 'Active') {
        effectiveStatus = 'Calibration Overdue';
      }
      return {
        ...s,
        isCalibrationOverdue: isCalOverdue,
        effectiveStatus
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

export const getSensorById = async (req, res, next) => {
  try {
    const sensor = await Sensor.findById(req.params.id)
      .populate('facility', 'name code thresholds location')
      .populate('storageUnit', 'name unitId maxWorkingPressureBar');

    if (!sensor) {
      return res.status(404).json({ success: false, message: 'Sensor not found' });
    }

    // Fetch recent 50 telemetry points for time-series chart
    const recentTelemetry = await Telemetry.find({ sensor: sensor._id })
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    // Fetch related alerts and work orders
    const [relatedAlerts, relatedWorkOrders] = await Promise.all([
      Alert.find({ sensor: sensor._id }).sort({ createdAt: -1 }).limit(10),
      WorkOrder.find({ sensor: sensor._id }).populate('assignedTo', 'name').sort({ dueDate: 1 }).limit(10)
    ]);

    // Check data freshness: if last reading is older than 30s while connection says Online, flag as stale
    const now = Date.now();
    const lastTime = sensor.lastReading?.timestamp ? new Date(sensor.lastReading.timestamp).getTime() : 0;
    const isStale = sensor.connectionStatus === 'Online' && (now - lastTime > 30000);

    res.status(200).json({
      success: true,
      data: {
        sensor,
        isStale,
        recentTelemetry: recentTelemetry.reverse(),
        relatedAlerts,
        relatedWorkOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createSensor = async (req, res, next) => {
  try {
    const sensor = await Sensor.create(req.body);

    await logAuditEvent({
      actor: req.user,
      action: 'SENSOR_CREATED',
      targetEntity: 'Sensor',
      entityId: sensor._id,
      facility: sensor.facility,
      details: { sensorId: sensor.sensorId, type: sensor.type }
    });

    res.status(201).json({ success: true, data: sensor });
  } catch (error) {
    next(error);
  }
};

export const updateSensor = async (req, res, next) => {
  try {
    const sensor = await Sensor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!sensor) {
      return res.status(404).json({ success: false, message: 'Sensor not found' });
    }

    await logAuditEvent({
      actor: req.user,
      action: 'SENSOR_UPDATED',
      targetEntity: 'Sensor',
      entityId: sensor._id,
      facility: sensor.facility,
      details: req.body
    });

    res.status(200).json({ success: true, data: sensor });
  } catch (error) {
    next(error);
  }
};

export const recordCalibration = async (req, res, next) => {
  try {
    const { calibrationNotes, technicianCertificate } = req.body;
    const sensor = await Sensor.findById(req.params.id);

    if (!sensor) {
      return res.status(404).json({ success: false, message: 'Sensor not found' });
    }

    const now = new Date();
    const intervalDays = sensor.calibrationIntervalDays || 180;
    const nextDue = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

    sensor.lastCalibrationDate = now;
    sensor.nextCalibrationDue = nextDue;
    sensor.status = 'Active';
    await sensor.save();

    await logAuditEvent({
      actor: req.user,
      action: 'SENSOR_CALIBRATED',
      targetEntity: 'Sensor',
      entityId: sensor._id,
      facility: sensor.facility,
      details: {
        calibratedAt: now,
        nextDue,
        technicianCertificate,
        notes: calibrationNotes
      }
    });

    res.status(200).json({
      success: true,
      message: 'Sensor calibration recorded successfully',
      data: sensor
    });
  } catch (error) {
    next(error);
  }
};

export const decommissionSensor = async (req, res, next) => {
  try {
    const sensor = await Sensor.findById(req.params.id);
    if (!sensor) {
      return res.status(404).json({ success: false, message: 'Sensor not found' });
    }

    sensor.status = 'Decommissioned';
    sensor.connectionStatus = 'Offline';
    await sensor.save();

    await logAuditEvent({
      actor: req.user,
      action: 'SENSOR_DECOMMISSIONED',
      targetEntity: 'Sensor',
      entityId: sensor._id,
      facility: sensor.facility
    });

    res.status(200).json({ success: true, message: 'Sensor marked as decommissioned' });
  } catch (error) {
    next(error);
  }
};
