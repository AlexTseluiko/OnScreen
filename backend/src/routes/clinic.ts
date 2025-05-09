import { Router } from 'express';
import {
  createClinic,
  getClinics,
  getClinicById,
  updateClinic,
  deleteClinic,
  addDoctor,
  removeDoctor,
} from '../controllers/clinicController';
import { checkRole } from '../middleware/auth';
import { UserRole } from '../types/user';
import { upload } from '../utils/fileUpload';
import { Clinic } from '../models/Clinic';
import { FileRequest } from '../types/request';

const router = Router();

// Получение списка клиник (доступно всем авторизованным пользователям)
router.get('/', (req: FileRequest, res) => getClinics(req, res));

// Получение клиники по ID (доступно всем авторизованным пользователям)
router.get('/:id', (req: FileRequest, res) => getClinicById(req, res));

// Временный маршрут для отладки данных
router.post('/debug', (req: FileRequest, res) => {
  console.log('DEBUG: Получены данные для создания клиники');
  console.log('DEBUG: req.body', JSON.stringify(req.body, null, 2));
  console.log('DEBUG: req.files', req.files);
  return res.status(200).json({ message: 'Данные получены и залогированы' });
});

// Создание клиники (только для администраторов)
router.post('/', checkRole([UserRole.ADMIN]), upload.array('photos', 10), (req: FileRequest, res) =>
  createClinic(req, res)
);

// Обновление клиники (для администраторов и врачей клиники)
router.put(
  '/:id',
  checkRole([UserRole.ADMIN]),
  upload.array('photos', 10),
  (req: FileRequest, res) => updateClinic(req, res)
);

// Удаление клиники (только для администраторов)
router.delete('/:id', checkRole([UserRole.ADMIN]), (req: FileRequest, res) =>
  deleteClinic(req, res)
);

// Добавление врача в клинику (только для администраторов)
router.post('/:id/doctors', checkRole([UserRole.ADMIN]), (req: FileRequest, res) =>
  addDoctor(req, res)
);

// Удаление врача из клиники (только для администраторов)
router.delete('/:id/doctors/:doctorId', checkRole([UserRole.ADMIN]), (req: FileRequest, res) =>
  removeDoctor(req, res)
);

// Удаление фотографии клиники (только для администраторов)
router.delete(
  '/:id/photos/:filename',
  checkRole([UserRole.ADMIN]),
  async (req: FileRequest, res) => {
    try {
      const { id, filename } = req.params;
      const clinic = await Clinic.findById(id);

      if (!clinic) {
        return res.status(404).json({ message: 'Клиника не найдена' });
      }

      // Удаляем фото из массива photos
      clinic.photos = clinic.photos.filter(photo => photo !== filename);
      await clinic.save();

      res.status(200).json({ message: 'Фотография успешно удалена' });
    } catch (error) {
      console.error('Error deleting photo:', error);
      res.status(500).json({ message: 'Ошибка при удалении фотографии' });
    }
  }
);

export default router;
