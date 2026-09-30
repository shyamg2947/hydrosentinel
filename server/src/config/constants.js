export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  FACILITY_MANAGER: 'Facility Manager',
  SAFETY_OFFICER: 'Safety Officer',
  MAINTENANCE_TECH: 'Maintenance Technician',
  VIEWER: 'Viewer'
};

export const ALL_ROLES = Object.values(ROLES);

export const ALERT_SEVERITIES = {
  INFORMATIONAL: 'Informational',
  WARNING: 'Warning',
  CRITICAL: 'Critical'
};

export const ALERT_STATUSES = {
  NEW: 'New',
  ACKNOWLEDGED: 'Acknowledged',
  ASSIGNED: 'Assigned',
  INVESTIGATING: 'Investigating',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed'
};

export const WORK_ORDER_STATUSES = {
  PLANNED: 'Planned',
  SCHEDULED: 'Scheduled',
  IN_PROGRESS: 'In Progress',
  BLOCKED: 'Blocked',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

export const SIMULATION_NOTICE = "DEMONSTRATION SYSTEM: Telemetry, leak indicators, and compliance records are synthetic. This system does not control physical valves, compressors, or emergency shutdown circuits. Always follow site-approved safety procedures.";
