import { Router, Response } from 'express';
import {
  sendMessage,
  getMessageHistory,
  markMessagesAsRead,
  deleteMessage,
} from '../controllers/messageController';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

// Отправка сообщения
router.post('/', auth, (req: AuthRequest, res: Response) => sendMessage(req, res));

// Получение истории сообщений
router.get(
  '/history/:userId',
  auth,
  (req: AuthRequest & { params: { userId: string } }, res: Response) => getMessageHistory(req, res)
);

// Отметка сообщений как прочитанных
router.put(
  '/read/:senderId',
  auth,
  (req: AuthRequest & { params: { senderId: string } }, res: Response) =>
    markMessagesAsRead(req, res)
);

// Удаление сообщения
router.delete(
  '/:messageId',
  auth,
  (req: AuthRequest & { params: { messageId: string } }, res: Response) => deleteMessage(req, res)
);

export default router;
