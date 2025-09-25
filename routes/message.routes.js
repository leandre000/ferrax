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

// Get all conversations for the current user
router.get('/conversations', getConversations);

// Get messages between current user and another user for a specific car
router.get('/:carId/:recipientId', getMessages);

// Send a new message
router.post('/', sendMessage);

// Mark messages as read
router.post('/mark-read', markAsRead);

export default router;
