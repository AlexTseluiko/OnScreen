import express from 'express';
import {
  getDoctorProfiles,
  getDoctorProfileByUserId,
  createOrUpdateDoctorProfile,
  verifyDoctorProfile,
  deleteDoctorProfile
} from '../controllers/doctorProfileController';
import { authenticate } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';
import { UserRole } from '../types/user';

const router = express.Router();

// GET /api/doctor-profiles - получение всех профилей докторов
router.get('/', getDoctorProfiles);

// GET /api/doctor-profiles/me - получение профиля доктора для текущего пользователя
router.get('/me', authenticate, (req, res) => {
  req.params.userId = req.user.id;
  getDoctorProfileByUserId(req, res);
});

// GET /api/doctor-profiles/:userId - получение профиля доктора по ID пользователя
router.get('/:userId', getDoctorProfileByUserId);

// POST/PUT /api/doctor-profiles/me - создание или обновление профиля текущего доктора
router.post('/me', authenticate, (req, res) => {
  req.params.userId = req.user.id;
  createOrUpdateDoctorProfile(req, res);
});

// POST/PUT /api/doctor-profiles/:userId - создание или обновление профиля доктора
router.post(
  '/:userId?',
  authenticate,
  createOrUpdateDoctorProfile
);

// PUT /api/doctor-profiles/:userId - обновление профиля доктора
router.put(
  '/:userId',
  authenticate,
  createOrUpdateDoctorProfile
);

// PUT /api/doctor-profiles/:userId/verify - верификация профиля доктора
router.put(
  '/:userId/verify',
  authenticate,
  checkRole([UserRole.ADMIN]),
  verifyDoctorProfile
);

// DELETE /api/doctor-profiles/:userId - удаление профиля доктора
router.delete(
  '/:userId',
  authenticate,
  deleteDoctorProfile
);

export default router; 