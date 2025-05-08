import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
} from '../controllers/profileController';
import { upload } from '../middleware/upload';
import { auth } from '../middleware/auth';

const router = Router();

// Защищаем все маршруты профиля с помощью middleware auth
router.use(auth);

// Получение профиля пользователя
router.get('/', getProfile);

// Обновление профиля пользователя
router.put('/', updateProfile);

// Загрузка аватара
router.post('/avatar', upload.single('avatar'), uploadAvatar);

export default router; 