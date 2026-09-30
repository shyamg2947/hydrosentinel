import mongoose from 'mongoose';

const safetyDocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  documentNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  category: {
    type: String,
    enum: [
      'Standard Operating Procedure',
      'Emergency Response Plan',
      'Hazard Analysis (HAZOP)',
      'Inspection Protocol',
      'Regulatory Standard Guidance'
    ],
    required: true,
    index: true
  },
  version: {
    type: String,
    default: '1.0'
  },
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    index: true
  },
  reviewDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  responsibleOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['Active', 'Draft', 'Under Review', 'Archived'],
    default: 'Active',
    index: true
  },
  fileUrl: {
    type: String,
    default: ''
  },
  summary: {
    type: String,
    default: ''
  },
  isDemonstrationNotice: {
    type: String,
    default: 'DEMO DOCUMENT REGISTER: Provided for software evaluation. Certified industrial safety procedures require approval by licensed site engineers.'
  }
}, {
  timestamps: true
});

export default mongoose.model('SafetyDocument', safetyDocumentSchema);
