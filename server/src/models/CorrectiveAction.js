import mongoose from 'mongoose';

const correctiveActionSchema = new mongoose.Schema({
  actionNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    required: true,
    index: true
  },
  relatedComplianceRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ComplianceRecord'
  },
  relatedAlert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert'
  },
  category: {
    type: String,
    default: 'Inspection Non-Conformance'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'High',
    index: true
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Pending Verification', 'Closed'],
    default: 'Open',
    index: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dueDate: {
    type: Date,
    required: true
  },
  closedDate: {
    type: Date
  },
  rootCause: {
    type: String,
    default: ''
  },
  actionPlan: {
    type: String,
    default: ''
  },
  resolutionNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('CorrectiveAction', correctiveActionSchema);
