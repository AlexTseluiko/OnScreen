import { Router, Request, Response } from 'express';
import {
  createMedicalRecord,
  getPatientMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
} from '../controllers/medicalRecordController';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

// Создание медицинской карты
router.post('/', auth, (req: AuthRequest, res: Response) => createMedicalRecord(req, res));

// Получение медицинских карт пациента
router.get(
  '/patient/:patientId',
  auth,
  (req: AuthRequest & { params: { patientId: string } }, res: Response) =>
    getPatientMedicalRecords(req, res)
);

// Получение медицинской карты по ID
router.get(
  '/:recordId',
  auth,
  (req: AuthRequest & { params: { recordId: string } }, res: Response) =>
    getMedicalRecordById(req, res)
);

// Обновление медицинской карты
router.put(
  '/:recordId',
  auth,
  (req: AuthRequest & { params: { recordId: string } }, res: Response) =>
    updateMedicalRecord(req, res)
);

// Удаление медицинской карты
router.delete(
  '/:recordId',
  auth,
  (req: AuthRequest & { params: { recordId: string } }, res: Response) =>
    deleteMedicalRecord(req, res)
);

export default router;
