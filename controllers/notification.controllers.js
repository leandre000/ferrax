import Notification from '../models/notification.model.js';
import { logger } from '../config/logger.js';

/**
 * Get all notifications for the current user
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, read } = req.query;

    const filter = { user: userId };
    if (read !== undefined) {
      filter.read = read === 'true';
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ user: userId, read: false });

    res.json({
      notifications,
      total,
      page: Number(page),
      limit: Number(limit),
      unreadCount
    });
  } catch (error) {
    logger.error({ err: error, userId: req.user?._id }, 'Failed to fetch notifications');
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

/**
 * Get a single notification by ID
 */
export const getNotificationById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const notification = await Notification.findOne({ _id: id, user: userId });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    logger.error({ err: error, notificationId: req.params.id, userId: req.user?._id }, 'Failed to fetch notification');
    res.status(500).json({ message: 'Failed to fetch notification' });
  }
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: userId, read: false },
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found or already read' });
    }

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    logger.error({ err: error, notificationId: req.params.id, userId: req.user?._id }, 'Failed to mark notification as read');
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
};

/**
 * Mark multiple notifications as read
 */
export const markMultipleAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds)) {
      return res.status(400).json({ message: 'notificationIds must be an array' });
    }

    const result = await Notification.updateMany(
      { _id: { $in: notificationIds }, user: userId, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({
      message: `Marked ${result.modifiedCount} notifications as read`,
      count: result.modifiedCount
    });
  } catch (error) {
    logger.error({ err: error, userId: req.user?._id }, 'Failed to mark notifications as read');
    res.status(500).json({ message: 'Failed to mark notifications as read' });
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.updateMany(
      { user: userId, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({
      message: `Marked ${result.modifiedCount} notifications as read`,
      count: result.modifiedCount
    });
  } catch (error) {
    logger.error({ err: error, userId: req.user?._id }, 'Failed to mark all notifications as read');
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({ _id: id, user: userId });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted', notification });
  } catch (error) {
    logger.error({ err: error, notificationId: req.params.id, userId: req.user?._id }, 'Failed to delete notification');
    res.status(500).json({ message: 'Failed to delete notification' });
  }
};

/**
 * Delete multiple notifications
 */
export const deleteMultipleNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds)) {
      return res.status(400).json({ message: 'notificationIds must be an array' });
    }

    const result = await Notification.deleteMany({
      _id: { $in: notificationIds },
      user: userId
    });

    res.json({
      message: `Deleted ${result.deletedCount} notifications`,
      count: result.deletedCount
    });
  } catch (error) {
    logger.error({ err: error, userId: req.user?._id }, 'Failed to delete notifications');
    res.status(500).json({ message: 'Failed to delete notifications' });
  }
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.deleteMany({ user: userId });

    res.json({
      message: `Cleared ${result.deletedCount} notifications`,
      count: result.deletedCount
    });
  } catch (error) {
    logger.error({ err: error, userId: req.user?._id }, 'Failed to clear notifications');
    res.status(500).json({ message: 'Failed to clear notifications' });
  }
};

/**
 * Get unread count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const count = await Notification.countDocuments({ user: userId, read: false });

    res.json({ unreadCount: count });
  } catch (error) {
    logger.error({ err: error, userId: req.user?._id }, 'Failed to get unread count');
    res.status(500).json({ message: 'Failed to get unread count' });
  }
};

