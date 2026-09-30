import express from 'express';
import {
  getStorageUnits,
  getStorageUnitById,
  createStorageUnit,
  updateStorageUnit
} from '../controllers/storageUnitController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);

router.get('/', getStorageUnits);
router.get('/facility/:facilityId', getStorageUnits);
router.get('/:id', getStorageUnitById);
router.post('/', authorize(ROLES.SUPER_ADMIN, ROLES.FACILITY_MANAGER), createStorageUnit);
router.put('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.FACILITY_MANAGER), updateStorageUnit);

export default router;
