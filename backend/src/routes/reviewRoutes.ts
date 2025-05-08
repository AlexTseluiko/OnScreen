import express from 'express';
import { 
  createReview, 
  likeReview, 
  getClinicReviews, 
  deleteReview 
} from '../controllers/reviewController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authenticate, createReview);
router.post('/:reviewId/like', authenticate, likeReview);
router.get('/clinic/:clinicId', getClinicReviews);
router.delete('/:reviewId', authenticate, deleteReview);

export default router; 