import { Response } from 'express';
import { User } from '../models/User';
import { UserRole } from '../types/user';
import { Clinic } from '../models/Clinic';
import { Review } from '../models/Review';
import { Notification } from '../models/Notification';
import { Appointment } from '../models/Appointment';
import { MedicalRecord } from '../models/MedicalRecord';
import { AuthRequest } from '../middleware/auth';
import { Types } from 'mongoose';
import { Article } from '../models/Article';

interface UserDocument {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

// Получение статистики для админ-панели
export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    console.log('adminController.getStats: Получение статистики');

    const totalUsers = await User.countDocuments();
    const doctors = await User.countDocuments({ role: UserRole.DOCTOR });
    const patients = await User.countDocuments({ role: UserRole.PATIENT });
    const admins = await User.countDocuments({ role: UserRole.ADMIN });
    const clinics = await Clinic.countDocuments();
    const appointments = await Appointment.countDocuments();
    const medicalRecords = await MedicalRecord.countDocuments();
    const pendingReviews = await Review.countDocuments({ isApproved: false });

    console.log('adminController.getStats: Статистика собрана', {
      totalUsers,
      doctors,
      patients,
      admins,
      clinics,
      appointments,
      medicalRecords,
      pendingReviews,
    });

    res.status(200).json({
      totalUsers,
      usersByRole: {
        doctors,
        patients,
        admins,
      },
      clinics,
      appointments,
      medicalRecords,
      pendingReviews,
    });
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({ message: 'Не удалось получить статистику' });
  }
};

// Получение списка пользователей с пагинацией и фильтрацией
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const role = req.query.role as string;
    const search = req.query.search as string;

    console.log('adminController.getUsers: Запрос с параметрами:', { page, limit, role, search });

    // Формируем фильтры
    const filter: Record<string, unknown> = {};

    // Добавляем фильтр по роли, если указан
    if (role) {
      filter.role = role.toUpperCase();
    }

    // Добавляем поиск по имени, фамилии или email, если указан
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    console.log('adminController.getUsers: Применяемый фильтр:', JSON.stringify(filter));

    // Подсчитываем общее количество пользователей, соответствующих фильтрам
    const total = await User.countDocuments(filter);
    console.log('adminController.getUsers: Общее количество найденных пользователей:', total);

    // Получаем пользователей с применением пагинации и фильтров
    const users: UserDocument[] = await User.find(filter)
      .select('-password -__v')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    console.log('adminController.getUsers: Получено пользователей:', users.length);

    if (users.length > 0) {
      console.log(
        'adminController.getUsers: Пример первого пользователя:',
        JSON.stringify(users[0])
      );
    } else {
      console.log('adminController.getUsers: Пользователи не найдены');
    }

    // Рассчитываем общее количество страниц
    const pages = Math.ceil(total / limit);

    // Создаем структурированный ответ
    const response = {
      users,
      pagination: {
        total,
        page,
        pages,
      },
    };

    console.log('adminController.getUsers: Отправляем ответ:', {
      totalUsers: total,
      returnedUsers: response.users.length,
      pagination: response.pagination,
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error('adminController.getUsers: Ошибка получения пользователей:', error);

    // Даже при ошибке возвращаем структурированный ответ с пустым массивом пользователей
    return res.status(200).json({
      users: [],
      pagination: {
        total: 0,
        page: 1,
        pages: 1,
      },
      error: 'Не удалось получить список пользователей',
    });
  }
};

// Получение детальной информации о пользователе
export const getUserDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password -__v');

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error getting user details:', error);
    res.status(500).json({ message: 'Не удалось получить информацию о пользователе' });
  }
};

// Обновление роли пользователя
export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!Object.values(UserRole).includes(role as UserRole)) {
      return res.status(400).json({ message: 'Недопустимая роль' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    user.role = role as UserRole;
    await user.save();

    res.status(200).json({ message: 'Роль успешно обновлена', user });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Не удалось обновить роль пользователя' });
  }
};

// Блокировка/разблокировка пользователя
export const toggleUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { isBlocked } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    user.isBlocked = isBlocked;
    await user.save();

    const statusMessage = isBlocked ? 'заблокирован' : 'разблокирован';
    res.status(200).json({ message: `Пользователь успешно ${statusMessage}`, user });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ message: 'Не удалось изменить статус пользователя' });
  }
};

// Удаление пользователя
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await User.findByIdAndDelete(userId);

    if (!result) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.status(200).json({ message: 'Пользователь успешно удален' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Не удалось удалить пользователя' });
  }
};

// Отправка массовых уведомлений
export const sendBroadcastNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { title, message, targetRole } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Заголовок и текст уведомления обязательны' });
    }

    // Формируем фильтр для получателей
    const filter: Record<string, unknown> = {};

    if (targetRole && Object.values(UserRole).includes(targetRole as UserRole)) {
      filter.role = targetRole;
    }

    // Получаем ID всех пользователей, соответствующих фильтру
    const users = await User.find(filter).select('_id');
    const userIds = users.map((user: { _id: Types.ObjectId }) => user._id);

    if (userIds.length === 0) {
      return res.status(404).json({ message: 'Не найдено пользователей для отправки уведомлений' });
    }

    // Создаем уведомления для каждого пользователя
    const notifications = userIds.map((userId: Types.ObjectId) => ({
      user: userId,
      title,
      message,
      type: 'admin',
    }));

    await Notification.insertMany(notifications);

    res.status(200).json({
      message: 'Уведомления успешно отправлены',
      recipientsCount: userIds.length,
    });
  } catch (error) {
    console.error('Error sending broadcast notification:', error);
    res.status(500).json({ message: 'Не удалось отправить уведомления' });
  }
};

// Получение списка клиник
export const getClinics = async (
  req: AuthRequest & { query: { page?: string; limit?: string; search?: string } },
  res: Response
) => {
  try {
    const { page = '1', limit = '10', search = '' } = req.query;
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { address: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const clinics = await Clinic.find(query)
      .populate('doctors', 'name email')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Clinic.countDocuments(query);

    res.json({
      clinics,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error('Get clinics error:', error);
    res.status(500).json({ error: 'Ошибка при получении списка клиник' });
  }
};

// Обновление клиники
export const updateClinic = async (
  req: AuthRequest & { params: { id: string } },
  res: Response
) => {
  try {
    const { id } = req.params;
    const { name, address, phone, email, isActive } = req.body;

    const clinic = await Clinic.findById(id);
    if (!clinic) {
      return res.status(404).json({ error: 'Клиника не найдена' });
    }

    if (name) clinic.name = name;
    if (address) clinic.address = address;
    if (phone) clinic.phone = phone;
    if (email) clinic.email = email;
    if (typeof isActive === 'boolean') clinic.isActive = isActive;

    await clinic.save();
    res.json(clinic);
  } catch (error) {
    console.error('Update clinic error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении клиники' });
  }
};

// Удаление клиники
export const deleteClinic = async (
  req: AuthRequest & { params: { id: string } },
  res: Response
) => {
  try {
    const { id } = req.params;
    const clinic = await Clinic.findById(id);

    if (!clinic) {
      return res.status(404).json({ error: 'Клиника не найдена' });
    }

    await clinic.deleteOne();
    res.json({ message: 'Клиника успешно удалена' });
  } catch (error) {
    console.error('Delete clinic error:', error);
    res.status(500).json({ error: 'Ошибка при удалении клиники' });
  }
};

// Получение списка статей
export const getArticles = async (
  req: AuthRequest & { query: { page?: string; limit?: string; search?: string } },
  res: Response
) => {
  try {
    const { page = '1', limit = '10', search = '' } = req.query;
    const query = search
      ? {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const articles = await Article.find(query)
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Article.countDocuments(query);

    res.json({
      articles,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ error: 'Ошибка при получении списка статей' });
  }
};

// Обновление статьи
export const updateArticle = async (
  req: AuthRequest & { params: { id: string } },
  res: Response
) => {
  try {
    const { id } = req.params;
    const { title, content, isPublished } = req.body;

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ error: 'Статья не найдена' });
    }

    if (title) article.title = title;
    if (content) article.content = content;
    if (typeof isPublished === 'boolean') article.isPublished = isPublished;

    await article.save();
    res.json(article);
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении статьи' });
  }
};

// Удаление статьи
export const deleteArticle = async (
  req: AuthRequest & { params: { id: string } },
  res: Response
) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ error: 'Статья не найдена' });
    }

    await article.deleteOne();
    res.json({ message: 'Статья успешно удалена' });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ error: 'Ошибка при удалении статьи' });
  }
};

// Получение списка отзывов
export const getReviews = async (
  req: AuthRequest & { query: { page?: string; limit?: string; search?: string } },
  res: Response
) => {
  try {
    const { page = '1', limit = '10', search = '' } = req.query;
    const query = search
      ? {
          $or: [{ text: { $regex: search, $options: 'i' } }],
        }
      : {};

    const reviews = await Review.find(query)
      .populate('user', 'name avatar')
      .populate('clinic', 'name')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Ошибка при получении списка отзывов' });
  }
};

// Обновление отзыва
export const updateReview = async (
  req: AuthRequest & { params: { id: string } },
  res: Response
) => {
  try {
    const { id } = req.params;
    const { text, rating, isApproved } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ error: 'Отзыв не найден' });
    }

    if (text) review.text = text;
    if (rating) review.rating = rating;
    if (typeof isApproved === 'boolean') review.isApproved = isApproved;

    await review.save();
    res.json(review);
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении отзыва' });
  }
};

// Удаление отзыва
export const deleteReview = async (
  req: AuthRequest & { params: { id: string } },
  res: Response
) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Отзыв не найден' });
    }

    await review.deleteOne();
    res.json({ message: 'Отзыв успешно удален' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Ошибка при удалении отзыва' });
  }
};

// Обновление пользователя
export const updateUser = async (req: AuthRequest & { params: { id: string } }, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (role) user.role = role as UserRole;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении пользователя' });
  }
};
