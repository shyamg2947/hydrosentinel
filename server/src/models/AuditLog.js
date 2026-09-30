import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  actorName: {
    type: String,
    required: true,
    default: 'System'
  },
  actorRole: {
    type: String,
    default: 'System Service'
  },
  action: {
    type: String,
    required: true,
    index: true
  },
  targetEntity: {
    type: String,
    required: true,
    enum: [
      'User',
      'Facility',
      'StorageUnit',
      'Sensor',
      'Alert',
      'WorkOrder',
      'ComplianceChecklist',
      'ComplianceRecord',
      'SafetyDocument',
      'CorrectiveAction',
      'Simulator',
      'Authentication',
      'Export'
    ],
    index: true
  },
  entityId: {
    type: String,
    default: ''
  },
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    index: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false
});

auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ facility: 1, timestamp: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
