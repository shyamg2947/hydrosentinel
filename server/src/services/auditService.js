import AuditLog from '../models/AuditLog.js';

export const logAuditEvent = async ({
  actor = null,
  actorName = 'System Service',
  actorRole = 'System',
  action,
  targetEntity,
  entityId = '',
  facility = null,
  details = {},
  ipAddress = '127.0.0.1'
}) => {
  try {
    const log = await AuditLog.create({
      actor: actor?._id || actor,
      actorName: actor?.name || actorName,
      actorRole: actor?.role || actorRole,
      action,
      targetEntity,
      entityId: entityId ? entityId.toString() : '',
      facility,
      details,
      ipAddress
    });
    return log;
  } catch (error) {
    console.error('[Audit Log Error]: Failed to create log entry:', error.message);
    return null;
  }
};
