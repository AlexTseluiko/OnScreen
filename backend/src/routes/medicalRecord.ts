import { Router } from 'express';
import {
  createMedicalRecord,
  getPatientMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
} from '../controllers/medicalRecordController';
import { auth } from '../middleware/auth';

const router = Router();

// Создание медицинской карты
router.post('/', auth, createMedicalRecord);

// Получение медицинских карт пациента
router.get('/patient/:patientId', auth, getPatientMedicalRecords);

// Получение медицинской карты по ID
router.get('/:recordId', auth, getMedicalRecordById);

// Обновление медицинской карты
router.put('/:recordId', auth, updateMedicalRecord);

// Удаление медицинской карты
router.delete('/:recordId', auth, deleteMedicalRecord);

export default router; 