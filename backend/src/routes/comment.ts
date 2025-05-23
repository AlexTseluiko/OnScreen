import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
  getArticleComments,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
} from '../controllers/commentController';

const router = Router();

// GET /api/articles/:articleId/comments - получение комментариев к статье
router.get('/articles/:articleId/comments', getArticleComments);

// POST /api/articles/:articleId/comments - создание комментария
router.post('/articles/:articleId/comments', auth, createComment);

// PUT /api/comments/:commentId - обновление комментария
router.put('/comments/:commentId', auth, updateComment);

// DELETE /api/comments/:commentId - удаление комментария
router.delete('/comments/:commentId', auth, deleteComment);

// POST /api/comments/:commentId/like - лайк комментария
router.post('/comments/:commentId/like', auth, likeComment);

export default router;
