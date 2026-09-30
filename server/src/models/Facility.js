import mongoose from 'mongoose';

const facilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Facility name is required'],
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: [true, 'Facility code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  location: {
    address: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    coordinates: {
      lat: { type: Number, default: 20.5937 },
      lng: { type: Number, default: 78.9629 }
    }
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Normal', 'Warning', 'Critical', 'Maintenance', 'Offline'],
    default: 'Normal',
    index: true
  },
  totalCapacityKg: {
    type: Number,
    required: true,
    default: 5000
  },
  currentStorageKg: {
    type: Number,
    default: 3200
  },
  operationalMode: {
    type: String,
    enum: ['Active Dispensing', 'Bulk Storage Buffer', 'Electrolyzer Ingestion', 'Standby Hold'],
    default: 'Active Dispensing'
  },
  // Illustrative safety thresholds
  thresholds: {
    pressureWarningBar: { type: Number, default: 450 },
    pressureCriticalBar: { type: Number, default: 500 },
    tempMinC: { type: Number, default: -40 },
    tempMaxC: { type: Number, default: 65 },
    leakWarningPpm: { type: Number, default: 400 },
    leakCriticalPpm: { type: Number, default: 1000 },
    disclaimer: {
      type: String,
      default: 'ILLUSTRATIVE THRESHOLDS ONLY. Must be validated and approved by certified facility safety engineers.'
    }
  },
  contacts: [{
    name: String,
    role: String,
    phone: String,
    email: String
  }],
  lastAuditDate: {
    type: Date,
    default: Date.now
  },
  lastTelemetryTimestamp: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model('Facility', facilitySchema);
