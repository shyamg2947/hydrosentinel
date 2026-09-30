import express from 'express';
import { getSimulatorState, updateSimulatorState } from '../controllers/simulatorController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);

router.get('/status', getSimulatorState);
router.post('/configure', authorize(ROLES.SUPER_ADMIN, ROLES.FACILITY_MANAGER), updateSimulatorState);

export default router;
