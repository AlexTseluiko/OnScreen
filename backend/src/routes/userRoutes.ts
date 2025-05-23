import { Router } from 'express';
import { auth, isAdmin } from '../middleware/auth';
import {
  getUsers,
  requestDoctorRole,
  getDoctorRequestStatus,
  changePassword,
} from '../controllers/userController';

const router = Router();

// Получение списка пользователей (только для администраторов)
router.get('/', auth, isAdmin, getUsers);

// Маршрут для запроса на получение роли доктора
router.post('/request-doctor-role', auth, requestDoctorRole);

// Получение статуса запроса пользователя
router.get('/doctor-request-status', auth, getDoctorRequestStatus);

// Маршрут для смены пароля пользователя
router.put('/password', auth, changePassword);

export default router;
