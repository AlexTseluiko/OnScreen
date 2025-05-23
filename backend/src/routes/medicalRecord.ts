import { Router } from 'express';
import {
  getMedicalRecords,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
} from '../controllers/medicalRecordController';
import { auth, isAdmin } from '../middleware/auth';

const router = Router();

// Получение медицинских записей пациента
router.get('/', auth, getMedicalRecords);

// Создание новой медицинской записи
router.post('/', auth, createMedicalRecord);

// Обновление медицинской записи
router.put('/:recordId', auth, updateMedicalRecord);

// Удаление медицинской записи
router.delete('/:recordId', auth, isAdmin, deleteMedicalRecord);

export default router;
