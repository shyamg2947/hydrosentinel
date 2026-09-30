import express from 'express';
import {
  getExecutiveDashboardMetrics,
  getAlertAnalytics,
  exportDataCSV
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/executive-dashboard', getExecutiveDashboardMetrics);
router.get('/alert-metrics', getAlertAnalytics);
router.get('/export/csv', exportDataCSV);

export default router;
