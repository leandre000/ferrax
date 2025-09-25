import { Server } from 'socket.io';
import { logger } from '../config/logger.js';
import Message from '../models/message.model.js';

class SocketService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || "https://carhub-rw.vercel.app" || "https://ww.car-connect.rw",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.initializeSocket();
  }

  initializeSocket() {
    this.io.use(async (socket, next) => {
      try {
        // Get token from handshake
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }
        
        // Verify token and get user
        const user = await verifyToken(token);
        if (!user) {
          return next(new Error('Authentication error'));
        }

        // Attach user to socket
        socket.user = user;
        next();
      } catch (error) {
        logger.error({ error }, 'WebSocket authentication error');
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      const userId = socket.user._id.toString();
      
      // Join user's personal room
      socket.join(userId);
      logger.info(`User ${userId} connected to WebSocket`);

      // Handle private messages
      socket.on('privateMessage', async ({ recipientId, carId, content }, callback) => {
        try {
          const message = new Message({
            sender: userId,
            recipient: recipientId,
            car: carId,
            content: content.trim(),
            read: false
          });

          await message.save();

          // Populate sender and recipient details
          const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'fullname')
            .populate('recipient', 'fullname');

          // Emit to recipient
          this.io.to(recipientId).emit('newMessage', {
            message: populatedMessage,
            sender: {
              _id: socket.user._id,
              fullname: socket.user.fullname
            },
            carId: carId
          });

          // Send acknowledgment to sender
          if (callback) {
            callback({
              success: true,
              message: populatedMessage
            });
          }
        } catch (error) {
          logger.error({ error, userId }, 'Error sending private message');
          if (callback) {
            callback({
              success: false,
              error: 'Failed to send message'
            });
          }
        }
      });

      // Handle typing indicator
      socket.on('typing', ({ recipientId, carId }) => {
        socket.to(recipientId).emit('userTyping', {
          userId,
          carId,
          isTyping: true
        });
      });

      // Handle stop typing
      socket.on('stopTyping', ({ recipientId, carId }) => {
        socket.to(recipientId).emit('userTyping', {
          userId,
          carId,
          isTyping: false
        });
      });

      // Handle message read
      socket.on('markAsRead', async ({ messageIds, recipientId }) => {
        try {
          await Message.updateMany(
            {
              _id: { $in: messageIds },
              recipient: userId,
              read: false
            },
            { $set: { read: true } }
          );

          // Notify the sender that messages were read
          socket.to(recipientId).emit('messagesRead', {
            messageIds,
            readerId: userId
          });
        } catch (error) {
          logger.error({ error, userId }, 'Error marking messages as read');
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`User ${userId} disconnected from WebSocket`);
      });
    });
  }

  // Helper method to get the io instance
  getIO() {
    if (!this.io) {
      throw new Error('Socket.io not initialized');
    }
    return this.io;
  }
}

let socketService = null;

export const initializeSocket = (server) => {
  if (!socketService) {
    socketService = new SocketService(server);
  }
  return socketService;
};

export const getSocketService = () => {
  if (!socketService) {
    throw new Error('SocketService not initialized');
  }
  return socketService;
};

// Helper function to verify JWT token
async function verifyToken(token) {
  try {
    // Replace this with your actual token verification logic
    // This is a placeholder - implement according to your auth system
    const jwt = (await import('jsonwebtoken')).default;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    logger.error({ error }, 'Token verification failed');
    return null;
  }
}
