import Telemetry from '../models/Telemetry.js';
import Sensor from '../models/Sensor.js';
import Facility from '../models/Facility.js';

export const getLatestTelemetry = async (req, res, next) => {
  try {
    const { facilityId } = req.query;
    const query = {};

    if (facilityId) {
      query.facility = facilityId;
    } else if (req.user.role !== 'Super Admin') {
      query.facility = { $in: req.user.assignedFacilities };
    }

    const sensors = await Sensor.find(query)
      .populate('facility', 'name code thresholds')
      .populate('storageUnit', 'name unitId')
      .lean();

    const now = Date.now();

    const enriched = sensors.map(sensor => {
      const lastTime = sensor.lastReading?.timestamp ? new Date(sensor.lastReading.timestamp).getTime() : 0;
      // Stale if last update was more than 15 seconds ago for online sensor
      const isStale = sensor.connectionStatus === 'Online' && (now - lastTime > 15000);

      return {
        sensorId: sensor.sensorId,
        sensorName: sensor.name,
        sensorType: sensor.type,
        facilityId: sensor.facility?._id,
        facilityName: sensor.facility?.name,
        storageUnitId: sensor.storageUnit?._id,
        storageUnitName: sensor.storageUnit?.name,
        unit: sensor.unit,
        value: sensor.lastReading?.value !== undefined ? sensor.lastReading.value : 0,
        timestamp: sensor.lastReading?.timestamp || new Date(),
        connectionStatus: sensor.connectionStatus,
        status: sensor.status,
        isStale,
        isSimulated: true
      };
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched
    });
  } catch (error) {
    next(error);
  }
};

export const getHistoricalTelemetry = async (req, res, next) => {
  try {
    const { facilityId, sensorId, sensorType, hours = 6, limit = 200 } = req.query;
    const query = {};

    if (facilityId) query.facility = facilityId;
    if (sensorId) query.sensorId = sensorId;
    if (sensorType) query.sensorType = sensorType;

    const cutoff = new Date(Date.now() - Number(hours) * 60 * 60 * 1000);
    query.timestamp = { $gte: cutoff };

    const records = await Telemetry.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      count: records.length,
      data: records.reverse()
    });
  } catch (error) {
    next(error);
  }
};
