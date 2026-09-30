import mongoose from 'mongoose';

const maintenanceTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  category: {
    type: String,
    enum: [
      'Sensor Calibration',
      'Sensor Inspection',
      'Storage-Unit Inspection',
      'Equipment Servicing',
      'General Safety Inspection'
    ],
    required: true
  },
  defaultPriority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  estimatedDurationHours: {
    type: Number,
    default: 2
  },
  frequencyDays: {
    type: Number,
    default: 90
  },
  checklistItems: [{
    task: String,
    isMandatory: { type: Boolean, default: true }
  }],
  description: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('MaintenanceTemplate', maintenanceTemplateSchema);
