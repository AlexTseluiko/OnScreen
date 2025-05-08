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
import { UserRole } from '../models/User';
import { upload } from '../utils/fileUpload';
import { Clinic } from '../models/Clinic';

const router = Router();

// Получение списка клиник (доступно всем авторизованным пользователям)
router.get('/', getClinics);

// Получение клиники по ID (доступно всем авторизованным пользователям)
router.get('/:clinicId', getClinicById);

// Временный маршрут для отладки данных
router.post('/debug', (req, res) => {
  console.log('DEBUG: Получены данные для создания клиники');
  console.log('DEBUG: req.body', JSON.stringify(req.body, null, 2));
  console.log('DEBUG: req.files', req.files);
  return res.status(200).json({ message: 'Данные получены и залогированы' });
});

// Создание клиники (только для администраторов)
router.post(
  '/',
  // Временно убираем проверку роли для отладки
  // checkRole([UserRole.ADMIN]),
  (req, res, next) => {
    // Промежуточный обработчик для логирования запроса
    console.log('Получен запрос на создание клиники');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    // Проверяем наличие пользователя
    console.log('User в запросе:', req.user ? 'Присутствует' : 'Отсутствует');
    if (req.user) {
      console.log('User ID:', req.user._id);
      console.log('User role:', req.user.role);
    }
    next();
  },
  upload.array('photos', 5),
  createClinic
);

// Обновление клиники (для администраторов и врачей клиники)
router.put(
  '/:clinicId',
  // Временно убираем проверку роли для отладки
  // checkRole([UserRole.ADMIN, UserRole.DOCTOR]),
  upload.array('photos', 5),
  updateClinic
);

// Удаление клиники (только для администраторов)
router.delete(
  '/:clinicId',
  // Временно убираем проверку роли для отладки
  // checkRole([UserRole.ADMIN]),
  deleteClinic
);

// Добавление врача в клинику (только для администраторов)
router.post(
  '/:clinicId/doctors',
  checkRole([UserRole.ADMIN]),
  addDoctor
);

// Удаление врача из клиники (только для администраторов)
router.delete(
  '/:clinicId/doctors',
  checkRole([UserRole.ADMIN]),
  removeDoctor
);

// Удаление фотографии клиники (только для администраторов)
router.delete(
  '/:clinicId/photos/:filename',
  // Временно убираем проверку роли для отладки
  // checkRole([UserRole.ADMIN]),
  async (req, res) => {
    try {
      const { clinicId, filename } = req.params;
      
      // Находим клинику
      const clinic = await Clinic.findById(clinicId);
      
      if (!clinic) {
        return res.status(404).json({ error: 'Клиника не найдена' });
      }
      
      // Проверяем наличие фотографии
      if (!clinic.photos.includes(filename)) {
        return res.status(404).json({ error: 'Фотография не найдена' });
      }
      
      // Удаляем фотографию из массива
      clinic.photos = clinic.photos.filter(photo => photo !== filename);
      
      // Сохраняем изменения
      await clinic.save();
      
      // TODO: В продакшене здесь также нужно удалить файл с диска
      
      res.status(200).json({ message: 'Фотография успешно удалена' });
    } catch (error) {
      console.error('Ошибка при удалении фотографии:', error);
      res.status(500).json({ error: 'Ошибка при удалении фотографии' });
    }
  }
);

export default router; 