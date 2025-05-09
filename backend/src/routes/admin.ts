import { Router, Request, Response, NextFunction } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import { Clinic } from '../models/Clinic';
import { Review } from '../models/Review';
import { User } from '../models/User';
import { checkRole } from '../middleware/auth';
import { UserRole } from '../types/user';
import { Notification } from '../models/Notification';
import SocketManager from '../utils/socket';
import mongoose from 'mongoose';
import * as adminController from '../controllers/adminController';
import { DoctorRequest } from '../models/DoctorRequest';
import { NotificationType } from '../types/notification';

const router = Router();
let socketManager: SocketManager | null = null;

// Функция для получения экземпляра SocketManager
const getSocketManager = () => {
  if (!socketManager) {
    const server = global.server;
    if (server) {
      socketManager = new SocketManager(server);
    }
  }
  return socketManager;
};

// Middleware для проверки прав администратора
const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('isAdmin: Проверка прав администратора для пользователя ID:', req.user?.id);
    const user = await User.findById(req.user?.id);
    console.log(
      'isAdmin: Найденный пользователь:',
      user ? { id: user._id, role: user.role } : 'не найден'
    );

    if (!user || user.role !== UserRole.ADMIN) {
      console.log('isAdmin: Доступ запрещен - не администратор');
      return res.status(403).json({ error: 'Доступ запрещен' });
    }
    console.log('isAdmin: Доступ разрешен - пользователь является администратором');
    next();
  } catch (error) {
    console.error('isAdmin: Ошибка при проверке прав:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Валидатор для проверки ID пользователя
const validateUserId = (req: Request<{ userId: string }>, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Некорректный ID пользователя' });
  }

  next();
};

// Валидатор для проверки роли
const validateRole = (
  req: Request<{ userId: string }, unknown, { role: UserRole }>,
  res: Response,
  next: NextFunction
) => {
  const { role } = req.body;

  if (!role || !Object.values(UserRole).includes(role)) {
    return res.status(400).json({ error: 'Некорректная роль пользователя' });
  }

  next();
};

// Получение статистики
router.get('/stats', isAdmin, adminController.getStats);

// Тестовый маршрут без проверки роли
router.get('/test-stats', auth, async (req: AuthRequest, res: Response) => {
  try {
    const totalClinics = await Clinic.countDocuments();
    const totalReviews = await Review.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalNotifications = await Notification.countDocuments();

    res.json({
      totalClinics,
      totalReviews,
      totalUsers,
      totalNotifications,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Ошибка при получении статистики' });
  }
});

// Управление клиниками
router.get(
  '/clinics',
  auth,
  checkRole([UserRole.ADMIN]),
  async (req: AuthRequest, res: Response) => {
    try {
      const clinics = await Clinic.find();
      res.json(clinics);
    } catch (error) {
      console.error('Get clinics error:', error);
      res.status(500).json({ error: 'Ошибка при получении списка клиник' });
    }
  }
);

// Получение всех отзывов для админ-панели
router.get('/reviews', async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('clinic', 'name');

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Ошибка при получении отзывов' });
  }
});

// Маршруты для управления пользователями
router.get('/users', isAdmin, adminController.getUsers);
router.get('/users/:userId', isAdmin, validateUserId, adminController.getUserDetails);
router.put(
  '/users/:userId/role',
  isAdmin,
  validateUserId,
  validateRole,
  adminController.updateUserRole
);
router.put('/users/:userId/status', isAdmin, validateUserId, adminController.toggleUserStatus);
router.delete('/users/:userId', isAdmin, validateUserId, adminController.deleteUser);

// Удаление отзыва
router.delete('/reviews/:reviewId', async (req: Request<{ reviewId: string }>, res: Response) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByIdAndDelete(reviewId);

    if (!review) {
      return res.status(404).json({ error: 'Отзыв не найден' });
    }

    res.json({ message: 'Отзыв успешно удален' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Ошибка при удалении отзыва' });
  }
});

// Удаление клиники
router.delete(
  '/clinics/:id',
  auth,
  checkRole([UserRole.ADMIN]),
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      await Clinic.findByIdAndDelete(req.params.id);
      res.json({ message: 'Клиника успешно удалена' });
    } catch (error) {
      console.error('Delete clinic error:', error);
      res.status(500).json({ error: 'Ошибка при удалении клиники' });
    }
  }
);

// Получение всех уведомлений для админ-панели
router.get('/notifications', async (req: Request, res: Response) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Ошибка при получении уведомлений' });
  }
});

// Отправка массовых уведомлений
router.post('/notifications/broadcast', isAdmin, adminController.sendBroadcastNotification);

// Пометка уведомления как прочитанного
router.patch(
  '/notifications/:notificationId/read',
  async (req: Request<{ notificationId: string }>, res: Response) => {
    try {
      const { notificationId } = req.params;

      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ error: 'Уведомление не найдено' });
      }

      res.json(notification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Ошибка при обновлении уведомления' });
    }
  }
);

// Получение всех запросов на роль доктора
router.get('/doctor-requests', isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const requests = await DoctorRequest.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Ошибка при получении запросов на роль доктора:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Подтверждение или отклонение запроса на роль доктора
router.put(
  '/doctor-requests/:requestId',
  isAdmin,
  async (req: Request<{ requestId: string }, unknown, { approved: boolean }>, res: Response) => {
    try {
      const { requestId } = req.params;
      const { approved } = req.body;

      const doctorRequest = await DoctorRequest.findById(requestId).populate('user');

      if (!doctorRequest) {
        return res.status(404).json({ error: 'Запрос не найден' });
      }

      // Обновляем статус запроса
      doctorRequest.status = approved ? 'approved' : 'rejected';
      doctorRequest.processedAt = new Date();
      await doctorRequest.save();

      // Если запрос одобрен, меняем роль пользователя на доктора
      if (approved && doctorRequest.user) {
        const user = await User.findById(doctorRequest.user._id);

        if (user) {
          user.role = UserRole.DOCTOR;
          await user.save();

          // Отправляем уведомление пользователю
          const notification = new Notification({
            user: user._id,
            type: NotificationType.SYSTEM,
            title: 'Запрос одобрен',
            message:
              'Ваш запрос на получение роли доктора был одобрен. Теперь вы можете использовать функционал доктора.',
          });

          await notification.save();

          // Уведомляем пользователя через веб-сокет, если он онлайн
          const socketManager = getSocketManager();
          if (socketManager) {
            socketManager.sendNotification(user._id.toString(), {
              type: NotificationType.SYSTEM,
              title: 'Запрос одобрен',
              message: 'Ваш запрос на получение роли доктора был одобрен.',
            });
          }
        }
      }

      res.json({ message: 'Запрос успешно обработан' });
    } catch (error) {
      console.error('Ошибка при обработке запроса на роль доктора:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
);

export default router;
