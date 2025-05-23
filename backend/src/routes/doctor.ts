import { Router, Response } from 'express';
import {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} from '../controllers/doctorController';
import { auth, isAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

interface DoctorParams {
  doctorId: string;
}

// Создание врача (только для администраторов)
router.post('/', auth, isAdmin, createDoctor);

// Получение списка врачей
router.get('/', auth, getDoctors);

// Получение врача по ID
router.get('/:doctorId', auth, getDoctorById);

// Обновление информации о враче
router.put('/:doctorId', auth, updateDoctor);

// Удаление врача (только для администраторов)
router.delete('/:doctorId', auth, isAdmin, deleteDoctor);

export default router;
