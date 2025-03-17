import { Router } from 'express';
import { createChatController, getUserChatsController } from '../controllers/chatController';
import { getMessagesByChatIdController, getMessagesByUserIdController } from '../controllers/messageController';
import asyncWrapper from '../middleware/asyncWrapper';
import { authenticateUser } from '../middleware/authMiddleware';

const router = Router();

router.post('/createChat/:userId', authenticateUser, asyncWrapper(createChatController));
router.get('/user-chats', authenticateUser, asyncWrapper(getUserChatsController));
router.get('/:chatId/messages', authenticateUser, asyncWrapper(getMessagesByChatIdController));
router.get('/user/:userId/messages', authenticateUser, asyncWrapper(getMessagesByUserIdController));

export default router;
