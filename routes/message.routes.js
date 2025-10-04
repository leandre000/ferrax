import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  getMessages,
  getConversations,
  sendMessage,
  markAsRead
} from '../controllers/message.controllers.js';

const router = express.Router();

// Protect all routes with authentication
router.use(protect);

/**
 * @openapi
 * /api/messages/conversations:
 *   get:
 *     summary: Get all conversations for the current user
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of conversations with last message and unread count
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                   carId:
 *                     type: string
 *                   otherUser:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       fullname:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phone:
 *                         type: string
 *                   car:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       make:
 *                         type: string
 *                       model:
 *                         type: string
 *                       year:
 *                         type: number
 *                       primaryImage:
 *                         type: string
 *                   lastMessage:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       content:
 *                         type: string
 *                       sender:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       read:
 *                         type: boolean
 *                   unreadCount:
 *                     type: number
 */
router.get('/conversations', getConversations);

/**
 * @openapi
 * /api/messages/{carId}/{recipientId}:
 *   get:
 *     summary: Get messages between current user and another user for a specific car
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: carId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: recipientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages between users for the car
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   content:
 *                     type: string
 *                   sender:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       fullname:
 *                         type: string
 *                   recipient:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       fullname:
 *                         type: string
 *                   car:
 *                     type: string
 *                   read:
 *                     type: boolean
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */
router.get('/:carId/:recipientId', getMessages);

/**
 * @openapi
 * /api/messages:
 *   post:
 *     summary: Send a new message
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recipientId, carId, content]
 *             properties:
 *               recipientId:
 *                 type: string
 *               carId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Missing required fields
 */
router.post('/', sendMessage);

/**
 * @openapi
 * /api/messages/mark-read:
 *   post:
 *     summary: Mark messages as read
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [messageIds]
 *             properties:
 *               messageIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Messages marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 */
router.post('/mark-read', markAsRead);

export default router;
