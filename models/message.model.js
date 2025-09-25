import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  }
}, { timestamps: true });

// Create a compound index for faster querying of conversations
messageSchema.index({ sender: 1, recipient: 1, car: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
