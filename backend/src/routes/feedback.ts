import { Router, Request, Response } from 'express';
import {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  markFeedbackAsRead,
  addAdminNotes,
} from '../controllers/feedbackController';
import { auth, isAdmin, AuthRequest } from '../middleware/auth';
import { UserRole } from '../types/user';

const router = Router();

// Публичный маршрут для отправки обратной связи
router.post('/', (req: Request, res: Response) => createFeedback(req, res));

// Защищенные маршруты для администраторов
router.get('/', auth, isAdmin, getAllFeedback);

router.get('/:id', auth, isAdmin, getFeedbackById);

router.patch('/:id/read', auth, isAdmin, markFeedbackAsRead);

router.patch('/:id/note', auth, isAdmin, addAdminNotes);

export default router;
