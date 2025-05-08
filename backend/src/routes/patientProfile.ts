import express from 'express';
import {
  getPatientProfileByUserId,
  createOrUpdatePatientProfile,
  deletePatientProfile
} from '../controllers/patientProfileController';
import { authenticate } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';
import { UserRole } from '../types/user';

const router = express.Router();

// GET /api/patient-profiles/me - получение профиля пациента для текущего пользователя
router.get('/me', authenticate, (req, res) => {
  req.params.userId = req.user.id;
  getPatientProfileByUserId(req, res);
});

// GET /api/patient-profiles/:userId - получение профиля пациента по ID пользователя
router.get('/:userId', getPatientProfileByUserId);

// POST/PUT /api/patient-profiles/me - создание или обновление профиля текущего пациента
router.post('/me', authenticate, (req, res) => {
  req.params.userId = req.user.id;
  createOrUpdatePatientProfile(req, res);
});

// POST/PUT /api/patient-profiles/:userId - создание или обновление профиля пациента
router.post(
  '/:userId?',
  authenticate,
  createOrUpdatePatientProfile
);

// PUT /api/patient-profiles/:userId - обновление профиля пациента (синоним для POST)
router.put(
  '/:userId',
  authenticate,
  createOrUpdatePatientProfile
);

// DELETE /api/patient-profiles/:userId - удаление профиля пациента
router.delete(
  '/:userId',
  authenticate,
  deletePatientProfile
);

export default router; 