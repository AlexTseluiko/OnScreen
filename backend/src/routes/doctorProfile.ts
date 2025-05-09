import express, { Request, Response } from 'express';
import {
  getDoctorProfiles,
  getDoctorProfileByUserId,
  createOrUpdateDoctorProfile,
  verifyDoctorProfile,
  deleteDoctorProfile,
} from '../controllers/doctorProfileController';
import { auth, checkRole, AuthRequest } from '../middleware/auth';
import { UserRole } from '../types/user';

const router = express.Router();

// GET /api/doctor-profiles - получение всех профилей докторов
router.get('/', getDoctorProfiles);

// GET /api/doctor-profiles/me - получение профиля доктора для текущего пользователя
router.get('/me', auth, (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  const userId = req.user.id;
  getDoctorProfileByUserId({ ...req, params: { userId } } as Request<{ userId: string }>, res);
});

// GET /api/doctor-profiles/:userId - получение профиля доктора по ID пользователя
router.get('/:userId', getDoctorProfileByUserId);

// POST/PUT /api/doctor-profiles/me - создание или обновление профиля текущего доктора
router.post('/me', auth, (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  const userId = req.user.id;
  createOrUpdateDoctorProfile({ ...req, params: { userId } } as Request<{ userId: string }>, res);
});

// POST/PUT /api/doctor-profiles/:userId - создание или обновление профиля доктора
router.post('/:userId', auth, createOrUpdateDoctorProfile);

// PUT /api/doctor-profiles/:userId - обновление профиля доктора
router.put('/:userId', auth, createOrUpdateDoctorProfile);

// PUT /api/doctor-profiles/:userId/verify - верификация профиля доктора
router.put('/:userId/verify', auth, checkRole([UserRole.ADMIN]), verifyDoctorProfile);

// DELETE /api/doctor-profiles/:userId - удаление профиля доктора
router.delete('/:userId', auth, deleteDoctorProfile);

export default router;
