import Notification from '../models/Notification.js';
import User from '../models/User.js';

let ioInstance = null;

export const setSocketIOInstance = (io) => {
  ioInstance = io;
};

export const createNotificationForRoles = async ({
  roles = [],
  facilityId = null,
  title,
  message,
  type = 'alert',
  severity = 'info',
  link = ''
}) => {
  try {
    let query = { isActive: true };
    if (roles.length > 0) {
      query.role = { $in: roles };
    }

    const users = await User.find(query).select('_id assignedFacilities role');

    const eligibleUsers = users.filter(user => {
      if (user.role === 'Super Admin') return true;
      if (!facilityId) return true;
      return user.assignedFacilities.some(f => f.toString() === facilityId.toString());
    });

    const notifications = await Promise.all(
      eligibleUsers.map(user =>
        Notification.create({
          user: user._id,
          facility: facilityId,
          title,
          message,
          type,
          severity,
          link
        })
      )
    );

    if (ioInstance) {
      notifications.forEach(n => {
        ioInstance.to(`user:${n.user}`).emit('new_notification', n);
      });
      if (facilityId) {
        ioInstance.to(`facility:${facilityId}`).emit('facility_event', {
          title,
          message,
          severity,
          type
        });
      }
    }

    return notifications;
  } catch (error) {
    console.error('[Notification Service Error]:', error.message);
    return [];
  }
};
