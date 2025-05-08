import { Router } from 'express';
import {
  sendMessage,
  getMessageHistory,
  markMessagesAsRead,
  deleteMessage,
} from '../controllers/messageController';
import { auth } from '../middleware/auth';

const router = Router();

// Отправка сообщения
router.post('/', auth, sendMessage);

// Получение истории сообщений
router.get('/history/:userId', auth, getMessageHistory);

// Отметка сообщений как прочитанных
router.put('/read/:senderId', auth, markMessagesAsRead);

// Удаление сообщения
router.delete('/:messageId', auth, deleteMessage);

export default router; 