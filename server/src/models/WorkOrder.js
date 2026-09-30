import mongoose from 'mongoose';
import { WORK_ORDER_STATUSES } from '../config/constants.js';

const workOrderSchema = new mongoose.Schema({
  workOrderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
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
    ref: 'StorageUnit'
  },
  sensor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sensor'
  },
  relatedAlert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert'
  },
  title: {
    type: String,
    required: [true, 'Work order title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
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
    default: 'Sensor Inspection',
    index: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
    index: true
  },
  status: {
    type: String,
    enum: Object.values(WORK_ORDER_STATUSES),
    default: WORK_ORDER_STATUSES.PLANNED,
    index: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  plannedDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true,
    index: true
  },
  completedDate: {
    type: Date
  },
  estimatedDurationHours: {
    type: Number,
    default: 2
  },
  actualDurationHours: {
    type: Number
  },
  checklist: [{
    task: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: Date,
    notes: String
  }],
  completionNotes: {
    type: String,
    default: ''
  },
  attachments: [{
    fileName: String,
    fileType: String,
    fileSizeKb: Number,
    uploadDate: { type: Date, default: Date.now },
    fileUrl: String
  }]
}, {
  timestamps: true
});

workOrderSchema.index({ facility: 1, status: 1, dueDate: 1 });

export default mongoose.model('WorkOrder', workOrderSchema);
