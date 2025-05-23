import { Router } from 'express';
import {
  getAllPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
  scheduleScreening,
  getUserAppointments,
} from '../controllers/screeningController';
import { auth, isAdmin } from '../middleware/auth';

const router = Router();

// Публичные маршруты
router.get('/', getAllPrograms);
router.get('/:id', getProgramById);

// Маршруты, требующие авторизации
router.post('/schedule', auth, scheduleScreening);
router.get('/appointments/:userId', auth, getUserAppointments);

// Маршруты администратора
router.post('/', auth, isAdmin, createProgram);
router.put('/:id', auth, isAdmin, updateProgram);
router.delete('/:id', auth, isAdmin, deleteProgram);

export default router;
