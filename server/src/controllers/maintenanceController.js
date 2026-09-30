import WorkOrder from '../models/WorkOrder.js';
import MaintenanceTemplate from '../models/MaintenanceTemplate.js';
import Sensor from '../models/Sensor.js';
import { WORK_ORDER_STATUSES } from '../config/constants.js';
import { logAuditEvent } from '../services/auditService.js';
import { createNotificationForRoles } from '../services/notificationService.js';

export const getWorkOrders = async (req, res, next) => {
  try {
    const { facility, status, priority, category, assignedTo, search, page = 1, limit = 25 } = req.query;
    const query = {};

    if (req.user.role === 'Maintenance Technician') {
      // Technicians see their own or facility-level work orders
      query.$or = [{ assignedTo: req.user._id }, { facility: { $in: req.user.assignedFacilities } }];
    } else if (req.user.role !== 'Super Admin' && !facility) {
      query.facility = { $in: req.user.assignedFacilities };
    } else if (facility) {
      query.facility = facility;
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (assignedTo) query.assignedTo = assignedTo;

    if (search) {
      query.$or = [
        { workOrderNumber: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await WorkOrder.countDocuments(query);
    const workOrders = await WorkOrder.find(query)
      .populate('facility', 'name code')
      .populate('storageUnit', 'name unitId')
      .populate('sensor', 'name sensorId type')
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name')
      .sort({ dueDate: 1, priority: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: workOrders.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: workOrders
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkOrderById = async (req, res, next) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id)
      .populate('facility', 'name code location')
      .populate('storageUnit', 'name unitId volumeM3')
      .populate('sensor', 'name sensorId type unit lastCalibrationDate')
      .populate('relatedAlert', 'title severity category')
      .populate('assignedTo', 'name email phone role')
      .populate('createdBy', 'name email');

    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    res.status(200).json({ success: true, data: workOrder });
  } catch (error) {
    next(error);
  }
};

export const createWorkOrder = async (req, res, next) => {
  try {
    const count = await WorkOrder.countDocuments();
    const workOrderNumber = `WO-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const workOrder = await WorkOrder.create({
      ...req.body,
      workOrderNumber,
      createdBy: req.user._id
    });

    await logAuditEvent({
      actor: req.user,
      action: 'WORK_ORDER_CREATED',
      targetEntity: 'WorkOrder',
      entityId: workOrder._id,
      facility: workOrder.facility,
      details: { workOrderNumber, title: workOrder.title, priority: workOrder.priority }
    });

    if (workOrder.assignedTo) {
      await createNotificationForRoles({
        roles: ['Maintenance Technician', 'Facility Manager'],
        facilityId: workOrder.facility,
        title: `Work Order Assigned: ${workOrderNumber}`,
        message: `Task: ${workOrder.title} (Priority: ${workOrder.priority})`,
        type: 'work_order',
        severity: workOrder.priority === 'Critical' ? 'critical' : 'warning',
        link: `/maintenance/work-orders/${workOrder._id}`
      });
    }

    res.status(201).json({ success: true, data: workOrder });
  } catch (error) {
    next(error);
  }
};

export const updateWorkOrder = async (req, res, next) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id);
    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    const previousStatus = workOrder.status;

    // Apply updates
    Object.assign(workOrder, req.body);

    if (req.body.status === WORK_ORDER_STATUSES.COMPLETED && previousStatus !== WORK_ORDER_STATUSES.COMPLETED) {
      workOrder.completedDate = new Date();

      // If category was Sensor Calibration, automatically update sensor calibration date
      if (workOrder.category === 'Sensor Calibration' && workOrder.sensor) {
        const sensor = await Sensor.findById(workOrder.sensor);
        if (sensor) {
          const now = new Date();
          const intervalDays = sensor.calibrationIntervalDays || 180;
          sensor.lastCalibrationDate = now;
          sensor.nextCalibrationDue = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
          sensor.status = 'Active';
          await sensor.save();
        }
      }
    }

    await workOrder.save();

    await logAuditEvent({
      actor: req.user,
      action: `WORK_ORDER_STATUS_${workOrder.status.toUpperCase()}`,
      targetEntity: 'WorkOrder',
      entityId: workOrder._id,
      facility: workOrder.facility,
      details: { status: workOrder.status, completionNotes: workOrder.completionNotes }
    });

    res.status(200).json({ success: true, data: workOrder });
  } catch (error) {
    next(error);
  }
};

export const getMaintenanceTemplates = async (req, res, next) => {
  try {
    const templates = await MaintenanceTemplate.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, data: templates });
  } catch (error) {
    next(error);
  }
};

export const getMaintenanceCalendar = async (req, res, next) => {
  try {
    const { facility, month, year } = req.query;
    const currentYear = year ? Number(year) : new Date().getFullYear();
    const currentMonth = month ? Number(month) - 1 : new Date().getMonth();

    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    const query = {
      dueDate: { $gte: startDate, $lte: endDate }
    };

    if (facility) query.facility = facility;
    else if (req.user.role !== 'Super Admin') query.facility = { $in: req.user.assignedFacilities };

    const workOrders = await WorkOrder.find(query)
      .populate('facility', 'name code')
      .populate('assignedTo', 'name')
      .select('workOrderNumber title priority status dueDate category assignedTo')
      .sort({ dueDate: 1 });

    res.status(200).json({ success: true, count: workOrders.length, data: workOrders });
  } catch (error) {
    next(error);
  }
};

export const getMaintenanceStats = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role !== 'Super Admin') {
      query.facility = { $in: req.user.assignedFacilities };
    }

    const now = new Date();
    const upcomingCutoff = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [total, overdue, upcoming, byStatus, byPriority] = await Promise.all([
      WorkOrder.countDocuments(query),
      WorkOrder.countDocuments({
        ...query,
        status: { $in: ['Planned', 'Scheduled', 'In Progress', 'Blocked'] },
        dueDate: { $lt: now }
      }),
      WorkOrder.countDocuments({
        ...query,
        status: { $in: ['Planned', 'Scheduled'] },
        dueDate: { $gte: now, $lte: upcomingCutoff }
      }),
      WorkOrder.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      WorkOrder.aggregate([
        { $match: query },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        overdue,
        upcoming,
        byStatus: Object.fromEntries(byStatus.map(s => [s._id, s.count])),
        byPriority: Object.fromEntries(byPriority.map(p => [p._id, p.count]))
      }
    });
  } catch (error) {
    next(error);
  }
};
