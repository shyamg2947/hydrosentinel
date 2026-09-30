import mongoose from 'mongoose';

const telemetrySchema = new mongoose.Schema({
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
  sensor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sensor',
    required: true,
    index: true
  },
  sensorId: {
    type: String,
    required: true
  },
  sensorType: {
    type: String,
    enum: ['Pressure', 'Temperature', 'Hydrogen Leak', 'Flow Rate', 'Vibration'],
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Normal', 'Warning', 'Critical'],
    default: 'Normal'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  isSimulated: {
    type: Boolean,
    default: true
  },
  rawQuality: {
    type: String,
    enum: ['Good', 'Degraded', 'Noisy', 'TestPattern'],
    default: 'Good'
  }
}, {
  timestamps: false,
  timeseries: false
});

// Compound indexes for time-series queries
telemetrySchema.index({ sensor: 1, timestamp: -1 });
telemetrySchema.index({ facility: 1, sensorType: 1, timestamp: -1 });
telemetrySchema.index({ timestamp: -1 });

export default mongoose.model('Telemetry', telemetrySchema);
