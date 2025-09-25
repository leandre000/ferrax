import Message from '../models/message.model.js';
import { logger } from '../config/logger.js';

export const getMessages = async (req, res) => {
  try {
    const { carId, recipientId } = req.params;
    const userId = req.user._id;

    const messages = await Message.find({
      car: carId,
      $or: [
        { sender: userId, recipient: recipientId },
        { sender: recipientId, recipient: userId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'fullname')
    .populate('recipient', 'fullname');

    // Mark messages as read
    await Message.updateMany(
      { 
        car: carId,
        recipient: userId,
        sender: recipientId,
        read: false 
      },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching messages');
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { recipient: userId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userId] },
              { otherUser: '$recipient', car: '$car' },
              { otherUser: '$sender', car: '$car' }
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$recipient', userId] }, { $eq: ['$read', false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id.otherUser',
          foreignField: '_id',
          as: 'otherUser'
        }
      },
      {
        $lookup: {
          from: 'cars',
          localField: '_id.car',
          foreignField: '_id',
          as: 'car'
        }
      },
      {
        $unwind: '$otherUser'
      },
      {
        $unwind: '$car'
      },
      {
        $project: {
          _id: 0,
          userId: '$_id.otherUser',
          carId: '$_id.car',
          otherUser: {
            _id: '$otherUser._id',
            fullname: '$otherUser.fullname',
            email: '$otherUser.email',
            phone: '$otherUser.phone'
          },
          car: {
            _id: '$car._id',
            make: '$car.make',
            model: '$car.model',
            year: '$car.year',
            primaryImage: '$car.primaryImage'
          },
          lastMessage: {
            _id: '$lastMessage._id',
            content: '$lastMessage.content',
            sender: '$lastMessage.sender',
            createdAt: '$lastMessage.createdAt',
            read: '$lastMessage.read'
          },
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.json(conversations);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching conversations');
    res.status(500).json({ message: 'Error fetching conversations' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { recipientId, carId, content } = req.body;
    const senderId = req.user._id;

    // Validate input
    if (!recipientId || !carId || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      car: carId,
      content: content.trim()
    });

    await message.save();

    // Populate sender and recipient details for the response
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'fullname')
      .populate('recipient', 'fullname');

    // Emit the message to the recipient
    req.app.get('io').to(recipientId.toString()).emit('newMessage', {
      message: populatedMessage,
      sender: {
        _id: req.user._id,
        fullname: req.user.fullname
      },
      carId: carId
    });

    res.status(201).json(populatedMessage);
  } catch (error) {
    logger.error({ err: error }, 'Error sending message');
    res.status(500).json({ message: 'Error sending message' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user._id;

    await Message.updateMany(
      {
        _id: { $in: messageIds },
        recipient: userId,
        read: false
      },
      { $set: { read: true } }
    );

    res.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Error marking messages as read');
    res.status(500).json({ message: 'Error marking messages as read' });
  }
};
