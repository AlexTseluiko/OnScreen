import { Router } from 'express';
import {
  createAppointment,
  getUserAppointments,
  updateAppointmentStatus,
  cancelAppointment,
} from '../controllers/appointmentController';
import { auth } from '../middleware/auth';

const router = Router();

// Создание записи
router.post('/', auth, createAppointment);

// Получение записей пользователя
router.get('/', auth, getUserAppointments);

// Обновление статуса записи
router.put('/:appointmentId/status', auth, updateAppointmentStatus);

// Отмена записи
router.put('/:appointmentId/cancel', auth, cancelAppointment);

export default router; 