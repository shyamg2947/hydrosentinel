import ComplianceChecklist from '../models/ComplianceChecklist.js';
import ComplianceRecord from '../models/ComplianceRecord.js';
import SafetyDocument from '../models/SafetyDocument.js';
import CorrectiveAction from '../models/CorrectiveAction.js';
import { logAuditEvent } from '../services/auditService.js';
import { createNotificationForRoles } from '../services/notificationService.js';

export const getComplianceChecklists = async (req, res, next) => {
  try {
    const { category, frequency } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    if (frequency) query.frequency = frequency;

    const checklists = await ComplianceChecklist.find(query).sort({ category: 1, title: 1 });
    res.status(200).json({ success: true, count: checklists.length, data: checklists });
  } catch (error) {
    next(error);
  }
};

export const createComplianceChecklist = async (req, res, next) => {
  try {
    const checklist = await ComplianceChecklist.create(req.body);
    await logAuditEvent({
      actor: req.user,
      action: 'COMPLIANCE_TEMPLATE_CREATED',
      targetEntity: 'ComplianceChecklist',
      entityId: checklist._id,
      details: { title: checklist.title, category: checklist.category }
    });
    res.status(201).json({ success: true, data: checklist });
  } catch (error) {
    next(error);
  }
};

export const getComplianceRecords = async (req, res, next) => {
  try {
    const { facility, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (req.user.role !== 'Super Admin' && !facility) {
      query.facility = { $in: req.user.assignedFacilities };
    } else if (facility) {
      query.facility = facility;
    }

    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await ComplianceRecord.countDocuments(query);
    const records = await ComplianceRecord.find(query)
      .populate('checklist', 'title code category frequency')
      .populate('facility', 'name code')
      .populate('completedBy', 'name role email')
      .populate('verifiedBy', 'name role')
      .sort({ inspectionDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: records.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: records
    });
  } catch (error) {
    next(error);
  }
};

export const getComplianceRecordById = async (req, res, next) => {
  try {
    const record = await ComplianceRecord.findById(req.params.id)
      .populate('checklist')
      .populate('facility', 'name code location thresholds')
      .populate('completedBy', 'name role email')
      .populate('verifiedBy', 'name role email');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Compliance record not found' });
    }

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

export const createComplianceRecord = async (req, res, next) => {
  try {
    const { checklist, facility, itemsChecked, notes, nextReviewDate } = req.body;

    // Calculate score
    const totalCount = itemsChecked?.length || 1;
    const passedCount = itemsChecked?.filter(i => i.status === 'Pass').length || 0;
    const score = Math.round((passedCount / totalCount) * 100);

    let status = 'Compliant';
    if (score < 80) status = 'Non-Compliant';
    else if (score < 100) status = 'Action Required';

    const record = await ComplianceRecord.create({
      checklist,
      facility,
      completedBy: req.user._id,
      itemsChecked,
      overallScorePercent: score,
      status,
      notes,
      nextReviewDate
    });

    await logAuditEvent({
      actor: req.user,
      action: 'COMPLIANCE_INSPECTION_SUBMITTED',
      targetEntity: 'ComplianceRecord',
      entityId: record._id,
      facility,
      details: { score, status }
    });

    if (status !== 'Compliant') {
      await createNotificationForRoles({
        roles: ['Safety Officer', 'Facility Manager', 'Super Admin'],
        facilityId: facility,
        title: `Compliance Review Notice: ${status}`,
        message: `Inspection scored ${score}%. Corrective actions may be required.`,
        type: 'compliance',
        severity: status === 'Non-Compliant' ? 'critical' : 'warning',
        link: `/compliance/records/${record._id}`
      });
    }

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

export const getSafetyDocuments = async (req, res, next) => {
  try {
    const { category, status, facility } = req.query;
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (facility) query.facility = facility;

    const docs = await SafetyDocument.find(query)
      .populate('facility', 'name code')
      .populate('responsibleOwner', 'name role')
      .sort({ reviewDate: -1 });

    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) {
    next(error);
  }
};

export const createSafetyDocument = async (req, res, next) => {
  try {
    const doc = await SafetyDocument.create({
      ...req.body,
      responsibleOwner: req.body.responsibleOwner || req.user._id
    });

    await logAuditEvent({
      actor: req.user,
      action: 'SAFETY_DOCUMENT_REGISTERED',
      targetEntity: 'SafetyDocument',
      entityId: doc._id,
      details: { title: doc.title, documentNumber: doc.documentNumber }
    });

    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

export const updateSafetyDocument = async (req, res, next) => {
  try {
    const doc = await SafetyDocument.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    await logAuditEvent({
      actor: req.user,
      action: 'SAFETY_DOCUMENT_UPDATED',
      targetEntity: 'SafetyDocument',
      entityId: doc._id,
      details: req.body
    });

    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

export const getCorrectiveActions = async (req, res, next) => {
  try {
    const { facility, status, priority } = req.query;
    const query = {};

    if (req.user.role !== 'Super Admin' && !facility) {
      query.facility = { $in: req.user.assignedFacilities };
    } else if (facility) {
      query.facility = facility;
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const actions = await CorrectiveAction.find(query)
      .populate('facility', 'name code')
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name')
      .populate('relatedAlert', 'title severity')
      .sort({ dueDate: 1, priority: -1 });

    res.status(200).json({ success: true, count: actions.length, data: actions });
  } catch (error) {
    next(error);
  }
};

export const createCorrectiveAction = async (req, res, next) => {
  try {
    const count = await CorrectiveAction.countDocuments();
    const actionNumber = `CAPA-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const action = await CorrectiveAction.create({
      ...req.body,
      actionNumber,
      createdBy: req.user._id
    });

    await logAuditEvent({
      actor: req.user,
      action: 'CORRECTIVE_ACTION_OPENED',
      targetEntity: 'CorrectiveAction',
      entityId: action._id,
      facility: action.facility,
      details: { actionNumber, title: action.title, priority: action.priority }
    });

    res.status(201).json({ success: true, data: action });
  } catch (error) {
    next(error);
  }
};

export const updateCorrectiveAction = async (req, res, next) => {
  try {
    const action = await CorrectiveAction.findById(req.params.id);
    if (!action) {
      return res.status(404).json({ success: false, message: 'Corrective action not found' });
    }

    Object.assign(action, req.body);
    if (req.body.status === 'Closed') {
      action.closedDate = new Date();
    }

    await action.save();

    await logAuditEvent({
      actor: req.user,
      action: `CORRECTIVE_ACTION_${action.status.toUpperCase()}`,
      targetEntity: 'CorrectiveAction',
      entityId: action._id,
      facility: action.facility,
      details: { status: action.status, resolutionNotes: action.resolutionNotes }
    });

    res.status(200).json({ success: true, data: action });
  } catch (error) {
    next(error);
  }
};

export const getComplianceDashboardStats = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role !== 'Super Admin') {
      query.facility = { $in: req.user.assignedFacilities };
    }

    const [totalRecords, compliantRecords, nonCompliantRecords, activeDocuments, openCAPAs] = await Promise.all([
      ComplianceRecord.countDocuments(query),
      ComplianceRecord.countDocuments({ ...query, status: 'Compliant' }),
      ComplianceRecord.countDocuments({ ...query, status: { $in: ['Non-Compliant', 'Action Required'] } }),
      SafetyDocument.countDocuments({ status: 'Active' }),
      CorrectiveAction.countDocuments({ ...query, status: { $in: ['Open', 'In Progress', 'Pending Verification'] } })
    ]);

    const complianceRate = totalRecords > 0 ? Math.round((compliantRecords / totalRecords) * 100) : 100;

    res.status(200).json({
      success: true,
      data: {
        complianceRate,
        totalRecords,
        compliantRecords,
        nonCompliantRecords,
        activeDocuments,
        openCAPAs
      }
    });
  } catch (error) {
    next(error);
  }
};
