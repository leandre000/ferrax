import Notification from '../models/notification.model.js';
import { logger } from '../config/logger.js';

class NotificationService {
  /**
   * Create a notification and emit it via WebSocket if IO is available
   */
  async createNotification(data, io = null) {
    try {
      const { user, type, title, message, metadata, link, icon } = data;

      const notification = await Notification.create({
        user,
        type,
        title,
        message,
        metadata: metadata || {},
        link,
        icon
      });

      // Emit notification via WebSocket if IO is available
      if (io) {
        io.to(user.toString()).emit('newNotification', {
          notification: {
            _id: notification._id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            read: notification.read,
            metadata: notification.metadata,
            link: notification.link,
            icon: notification.icon,
            createdAt: notification.createdAt
          }
        });
      }

      logger.info({ notificationId: notification._id, userId: user, type }, 'Notification created');
      return notification;
    } catch (error) {
      logger.error({ err: error, data }, 'Failed to create notification');
      throw error;
    }
  }

  /**
   * Send booking-related notifications
   */
  async notifyBookingConfirmed(userId, bookingId, carInfo, io = null) {
    const metadata = { bookingId };
    return this.createNotification({
      user: userId,
      type: 'booking_confirmed',
      title: 'Booking Confirmed',
      message: `Your booking for ${carInfo.make} ${carInfo.model} has been confirmed.`,
      metadata,
      link: `/bookings/${bookingId}`,
      icon: 'check-circle'
    }, io);
  }

  async notifyBookingCancelled(userId, bookingId, carInfo, io = null) {
    const metadata = { bookingId };
    return this.createNotification({
      user: userId,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `Your booking for ${carInfo.make} ${carInfo.model} has been cancelled.`,
      metadata,
      link: `/bookings/${bookingId}`,
      icon: 'x-circle'
    }, io);
  }

  async notifyBookingExpired(userId, bookingId, carInfo, io = null) {
    const metadata = { bookingId };
    return this.createNotification({
      user: userId,
      type: 'booking_expired',
      title: 'Booking Expired',
      message: `Your booking for ${carInfo.make} ${carInfo.model} has expired. Please create a new booking if needed.`,
      metadata,
      link: `/bookings/${bookingId}`,
      icon: 'clock'
    }, io);
  }

  /**
   * Send order-related notifications
   */
  async notifyOrderCreated(userId, orderId, carInfo, amount, io = null) {
    const metadata = { orderId, amount };
    return this.createNotification({
      user: userId,
      type: 'order_created',
      title: 'Order Created',
      message: `Your order for ${carInfo.make} ${carInfo.model} ($${amount}) has been created.`,
      metadata,
      link: `/orders/${orderId}`,
      icon: 'shopping-bag'
    }, io);
  }

  async notifyOrderPaid(userId, orderId, carInfo, amount, io = null) {
    const metadata = { orderId, amount };
    return this.createNotification({
      user: userId,
      type: 'order_paid',
      title: 'Order Paid',
      message: `Your order for ${carInfo.make} ${carInfo.model} has been paid successfully.`,
      metadata,
      link: `/orders/${orderId}`,
      icon: 'credit-card'
    }, io);
  }

  async notifyOrderCancelled(userId, orderId, carInfo, io = null) {
    const metadata = { orderId };
    return this.createNotification({
      user: userId,
      type: 'order_cancelled',
      title: 'Order Cancelled',
      message: `Your order for ${carInfo.make} ${carInfo.model} has been cancelled.`,
      metadata,
      link: `/orders/${orderId}`,
      icon: 'x-circle'
    }, io);
  }

  /**
   * Send messaging-related notifications
   */
  async notifyNewMessage(userId, senderName, carInfo, messageId, io = null) {
    const metadata = { messageId, carId: carInfo._id };
    return this.createNotification({
      user: userId,
      type: 'new_message',
      title: 'New Message',
      message: `${senderName} sent you a message about ${carInfo.make} ${carInfo.model}.`,
      metadata,
      link: `/messages?carId=${carInfo._id}`,
      icon: 'message-circle'
    }, io);
  }

  /**
   * Send car-related notifications
   */
  async notifyCarReserved(userId, carInfo, io = null) {
    const metadata = { carId: carInfo._id };
    return this.createNotification({
      user: userId,
      type: 'car_reserved',
      title: 'Car Reserved',
      message: `${carInfo.make} ${carInfo.model} has been reserved.`,
      metadata,
      link: `/cars/${carInfo._id}`,
      icon: 'lock'
    }, io);
  }

  async notifyCarSold(carOwnerId, carInfo, buyerId, io = null) {
    const metadata = { carId: carInfo._id, buyerId };
    return this.createNotification({
      user: carOwnerId,
      type: 'car_sold',
      title: 'Car Sold',
      message: `Congratulations! Your ${carInfo.make} ${carInfo.model} has been sold.`,
      metadata,
      link: `/cars/${carInfo._id}`,
      icon: 'check-circle'
    }, io);
  }

  /**
   * Send admin-related notifications
   */
  async notifyAdminApproval(userId, type, data, io = null) {
    let title, message, link;

    switch (type) {
      case 'car_listed':
        title = 'Car Listed';
        message = `Your car ${data.make} ${data.model} has been approved and is now available.`;
        link = `/cars/${data.carId}`;
        break;
      case 'car_rejected':
        title = 'Car Rejected';
        message = `Your car ${data.make} ${data.model} has been rejected. Please check the reason.`;
        link = `/cars/${data.carId}`;
        break;
      default:
        title = 'Admin Action';
        message = 'An admin action has been taken on your request.';
        link = '/dashboard';
    }

    return this.createNotification({
      user: userId,
      type: 'admin_approval',
      title,
      message,
      metadata: { type, ...data },
      link,
      icon: 'shield-check'
    }, io);
  }

  /**
   * Send system alerts
   */
  async notifySystemAlert(userId, title, message, link = null, io = null) {
    return this.createNotification({
      user: userId,
      type: 'system_alert',
      title,
      message,
      metadata: {},
      link,
      icon: 'alert-circle'
    }, io);
  }
}

export default new NotificationService();

