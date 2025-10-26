import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'booking_confirmed',
      'booking_cancelled',
      'booking_expired',
      'order_created',
      'order_confirmed',
      'order_cancelled',
      'order_paid',
      'new_message',
      'car_added_to_wishlist',
      'car_sold',
      'car_reserved',
      'system_alert',
      'admin_approval'
    ]
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  link: {
    type: String
  },
  icon: {
    type: String
  }
}, { timestamps: true });

// Index for faster queries
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ user: 1, type: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;

