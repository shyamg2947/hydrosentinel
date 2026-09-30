import Notification from '../models/Notification.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    const { unreadOnly, page = 1, limit = 30 } = req.query;
    const query = { user: req.user._id };

    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

    const skip = (Number(page) - 1) * Number(limit);
    const notifications = await Notification.find(query)
      .populate('facility', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
