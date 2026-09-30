import express from 'express';
import {
  getWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  getMaintenanceTemplates,
  getMaintenanceCalendar,
  getMaintenanceStats
} from '../controllers/maintenanceController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);

router.get('/work-orders', getWorkOrders);
router.get('/work-orders/stats', getMaintenanceStats);
router.get('/work-orders/calendar', getMaintenanceCalendar);
router.get('/work-orders/:id', getWorkOrderById);
router.post('/work-orders', authorize(ROLES.SUPER_ADMIN, ROLES.FACILITY_MANAGER, ROLES.SAFETY_OFFICER), createWorkOrder);
router.put('/work-orders/:id', authorize(ROLES.SUPER_ADMIN, ROLES.FACILITY_MANAGER, ROLES.SAFETY_OFFICER, ROLES.MAINTENANCE_TECH), updateWorkOrder);
router.get('/templates', getMaintenanceTemplates);

export default router;
