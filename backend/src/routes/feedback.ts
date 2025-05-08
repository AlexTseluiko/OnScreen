import { Router } from 'express';
import { 
  createFeedback, 
  getAllFeedback, 
  getFeedbackById, 
  markFeedbackAsRead, 
  addAdminNotes 
} from '../controllers/feedbackController';
import { auth, isAdmin } from '../middleware/auth';

const router = Router();

// Публичный маршрут для отправки обратной связи
router.post('/', createFeedback);

// Защищенные маршруты для администраторов
router.get('/', auth, isAdmin, getAllFeedback);
router.get('/:id', auth, isAdmin, getFeedbackById);
router.patch('/:id/read', auth, isAdmin, markFeedbackAsRead);
router.patch('/:id/note', auth, isAdmin, addAdminNotes);

export default router; 