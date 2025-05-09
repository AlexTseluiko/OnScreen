import { Router, Response } from 'express';
import {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} from '../controllers/doctorController';
import { auth, checkRole, AuthRequest } from '../middleware/auth';
import { UserRole } from '../types/user';

const router = Router();

// Создание врача (только для администраторов)
router.post('/', auth, checkRole([UserRole.ADMIN]), (req: AuthRequest, res: Response) =>
  createDoctor(req, res)
);

// Получение списка врачей
router.get('/', auth, (req: AuthRequest, res: Response) => getDoctors(req, res));

// Получение врача по ID
router.get(
  '/:doctorId',
  auth,
  (req: AuthRequest & { params: { doctorId: string } }, res: Response) => getDoctorById(req, res)
);

// Обновление информации о враче
router.put(
  '/:doctorId',
  auth,
  (req: AuthRequest & { params: { doctorId: string } }, res: Response) => updateDoctor(req, res)
);

// Удаление врача (только для администраторов)
router.delete(
  '/:doctorId',
  auth,
  checkRole([UserRole.ADMIN]),
  (req: AuthRequest & { params: { doctorId: string } }, res: Response) => deleteDoctor(req, res)
);

export default router;
