import express from 'express';
import {
  getComplianceChecklists,
  createComplianceChecklist,
  getComplianceRecords,
  getComplianceRecordById,
  createComplianceRecord,
  getSafetyDocuments,
  createSafetyDocument,
  updateSafetyDocument,
  getCorrectiveActions,
  createCorrectiveAction,
  updateCorrectiveAction,
  getComplianceDashboardStats
} from '../controllers/complianceController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard-stats', getComplianceDashboardStats);

// Checklists
router.get('/checklists', getComplianceChecklists);
router.post('/checklists', authorize(ROLES.SUPER_ADMIN, ROLES.SAFETY_OFFICER), createComplianceChecklist);

// Inspection Records
router.get('/records', getComplianceRecords);
router.get('/records/:id', getComplianceRecordById);
router.post('/records', authorize(ROLES.SUPER_ADMIN, ROLES.SAFETY_OFFICER, ROLES.FACILITY_MANAGER), createComplianceRecord);

// Safety Documents
router.get('/documents', getSafetyDocuments);
router.post('/documents', authorize(ROLES.SUPER_ADMIN, ROLES.SAFETY_OFFICER), createSafetyDocument);
router.put('/documents/:id', authorize(ROLES.SUPER_ADMIN, ROLES.SAFETY_OFFICER), updateSafetyDocument);

// Corrective Actions (CAPA)
router.get('/actions', getCorrectiveActions);
router.post('/actions', authorize(ROLES.SUPER_ADMIN, ROLES.SAFETY_OFFICER, ROLES.FACILITY_MANAGER), createCorrectiveAction);
router.put('/actions/:id', authorize(ROLES.SUPER_ADMIN, ROLES.SAFETY_OFFICER, ROLES.FACILITY_MANAGER, ROLES.MAINTENANCE_TECH), updateCorrectiveAction);

export default router;
