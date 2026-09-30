import express from 'express';
import {
  getAlerts,
  getAlertById,
  acknowledgeAlert,
  assignAlert,
  updateAlertStatus,
  getAlertSummaryStats
} from '../controllers/alertController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);

router.get('/', getAlerts);
router.get('/summary', getAlertSummaryStats);
router.get('/:id', getAlertById);
router.post('/:id/acknowledge', acknowledgeAlert);
router.post('/:id/assign', authorize(ROLES.SUPER_ADMIN, ROLES.FACILITY_MANAGER, ROLES.SAFETY_OFFICER), assignAlert);
router.put('/:id/status', authorize(ROLES.SUPER_ADMIN, ROLES.FACILITY_MANAGER, ROLES.SAFETY_OFFICER, ROLES.MAINTENANCE_TECH), updateAlertStatus);

export default router;
