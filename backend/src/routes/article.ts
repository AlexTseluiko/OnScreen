import { Router } from 'express';
import { articleController } from '../controllers/articleController';
import { auth } from '../middleware/auth';

const router = Router();

// Публичные маршруты
router.get('/', articleController.getArticles);
router.get('/categories', articleController.getCategories);
router.get('/:id', articleController.getArticleById);

// Защищенные маршруты
router.post('/', auth, (req, res) => articleController.createArticle(req, res));
router.put('/:id', auth, (req, res) => articleController.updateArticle(req, res));
router.delete('/:id', auth, (req, res) => articleController.deleteArticle(req, res));

export default router;
