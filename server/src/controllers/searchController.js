import Facility from '../models/Facility.js';
import Sensor from '../models/Sensor.js';
import Alert from '../models/Alert.js';
import WorkOrder from '../models/WorkOrder.js';
import SafetyDocument from '../models/SafetyDocument.js';

export const globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(200).json({
        success: true,
        results: {
          facilities: [],
          sensors: [],
          alerts: [],
          workOrders: [],
          safetyDocuments: []
        }
      });
    }

    const regex = new RegExp(q.trim(), 'i');

    const [facilities, sensors, alerts, workOrders, safetyDocuments] = await Promise.all([
      Facility.find({
        $or: [{ name: regex }, { code: regex }, { 'location.city': regex }]
      }).select('name code status location').limit(5),

      Sensor.find({
        $or: [{ sensorId: regex }, { name: regex }, { type: regex }]
      }).populate('facility', 'name code').select('sensorId name type status connectionStatus facility').limit(5),

      Alert.find({
        $or: [{ title: regex }, { description: regex }, { category: regex }]
      }).populate('facility', 'name code').select('title category severity status facility').limit(5),

      WorkOrder.find({
        $or: [{ workOrderNumber: regex }, { title: regex }]
      }).populate('facility', 'name code').select('workOrderNumber title priority status facility').limit(5),

      SafetyDocument.find({
        $or: [{ title: regex }, { documentNumber: regex }, { category: regex }]
      }).select('title documentNumber category status').limit(5)
    ]);

    res.status(200).json({
      success: true,
      query: q,
      results: {
        facilities,
        sensors,
        alerts,
        workOrders,
        safetyDocuments
      }
    });
  } catch (error) {
    next(error);
  }
};
