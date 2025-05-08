import { Router } from 'express';
import {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  logout,
  changePassword,
  refreshToken
} from '../controllers/authController';
import { auth } from '../middleware/auth';

const router = Router();

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
router.post('/refresh-token', refreshToken);

// Маршрут для проверки валидности токена
router.get('/verify', auth, (req, res) => {
  res.status(200).json({ message: 'Token is valid', user: req.user });
});

export default router; 