import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import facilityRoutes from './facilityRoutes.js';
import storageUnitRoutes from './storageUnitRoutes.js';
import sensorRoutes from './sensorRoutes.js';
import telemetryRoutes from './telemetryRoutes.js';
import alertRoutes from './alertRoutes.js';
import maintenanceRoutes from './maintenanceRoutes.js';
import complianceRoutes from './complianceRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import auditLogRoutes from './auditLogRoutes.js';
import simulatorRoutes from './simulatorRoutes.js';
import searchRoutes from './searchRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/facilities', facilityRoutes);
router.use('/storage-units', storageUnitRoutes);
router.use('/sensors', sensorRoutes);
router.use('/telemetry', telemetryRoutes);
router.use('/alerts', alertRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/compliance', complianceRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/simulator', simulatorRoutes);
router.use('/search', searchRoutes);

export default router;
