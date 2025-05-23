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
import { auth, isAdmin } from '../middleware/auth';
import { upload } from '../utils/fileUpload';
import { Clinic } from '../models/Clinic';
import { FileRequest } from '../types/request';

const router = Router();

// Получение списка клиник (доступно всем авторизованным пользователям)
router.get('/', auth, getClinics);

// Получение клиники по ID (доступно всем авторизованным пользователям)
router.get('/:id', auth, getClinicById);

// Создание клиники (только для администраторов)
router.post('/', auth, isAdmin, upload.array('photos', 10), createClinic);

// Обновление клиники (только для администраторов)
router.put('/:id', auth, isAdmin, upload.array('photos', 10), updateClinic);

// Удаление клиники (только для администраторов)
router.delete('/:id', auth, isAdmin, deleteClinic);

// Добавление врача в клинику (только для администраторов)
router.post('/:id/doctors', auth, isAdmin, addDoctor);

// Удаление врача из клиники (только для администраторов)
router.delete('/:id/doctors/:doctorId', auth, isAdmin, removeDoctor);

// Удаление фотографии клиники (только для администраторов)
router.delete('/:id/photos/:filename', auth, isAdmin, async (req: FileRequest, res) => {
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
});

export default router;
