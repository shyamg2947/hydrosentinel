import Sensor from '../models/Sensor.js';
import Facility from '../models/Facility.js';
import StorageUnit from '../models/StorageUnit.js';
import Telemetry from '../models/Telemetry.js';
import SimulatorConfiguration from '../models/SimulatorConfiguration.js';
import { evaluateTelemetryAlert } from '../services/alertService.js';
import { logAuditEvent } from '../services/auditService.js';

class TelemetryEngine {
  constructor() {
    this.isRunning = false;
    this.intervalMs = 3000;
    this.scenario = 'Normal Operations';
    this.noiseFactor = 0.02;
    this.timer = null;
    this.io = null;
    this.tickCount = 0;
    this.cachedSensors = [];
    this.lastCacheRefresh = 0;
  }

  setSocketIO(io) {
    this.io = io;
  }

  async init() {
    try {
      let config = await SimulatorConfiguration.findOne();
      if (!config) {
        config = await SimulatorConfiguration.create({
          isRunning: process.env.SIMULATOR_AUTOSTART === 'true',
          intervalMs: Number(process.env.SIMULATOR_INTERVAL_MS) || 3000,
          scenario: 'Normal Operations',
          noiseFactor: 0.02
        });
      }

      this.intervalMs = config.intervalMs;
      this.scenario = config.scenario;
      this.noiseFactor = config.noiseFactor;

      if (config.isRunning) {
        this.start();
      }
    } catch (err) {
      console.error('[TelemetryEngine Init Error]:', err.message);
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(`[TelemetryEngine] Started with scenario: '${this.scenario}' (Interval: ${this.intervalMs}ms)`);
    this.scheduleNextTick();
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    console.log('[TelemetryEngine] Stopped.');
  }

  scheduleNextTick() {
    if (!this.isRunning) return;
    this.timer = setTimeout(async () => {
      await this.runTick();
      this.scheduleNextTick();
    }, this.intervalMs);
  }

  async refreshSensorCache() {
    const now = Date.now();
    if (now - this.lastCacheRefresh > 30000 || this.cachedSensors.length === 0) {
      this.cachedSensors = await Sensor.find({ status: { $ne: 'Decommissioned' } })
        .populate('facility', 'name code thresholds')
        .populate('storageUnit', 'name unitId maxWorkingPressureBar')
        .lean();
      this.lastCacheRefresh = now;
    }
  }

  async runTick() {
    try {
      this.tickCount++;
      await this.refreshSensorCache();

      if (!this.cachedSensors || this.cachedSensors.length === 0) {
        return;
      }

      const telemetryBatch = [];
      const broadcastData = [];
      const now = new Date();

      for (const sensor of this.cachedSensors) {
        if (!sensor.facility) continue;

        let value = 0;
        let quality = 'Good';
        let status = 'Normal';
        let isSensorOffline = false;

        const noise = (Math.random() - 0.5) * 2 * this.noiseFactor;

        // Determine value according to scenario and sensor type
        if (sensor.type === 'Pressure') {
          // Standard baseline 350 bar
          const baseline = 350 + Math.sin(this.tickCount * 0.1) * 15;
          if (this.scenario === 'Elevated Pressure Warning' || this.scenario === 'Mixed Multi-Anomaly') {
            value = 465 + Math.random() * 20; // breaches warning >450
            status = 'Warning';
          } else {
            value = baseline * (1 + noise);
            status = 'Normal';
          }
        } else if (sensor.type === 'Temperature') {
          // Normal: 18 - 25 C
          const baseline = 21 + Math.sin(this.tickCount * 0.05) * 4;
          value = baseline * (1 + noise * 0.5);
          status = value > 35 ? 'Warning' : 'Normal';
        } else if (sensor.type === 'Hydrogen Leak') {
          // Baseline ppm 0 - 5 ppm
          if (this.scenario === 'Hydrogen Leak Alarm' || (this.scenario === 'Mixed Multi-Anomaly' && this.tickCount % 2 === 0)) {
            value = 1150 + Math.random() * 300; // Breaches critical 1000 ppm
            status = 'Critical';
          } else {
            value = Math.max(0, 3 + (Math.random() - 0.5) * 4);
            status = 'Normal';
          }
        } else if (sensor.type === 'Flow Rate') {
          const baseline = 65;
          value = Math.max(0, baseline + (Math.random() - 0.5) * 10);
        } else if (sensor.type === 'Vibration') {
          value = Math.max(0.1, 0.45 + (Math.random() - 0.5) * 0.15);
        }

        // Scenario: Sensor Communication Failure
        if (this.scenario === 'Sensor Communication Failure' || (this.scenario === 'Mixed Multi-Anomaly' && sensor.sensorId.endsWith('4'))) {
          isSensorOffline = true;
          quality = 'Degraded';
        }

        // If offline scenario targets this sensor, simulate dropped packets
        if (isSensorOffline) {
          await Sensor.findByIdAndUpdate(sensor._id, {
            connectionStatus: 'Offline',
            status: 'Offline'
          });
          continue; // Don't produce telemetry, allowing stale data indicator to activate
        }

        // Ensure online status
        if (sensor.connectionStatus === 'Offline') {
          await Sensor.findByIdAndUpdate(sensor._id, {
            connectionStatus: 'Online',
            status: 'Active'
          });
        }

        const reading = {
          facility: sensor.facility._id,
          storageUnit: sensor.storageUnit?._id,
          sensor: sensor._id,
          sensorId: sensor.sensorId,
          sensorType: sensor.type,
          value: Number(value.toFixed(2)),
          unit: sensor.unit,
          status,
          timestamp: now,
          isSimulated: true,
          rawQuality: quality
        };

        telemetryBatch.push(reading);
        broadcastData.push({
          ...reading,
          sensorName: sensor.name,
          facilityName: sensor.facility.name,
          storageUnitName: sensor.storageUnit?.name
        });

        // Update sensor last reading in DB every 3 ticks to keep DB write load balanced
        if (this.tickCount % 3 === 0) {
          await Sensor.findByIdAndUpdate(sensor._id, {
            lastReading: {
              value: reading.value,
              timestamp: now,
              isSimulated: true
            }
          });
        }

        // Evaluate alert threshold
        await evaluateTelemetryAlert({
          facility: sensor.facility,
          storageUnit: sensor.storageUnit,
          sensor,
          sensorId: sensor.sensorId,
          sensorType: sensor.type,
          value: reading.value,
          unit: sensor.unit,
          facilityThresholds: sensor.facility.thresholds
        });
      }

      // Persist telemetry batch
      if (telemetryBatch.length > 0) {
        await Telemetry.insertMany(telemetryBatch);
      }

      // Update Facility last telemetry timestamp
      const facilityIds = [...new Set(telemetryBatch.map(t => t.facility.toString()))];
      await Facility.updateMany(
        { _id: { $in: facilityIds } },
        { lastTelemetryTimestamp: now }
      );

      // Broadcast to Socket.IO clients
      if (this.io) {
        this.io.emit('telemetry_tick', {
          timestamp: now,
          count: broadcastData.length,
          readings: broadcastData,
          scenario: this.scenario,
          isSimulated: true
        });

        // Room-specific broadcasts
        facilityIds.forEach(fId => {
          const facilityReadings = broadcastData.filter(d => d.facility.toString() === fId);
          this.io.to(`facility:${fId}`).emit('facility_telemetry_tick', {
            facilityId: fId,
            timestamp: now,
            readings: facilityReadings,
            isSimulated: true
          });
        });
      }

      // Run telemetry purge cleanup every ~100 ticks to enforce configured retention
      if (this.tickCount % 100 === 0) {
        this.pruneOldTelemetry();
      }
    } catch (err) {
      console.error('[TelemetryEngine Tick Error]:', err.message);
    }
  }

  async pruneOldTelemetry() {
    try {
      const hours = Number(process.env.TELEMETRY_RETENTION_HOURS) || 72;
      const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
      const res = await Telemetry.deleteMany({ timestamp: { $lt: cutoff } });
      if (res.deletedCount > 0) {
        console.log(`[TelemetryEngine] Purged ${res.deletedCount} telemetry records older than ${hours}h`);
      }
    } catch (err) {
      console.error('[TelemetryEngine Prune Error]:', err.message);
    }
  }

  async updateConfig({ isRunning, intervalMs, scenario, noiseFactor, user }) {
    if (intervalMs !== undefined) this.intervalMs = Math.max(1000, intervalMs);
    if (scenario !== undefined) this.scenario = scenario;
    if (noiseFactor !== undefined) this.noiseFactor = noiseFactor;

    if (isRunning !== undefined) {
      if (isRunning && !this.isRunning) this.start();
      else if (!isRunning && this.isRunning) this.stop();
    }

    const updated = await SimulatorConfiguration.findOneAndUpdate(
      {},
      {
        isRunning: this.isRunning,
        intervalMs: this.intervalMs,
        scenario: this.scenario,
        noiseFactor: this.noiseFactor,
        lastRunAt: new Date(),
        updatedBy: user?._id
      },
      { upsert: true, new: true }
    );

    if (this.io) {
      this.io.emit('simulator_status', {
        isRunning: this.isRunning,
        intervalMs: this.intervalMs,
        scenario: this.scenario,
        noiseFactor: this.noiseFactor
      });
    }

    await logAuditEvent({
      actor: user,
      action: 'SIMULATOR_CONFIG_UPDATED',
      targetEntity: 'Simulator',
      details: {
        isRunning: this.isRunning,
        intervalMs: this.intervalMs,
        scenario: this.scenario
      }
    });

    return updated;
  }
}

export const telemetryEngine = new TelemetryEngine();
