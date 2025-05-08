import { Router } from 'express';
import {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} from '../controllers/doctorController';
import { auth, checkRole } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

// Создание врача (только для администраторов)
router.post('/', auth, checkRole([UserRole.ADMIN]), createDoctor);

// Получение списка врачей
router.get('/', auth, getDoctors);

// Получение врача по ID
router.get('/:doctorId', auth, getDoctorById);

// Обновление информации о враче
router.put('/:doctorId', auth, updateDoctor);

// Удаление врача (только для администраторов)
router.delete('/:doctorId', auth, checkRole([UserRole.ADMIN]), deleteDoctor);

export default router; 