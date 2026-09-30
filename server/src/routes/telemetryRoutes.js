import express from 'express';
import { getLatestTelemetry, getHistoricalTelemetry } from '../controllers/telemetryController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/latest', getLatestTelemetry);
router.get('/history', getHistoricalTelemetry);

export default router;
