import { Server } from 'socket.io';
import { logger } from '../config/logger.js';
import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import jwt from 'jsonwebtoken';
import { configDotenv } from 'dotenv';
configDotenv()

class SocketService {
  constructor(server) {
    // Get allowed origins from environment
    const allowedOrigins = (process.env.CLIENT_URLS || "").split(',').map(origin => origin.trim()).filter(origin => origin !== '');

    this.io = new Server(server, {
      path: '/socket.io',
      cors: {
        origin: allowedOrigins.length > 0 ? allowedOrigins : true, // Allow all origins if none specified
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Authorization", "Content-Type"],
        exposedHeaders: ["Authorization"]
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e6, // 1MB
      allowEIO3: true
    });

    this.initializeSocket();
  }

  initializeSocket() {
    // Authentication middleware - supports both cookies and tokens
    this.io.use(async (socket, next) => {
      try {
        let token = null;

        // Try to get token from multiple sources (cookies, auth, query)
        const cookies = socket.handshake.headers.cookie;
        if (cookies) {
          // Parse cookies to find the token
          const cookiePairs = cookies.split(';');
          for (const pair of cookiePairs) {
            const [name, value] = pair.trim().split('=');
            if (name === 'token') {
              token = value;
              break;
            }
          }
        }

        // Fallback to auth or query token
        if (!token) {
          token = socket.handshake.auth?.token || socket.handshake.query?.token;
        }

        if (!token) {
          logger.warn({ socketId: socket.id }, 'WebSocket connection attempt without authentication');
          return next(new Error('Authentication required'));
        }

        // Verify JWT token
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          logger.error('JWT_SECRET not configured');
          return next(new Error('Server configuration error'));
        }

        const decoded = jwt.verify(token, secret);
        if (!decoded?.id) {
          logger.warn({ socketId: socket.id }, 'Invalid token payload');
          return next(new Error('Invalid token'));
        }

        // Load user document
        const userDoc = await User.findById(decoded.id).select('_id fullname email role');
        if (!userDoc) {
          logger.warn({ socketId: socket.id, userId: decoded.id }, 'User not found for WebSocket connection');
          return next(new Error('User not found'));
        }

        // Attach user info to socket
        socket.user = {
          _id: userDoc._id,
          fullname: userDoc.fullname,
          email: userDoc.email,
          role: userDoc.role
        };

        logger.info({ socketId: socket.id, userId: userDoc._id }, 'WebSocket authentication successful');
        next();
      } catch (error) {
        if (error.name === 'JsonWebTokenError') {
          logger.warn({ socketId: socket.id, error: error.message }, 'Invalid JWT token');
          return next(new Error('Invalid token'));
        } else if (error.name === 'TokenExpiredError') {
          logger.warn({ socketId: socket.id }, 'Expired JWT token');
          return next(new Error('Token expired'));
        } else {
          logger.error({ socketId: socket.id, error }, 'WebSocket authentication error');
          return next(new Error('Authentication failed'));
        }
      }
    });

    this.io.on('connection', (socket) => {
      const userId = socket.user._id.toString();
      const userFullname = socket.user.fullname;

      // Join user's personal room
      socket.join(userId);
      logger.info({ socketId: socket.id, userId, userFullname }, 'User connected to WebSocket');

      // Send connection confirmation
      socket.emit('connected', {
        success: true,
        message: 'Connected to WebSocket',
        user: {
          _id: socket.user._id,
          fullname: socket.user.fullname,
          email: socket.user.email
        }
      });

      // Handle private messages with validation
      socket.on('privateMessage', async ({ recipientId, carId, content }, callback) => {
        try {
          // Validate input
          if (!recipientId || !carId || !content) {
            const error = 'Missing required fields: recipientId, carId, content';
            logger.warn({ userId, error }, 'Invalid message data');
            if (callback) {
              callback({ success: false, error });
            }
            return;
          }

          // Validate content length
          if (content.trim().length === 0) {
            const error = 'Message content cannot be empty';
            logger.warn({ userId }, error);
            if (callback) {
              callback({ success: false, error });
            }
            return;
          }

          if (content.length > 1000) {
            const error = 'Message too long (max 1000 characters)';
            logger.warn({ userId, contentLength: content.length }, error);
            if (callback) {
              callback({ success: false, error });
            }
            return;
          }

          // Check if recipient exists
          const recipient = await User.findById(recipientId).select('_id fullname');
          if (!recipient) {
            const error = 'Recipient not found';
            logger.warn({ userId, recipientId }, error);
            if (callback) {
              callback({ success: false, error });
            }
            return;
          }

          // Create message
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
            .populate('sender', 'fullname email')
            .populate('recipient', 'fullname email');

          // Emit to recipient
          this.io.to(recipientId).emit('newMessage', {
            message: populatedMessage,
            sender: {
              _id: socket.user._id,
              fullname: socket.user.fullname,
              email: socket.user.email
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

          logger.info({ userId, recipientId, carId, messageId: message._id }, 'Message sent successfully');
        } catch (error) {
          logger.error({ error, userId, recipientId, carId }, 'Error sending private message');
          if (callback) {
            callback({
              success: false,
              error: 'Failed to send message'
            });
          }
        }
      });

      // Handle typing indicator with validation
      socket.on('typing', ({ recipientId, carId }) => {
        if (!recipientId || !carId) {
          logger.warn({ userId }, 'Invalid typing indicator data');
          return;
        }

        socket.to(recipientId).emit('userTyping', {
          userId,
          carId,
          isTyping: true,
          sender: {
            _id: socket.user._id,
            fullname: socket.user.fullname
          }
        });
      });

      // Handle stop typing with validation
      socket.on('stopTyping', ({ recipientId, carId }) => {
        if (!recipientId || !carId) {
          logger.warn({ userId }, 'Invalid stop typing data');
          return;
        }

        socket.to(recipientId).emit('userTyping', {
          userId,
          carId,
          isTyping: false,
          sender: {
            _id: socket.user._id,
            fullname: socket.user.fullname
          }
        });
      });

      // Handle message read with validation
      socket.on('markAsRead', async ({ messageIds, recipientId }, callback) => {
        try {
          if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
            const error = 'messageIds must be a non-empty array';
            logger.warn({ userId }, error);
            if (callback) {
              callback({ success: false, error });
            }
            return;
          }

          if (!recipientId) {
            const error = 'recipientId is required';
            logger.warn({ userId }, error);
            if (callback) {
              callback({ success: false, error });
            }
            return;
          }

          const result = await Message.updateMany(
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
            readerId: userId,
            readCount: result.modifiedCount
          });

          if (callback) {
            callback({
              success: true,
              readCount: result.modifiedCount
            });
          }

          logger.info({ userId, recipientId, messageIds, readCount: result.modifiedCount }, 'Messages marked as read');
        } catch (error) {
          logger.error({ error, userId, messageIds, recipientId }, 'Error marking messages as read');
          if (callback) {
            callback({ success: false, error: 'Failed to mark messages as read' });
          }
        }
      });

      // Handle join room (for specific car conversations)
      socket.on('joinCarRoom', ({ carId }) => {
        if (!carId) {
          logger.warn({ userId }, 'Invalid carId for room join');
          return;
        }

        const roomName = `car-${carId}`;
        socket.join(roomName);
        logger.info({ userId, carId, roomName }, 'User joined car room');

        socket.emit('joinedRoom', {
          success: true,
          room: roomName,
          carId
        });
      });

      // Handle leave room
      socket.on('leaveCarRoom', ({ carId }) => {
        if (!carId) {
          logger.warn({ userId }, 'Invalid carId for room leave');
          return;
        }

        const roomName = `car-${carId}`;
        socket.leave(roomName);
        logger.info({ userId, carId, roomName }, 'User left car room');

        socket.emit('leftRoom', {
          success: true,
          room: roomName,
          carId
        });
      });

      // Handle ping/pong for connection health
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: Date.now() });
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        logger.info({ userId, socketId: socket.id, reason }, 'User disconnected from WebSocket');

        // Leave all rooms
        socket.rooms.forEach(room => {
          if (room !== socket.id) {
            socket.leave(room);
          }
        });
      });

      // Handle connection errors
      socket.on('error', (error) => {
        logger.error({ userId, socketId: socket.id, error }, 'WebSocket connection error');
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

  // Broadcast message to all users in a car room
  broadcastToCarRoom(carId, event, data) {
    const roomName = `car-${carId}`;
    this.io.to(roomName).emit(event, data);
    logger.info({ carId, roomName, event }, 'Broadcasted to car room');
  }

  // Send notification to specific user
  sendNotificationToUser(userId, event, data) {
    this.io.to(userId).emit(event, data);
    logger.info({ userId, event }, 'Notification sent to user');
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.io.engine.clientsCount;
  }

  // Get user's socket rooms
  getUserRooms(userId) {
    const userSockets = this.io.sockets.adapter.rooms.get(userId);
    return userSockets ? Array.from(userSockets) : [];
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
