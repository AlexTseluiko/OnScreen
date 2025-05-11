import express from 'express';
import {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
  verifyToken,
} from '../controllers/authController';
import { auth } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// Регистрация
router.post('/register', register);

// Вход
router.post('/login', login);

// Подтверждение email
router.post('/verify-email', verifyEmail);

// Запрос на сброс пароля
router.post('/forgot-password', forgotPassword);

// Сброс пароля
router.post('/reset-password', resetPassword);

// Смена пароля (требует авторизации)
router.post('/change-password', auth, changePassword);

// Обновление токена
router.post('/refresh', refreshToken);

// Проверка валидности токена
router.get('/verify', auth, verifyToken);

export default router;
