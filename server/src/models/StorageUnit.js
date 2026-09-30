import mongoose from 'mongoose';

const storageUnitSchema = new mongoose.Schema({
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    required: true,
    index: true
  },
  unitId: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: [
      'High-Pressure Type IV Cylinder Bank',
      'Cryogenic Liquid LH2 Vessel',
      'Metal Hydride Solid Storage Tank',
      'Underground Cavern Buffer Module'
    ],
    default: 'High-Pressure Type IV Cylinder Bank'
  },
  volumeM3: {
    type: Number,
    required: true,
    default: 25
  },
  maxWorkingPressureBar: {
    type: Number,
    required: true,
    default: 500
  },
  currentStorageKg: {
    type: Number,
    default: 800
  },
  status: {
    type: String,
    enum: ['Normal', 'Warning', 'Critical', 'Maintenance', 'Decommissioned'],
    default: 'Normal',
    index: true
  },
  commissionDate: {
    type: Date,
    default: Date.now
  },
  lastInspectedDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

storageUnitSchema.index({ facility: 1, unitId: 1 }, { unique: true });

export default mongoose.model('StorageUnit', storageUnitSchema);
