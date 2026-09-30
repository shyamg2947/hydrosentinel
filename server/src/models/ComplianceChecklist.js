import mongoose from 'mongoose';

const complianceChecklistSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  category: {
    type: String,
    enum: [
      'Storage Pressure Integrity',
      'Leak Detection & Ventilation',
      'Emergency Isolation & Venting',
      'Electrical & Grounding Safety',
      'Personnel PPE & Training',
      'Fire Protection Systems'
    ],
    required: true,
    index: true
  },
  frequency: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual'],
    default: 'Monthly'
  },
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility'
  },
  items: [{
    itemId: { type: String, required: true },
    requirement: { type: String, required: true },
    verificationMethod: { type: String, default: 'Visual & Instrumental Audit' },
    isMandatory: { type: Boolean, default: true }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isIllustrativeTemplate: {
    type: Boolean,
    default: true
  },
  disclaimer: {
    type: String,
    default: 'ILLUSTRATIVE PROTOCOL: For training and internal operations tracking only. Authorized site safety managers must formally approve regulatory procedures.'
  }
}, {
  timestamps: true
});

export default mongoose.model('ComplianceChecklist', complianceChecklistSchema);
