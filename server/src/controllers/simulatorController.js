import SimulatorConfiguration from '../models/SimulatorConfiguration.js';
import { telemetryEngine } from '../simulator/telemetryEngine.js';

export const getSimulatorState = async (req, res, next) => {
  try {
    let config = await SimulatorConfiguration.findOne().populate('updatedBy', 'name email');
    if (!config) {
      config = await SimulatorConfiguration.create({
        isRunning: telemetryEngine.isRunning,
        intervalMs: telemetryEngine.intervalMs,
        scenario: telemetryEngine.scenario,
        noiseFactor: telemetryEngine.noiseFactor
      });
    }

    res.status(200).json({
      success: true,
      data: {
        isRunning: telemetryEngine.isRunning,
        intervalMs: telemetryEngine.intervalMs,
        scenario: telemetryEngine.scenario,
        noiseFactor: telemetryEngine.noiseFactor,
        lastRunAt: config.lastRunAt,
        updatedBy: config.updatedBy,
        notice: config.notice,
        availableScenarios: [
          'Normal Operations',
          'Elevated Pressure Warning',
          'Hydrogen Leak Alarm',
          'Sensor Communication Failure',
          'Mixed Multi-Anomaly'
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateSimulatorState = async (req, res, next) => {
  try {
    const { isRunning, intervalMs, scenario, noiseFactor } = req.body;

    const updated = await telemetryEngine.updateConfig({
      isRunning,
      intervalMs,
      scenario,
      noiseFactor,
      user: req.user
    });

    res.status(200).json({
      success: true,
      message: 'Telemetry simulator configuration updated successfully',
      data: {
        isRunning: telemetryEngine.isRunning,
        intervalMs: telemetryEngine.intervalMs,
        scenario: telemetryEngine.scenario,
        noiseFactor: telemetryEngine.noiseFactor,
        updated
      }
    });
  } catch (error) {
    next(error);
  }
};
