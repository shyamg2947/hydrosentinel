import Alert from '../models/Alert.js';
import Facility from '../models/Facility.js';
import { ALERT_SEVERITIES, ALERT_STATUSES, ROLES } from '../config/constants.js';
import { createNotificationForRoles } from './notificationService.js';
import { logAuditEvent } from './auditService.js';

let ioInstance = null;

export const setAlertSocketIO = (io) => {
  ioInstance = io;
};

// Cooldown map: key = `${facilityId}:${sensorId}:${category}` -> Date
const cooldownMap = new Map();
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export const evaluateTelemetryAlert = async ({
  facility,
  storageUnit,
  sensor,
  sensorId,
  sensorType,
  value,
  unit,
  facilityThresholds
}) => {
  try {
    const thresholds = facilityThresholds || {
      pressureWarningBar: 450,
      pressureCriticalBar: 500,
      tempMinC: -40,
      tempMaxC: 65,
      leakWarningPpm: 400,
      leakCriticalPpm: 1000
    };

    let breached = false;
    let severity = ALERT_SEVERITIES.INFORMATIONAL;
    let category = '';
    let title = '';
    let description = '';
    let thresholdValue = 0;

    if (sensorType === 'Pressure') {
      if (value >= thresholds.pressureCriticalBar) {
        breached = true;
        severity = ALERT_SEVERITIES.CRITICAL;
        category = 'Pressure Exceeded';
        thresholdValue = thresholds.pressureCriticalBar;
        title = `CRITICAL: Overpressure Detected on Sensor ${sensorId}`;
        description = `Pressure reached ${value.toFixed(1)} ${unit}, surpassing safety limit of ${thresholdValue} ${unit}. Immediate isolation check advised.`;
      } else if (value >= thresholds.pressureWarningBar) {
        breached = true;
        severity = ALERT_SEVERITIES.WARNING;
        category = 'Pressure Exceeded';
        thresholdValue = thresholds.pressureWarningBar;
        title = `WARNING: High Pressure Alert on Sensor ${sensorId}`;
        description = `Pressure reached ${value.toFixed(1)} ${unit}, exceeding warning threshold ${thresholdValue} ${unit}.`;
      }
    } else if (sensorType === 'Hydrogen Leak') {
      if (value >= thresholds.leakCriticalPpm) {
        breached = true;
        severity = ALERT_SEVERITIES.CRITICAL;
        category = 'Leak Detected';
        thresholdValue = thresholds.leakCriticalPpm;
        title = `CRITICAL: Flammable H2 Concentration on Sensor ${sensorId}`;
        description = `Synthetic leak detector measured ${value.toFixed(0)} ppm (Threshold: ${thresholdValue} ppm). Verify area ventilation & consult facility emergency procedures.`;
      } else if (value >= thresholds.leakWarningPpm) {
        breached = true;
        severity = ALERT_SEVERITIES.WARNING;
        category = 'Leak Detected';
        thresholdValue = thresholds.leakWarningPpm;
        title = `WARNING: Minor Hydrogen Leak Detected on Sensor ${sensorId}`;
        description = `Leak detector registered elevated concentration of ${value.toFixed(0)} ppm (Threshold: ${thresholdValue} ppm).`;
      }
    } else if (sensorType === 'Temperature') {
      if (value >= thresholds.tempMaxC) {
        breached = true;
        severity = ALERT_SEVERITIES.WARNING;
        category = 'Temperature Exceeded';
        thresholdValue = thresholds.tempMaxC;
        title = `WARNING: Elevated Temperature on Sensor ${sensorId}`;
        description = `Temperature reached ${value.toFixed(1)} ${unit}, exceeding high limit of ${thresholdValue} ${unit}.`;
      } else if (value <= thresholds.tempMinC) {
        breached = true;
        severity = ALERT_SEVERITIES.WARNING;
        category = 'Temperature Exceeded';
        thresholdValue = thresholds.tempMinC;
        title = `WARNING: Low Temperature Boundary on Sensor ${sensorId}`;
        description = `Temperature dropped to ${value.toFixed(1)} ${unit}, below low limit of ${thresholdValue} ${unit}.`;
      }
    }

    if (!breached) return null;

    // Check cooldown to avoid spamming alerts every simulation tick
    const cooldownKey = `${facility._id || facility}:${sensorId}:${category}`;
    const now = Date.now();
    const lastTriggered = cooldownMap.get(cooldownKey);
    if (lastTriggered && now - lastTriggered < COOLDOWN_MS) {
      return null;
    }

    // Also check if an active (New/Acknowledged/Investigating) alert already exists for this sensor & category
    const existingActiveAlert = await Alert.findOne({
      facility: facility._id || facility,
      sensor: sensor._id || sensor,
      category,
      status: { $in: [ALERT_STATUSES.NEW, ALERT_STATUSES.ACKNOWLEDGED, ALERT_STATUSES.INVESTIGATING] }
    });

    if (existingActiveAlert) {
      cooldownMap.set(cooldownKey, now);
      return null;
    }

    // Create new alert
    const newAlert = await Alert.create({
      facility: facility._id || facility,
      storageUnit: storageUnit?._id || storageUnit,
      sensor: sensor?._id || sensor,
      title,
      description,
      category,
      severity,
      status: ALERT_STATUSES.NEW,
      triggeredValue: Number(value.toFixed(2)),
      thresholdValue,
      unit,
      isSimulated: true,
      cooldownUntil: new Date(now + COOLDOWN_MS),
      auditTrail: [{
        action: 'Alert Triggered by Automated Telemetry Evaluation',
        timestamp: new Date(),
        notes: `Telemetry value ${value.toFixed(2)} ${unit} exceeded threshold ${thresholdValue} ${unit}.`
      }]
    });

    cooldownMap.set(cooldownKey, now);

    // Update facility status if critical alert
    if (severity === ALERT_SEVERITIES.CRITICAL) {
      await Facility.findByIdAndUpdate(facility._id || facility, { status: 'Critical' });
    } else if (severity === ALERT_SEVERITIES.WARNING) {
      await Facility.findByIdAndUpdate(facility._id || facility, {
        $set: { status: 'Warning' }
      });
    }

    // Broadcast through Socket.IO
    if (ioInstance) {
      ioInstance.emit('new_alert', newAlert);
      ioInstance.to(`facility:${facility._id || facility}`).emit('facility_alert', newAlert);
    }

    // Create notifications for safety officers and managers
    await createNotificationForRoles({
      roles: [ROLES.SUPER_ADMIN, ROLES.FACILITY_MANAGER, ROLES.SAFETY_OFFICER],
      facilityId: facility._id || facility,
      title: `${severity.toUpperCase()}: ${title}`,
      message: description,
      type: 'alert',
      severity: severity === ALERT_SEVERITIES.CRITICAL ? 'critical' : 'warning',
      link: `/alerts/${newAlert._id}`
    });

    await logAuditEvent({
      action: 'ALERT_TRIGGERED',
      targetEntity: 'Alert',
      entityId: newAlert._id,
      facility: facility._id || facility,
      details: {
        category,
        severity,
        sensorId,
        triggeredValue: value,
        thresholdValue
      }
    });

    return newAlert;
  } catch (error) {
    console.error('[Alert Evaluation Error]:', error.message);
    return null;
  }
};
