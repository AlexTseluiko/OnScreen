import { Router, Request, Response } from 'express';
import {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  markFeedbackAsRead,
  addAdminNotes,
} from '../controllers/feedbackController';
import { auth, checkRole, AuthRequest } from '../middleware/auth';
import { UserRole } from '../types/user';

const router = Router();

// Публичный маршрут для отправки обратной связи
router.post('/', (req: Request, res: Response) => createFeedback(req, res));

// Защищенные маршруты для администраторов
router.get('/', auth, checkRole([UserRole.ADMIN]), (req: AuthRequest, res: Response) =>
  getAllFeedback(req, res)
);
router.get(
  '/:id',
  auth,
  checkRole([UserRole.ADMIN]),
  (req: AuthRequest & { params: { id: string } }, res: Response) => getFeedbackById(req, res)
);
router.patch(
  '/:id/read',
  auth,
  checkRole([UserRole.ADMIN]),
  (req: AuthRequest & { params: { id: string } }, res: Response) => markFeedbackAsRead(req, res)
);
router.patch(
  '/:id/note',
  auth,
  checkRole([UserRole.ADMIN]),
  (req: AuthRequest & { params: { id: string } }, res: Response) => addAdminNotes(req, res)
);

export default router;
