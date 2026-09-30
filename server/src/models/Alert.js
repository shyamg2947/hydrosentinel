import mongoose from 'mongoose';
import { ALERT_SEVERITIES, ALERT_STATUSES } from '../config/constants.js';

const alertSchema = new mongoose.Schema({
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    required: true,
    index: true
  },
  storageUnit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StorageUnit'
  },
  sensor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sensor'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: [
      'Pressure Exceeded',
      'Temperature Exceeded',
      'Leak Detected',
      'Sensor Offline',
      'Calibration Overdue',
      'Preventive Maintenance Overdue',
      'Compliance Checklist Overdue'
    ],
    required: true,
    index: true
  },
  severity: {
    type: String,
    enum: Object.values(ALERT_SEVERITIES),
    default: ALERT_SEVERITIES.WARNING,
    index: true
  },
  status: {
    type: String,
    enum: Object.values(ALERT_STATUSES),
    default: ALERT_STATUSES.NEW,
    index: true
  },
  triggeredValue: {
    type: Number
  },
  thresholdValue: {
    type: Number
  },
  unit: {
    type: String
  },
  isSimulated: {
    type: Boolean,
    default: true
  },
  emergencyProcedureNotice: {
    type: String,
    default: 'SAFETY ADVISORY: This system does NOT perform automated emergency isolation. In event of critical leak or pressure alarm, immediately follow site SOP-H2-EMG-01 and activate physical plant manual E-Stop.'
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acknowledgedAt: {
    type: Date
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  resolutionNotes: {
    type: String,
    default: ''
  },
  rootCauseAnalysis: {
    type: String,
    default: ''
  },
  cooldownUntil: {
    type: Date
  },
  auditTrail: [{
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    action: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String
  }]
}, {
  timestamps: true
});

alertSchema.index({ facility: 1, status: 1, createdAt: -1 });
alertSchema.index({ severity: 1, status: 1 });

export default mongoose.model('Alert', alertSchema);
