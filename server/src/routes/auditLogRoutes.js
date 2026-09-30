import express from 'express';
import { getAuditLogs } from '../controllers/auditLogController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);
router.get('/', authorize(ROLES.SUPER_ADMIN, ROLES.SAFETY_OFFICER, ROLES.FACILITY_MANAGER), getAuditLogs);

export default router;
