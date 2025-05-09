import { Router, Response } from 'express';
import {
  createAppointment,
  getUserAppointments,
  updateAppointmentStatus,
  cancelAppointment,
} from '../controllers/appointmentController';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

// Создание записи
router.post('/', auth, (req: AuthRequest, res: Response) => createAppointment(req, res));

// Получение записей пользователя
router.get('/', auth, (req: AuthRequest, res: Response) => getUserAppointments(req, res));

// Обновление статуса записи
router.put(
  '/:appointmentId/status',
  auth,
  (req: AuthRequest & { params: { appointmentId: string } }, res: Response) =>
    updateAppointmentStatus(req, res)
);

// Отмена записи
router.put(
  '/:appointmentId/cancel',
  auth,
  (req: AuthRequest & { params: { appointmentId: string } }, res: Response) =>
    cancelAppointment(req, res)
);

export default router;
