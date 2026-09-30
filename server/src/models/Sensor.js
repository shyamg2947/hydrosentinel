import mongoose from 'mongoose';

const sensorSchema = new mongoose.Schema({
  sensorId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Pressure', 'Temperature', 'Hydrogen Leak', 'Flow Rate', 'Vibration'],
    required: true,
    index: true
  },
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    required: true,
    index: true
  },
  storageUnit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StorageUnit',
    required: true,
    index: true
  },
  unit: {
    type: String,
    required: true,
    enum: ['bar', '°C', 'ppm', 'kg/h', 'mm/s']
  },
  installationDate: {
    type: Date,
    default: Date.now
  },
  lastCalibrationDate: {
    type: Date,
    default: Date.now
  },
  nextCalibrationDue: {
    type: Date,
    required: true,
    index: true
  },
  calibrationIntervalDays: {
    type: Number,
    default: 180
  },
  status: {
    type: String,
    enum: ['Active', 'Calibration Overdue', 'Warning', 'Critical', 'Offline', 'Decommissioned'],
    default: 'Active',
    index: true
  },
  connectionStatus: {
    type: String,
    enum: ['Online', 'Offline', 'Degraded'],
    default: 'Online',
    index: true
  },
  lastReading: {
    value: Number,
    timestamp: Date,
    isSimulated: { type: Boolean, default: true }
  },
  locationDescription: {
    type: String,
    default: 'Top manifold valve port'
  },
  serialNumber: {
    type: String,
    default: ''
  },
  manufacturer: {
    type: String,
    default: 'Sentinel Precision IoT'
  },
  isSimulationSource: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Sensor', sensorSchema);
