import { Router, Response } from 'express';
import { getProfile, updateProfile, uploadAvatar } from '../controllers/profileController';
import { upload } from '../middleware/upload';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

// Защищаем все маршруты профиля с помощью middleware auth
router.use(auth);

// Получение профиля пользователя
router.get('/', (req: AuthRequest, res: Response) => getProfile(req, res));

// Обновление профиля пользователя
router.put('/', (req: AuthRequest, res: Response) => updateProfile(req, res));

// Загрузка аватара
router.post('/avatar', upload.single('avatar'), (req: AuthRequest, res: Response) =>
  uploadAvatar(req, res)
);

export default router;
