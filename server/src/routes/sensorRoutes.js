import express from 'express';
import {
  getSensors,
  getSensorById,
  createSensor,
  updateSensor,
  recordCalibration,
  decommissionSensor
} from '../controllers/sensorController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);

router.get('/', getSensors);
router.get('/:id', getSensorById);
router.post('/', authorize(ROLES.SUPER_ADMIN, ROLES.FACILITY_MANAGER), createSensor);
router.put('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.FACILITY_MANAGER, ROLES.MAINTENANCE_TECH), updateSensor);
router.post('/:id/calibrate', authorize(ROLES.SUPER_ADMIN, ROLES.FACILITY_MANAGER, ROLES.MAINTENANCE_TECH), recordCalibration);
router.post('/:id/decommission', authorize(ROLES.SUPER_ADMIN), decommissionSensor);

export default router;
