import mongoose from 'mongoose';

const simulatorConfigSchema = new mongoose.Schema({
  isRunning: {
    type: Boolean,
    default: true
  },
  intervalMs: {
    type: Number,
    default: 3000,
    min: 1000,
    max: 60000
  },
  scenario: {
    type: String,
    enum: [
      'Normal Operations',
      'Elevated Pressure Warning',
      'Hydrogen Leak Alarm',
      'Sensor Communication Failure',
      'Mixed Multi-Anomaly'
    ],
    default: 'Normal Operations'
  },
  noiseFactor: {
    type: Number,
    default: 0.02,
    min: 0,
    max: 0.2
  },
  lastRunAt: {
    type: Date
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notice: {
    type: String,
    default: 'TEST SIMULATION ENGINE: Synthetic mathematical model generation. No connection to physical hydrogen hardware.'
  }
}, {
  timestamps: true
});

export default mongoose.model('SimulatorConfiguration', simulatorConfigSchema);
