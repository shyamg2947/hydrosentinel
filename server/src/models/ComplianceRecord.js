import mongoose from 'mongoose';

const complianceRecordSchema = new mongoose.Schema({
  checklist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ComplianceChecklist',
    required: true,
    index: true
  },
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    required: true,
    index: true
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  inspectionDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  status: {
    type: String,
    enum: ['Compliant', 'Non-Compliant', 'Action Required', 'Under Review'],
    default: 'Compliant',
    index: true
  },
  itemsChecked: [{
    itemId: String,
    requirement: String,
    status: {
      type: String,
      enum: ['Pass', 'Fail', 'N/A'],
      default: 'Pass'
    },
    evidenceNotes: { type: String, default: '' },
    correctiveActionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CorrectiveAction'
    }
  }],
  overallScorePercent: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  notes: {
    type: String,
    default: ''
  },
  nextReviewDate: {
    type: Date
  }
}, {
  timestamps: true
});

complianceRecordSchema.index({ facility: 1, inspectionDate: -1 });

export default mongoose.model('ComplianceRecord', complianceRecordSchema);
