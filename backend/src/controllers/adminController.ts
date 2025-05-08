import { Request, Response } from 'express';
// Проверяем правильность импорта User - если модель экспортируется по умолчанию
import { User } from '../models/User';
import { UserRole } from '../types/user';
import { Clinic } from '../models/Clinic';
import { Review } from '../models/Review';
import { Notification } from '../models/Notification';
import { Doctor } from '../models/Doctor';
import { PatientProfile } from '../models/PatientProfile';
import { DoctorProfile } from '../models/DoctorProfile';
import mongoose from 'mongoose';
import { NotificationType } from '../types/notification';
import { getSocketService } from '../utils/socket';
import { Appointment } from '../models/Appointment';
import { MedicalRecord } from '../models/MedicalRecord';

// Получение статистики для админ-панели
export const getStats = async (req: Request, res: Response) => {
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
      totalUsers, doctors, patients, admins, clinics, appointments, medicalRecords, pendingReviews
    });

    res.status(200).json({
      totalUsers,
      usersByRole: {
        doctors,
        patients,
        admins
      },
      clinics,
      appointments,
      medicalRecords,
      pendingReviews
    });
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({ message: 'Не удалось получить статистику' });
  }
};

// Получение списка пользователей с пагинацией и фильтрацией
export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const role = req.query.role as string;
    const search = req.query.search as string;

    console.log('adminController.getUsers: Запрос с параметрами:', { page, limit, role, search });

    // Формируем фильтры
    const filter: any = {};
    
    // Добавляем фильтр по роли, если указан
    if (role) {
      filter.role = role.toUpperCase();
    }
    
    // Добавляем поиск по имени, фамилии или email, если указан
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('adminController.getUsers: Применяемый фильтр:', JSON.stringify(filter));

    // Подсчитываем общее количество пользователей, соответствующих фильтрам
    const total = await User.countDocuments(filter);
    console.log('adminController.getUsers: Общее количество найденных пользователей:', total);
    
    // Получаем пользователей с применением пагинации и фильтров
    let users = [];
    try {
      users = await User.find(filter)
        .select('-password -__v')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(); // Использование lean() для получения простых JS объектов
    } catch (findError) {
      console.error('adminController.getUsers: Ошибка при выполнении запроса find:', findError);
      // В случае ошибки оставляем пустой массив
    }

    console.log('adminController.getUsers: Получено пользователей:', users.length);
    
    if (users.length > 0) {
      console.log('adminController.getUsers: Пример первого пользователя:', JSON.stringify(users[0]));
    } else {
      console.log('adminController.getUsers: Пользователи не найдены');
    }

    // Рассчитываем общее количество страниц
    const pages = Math.ceil(total / limit);

    // Создаем структурированный ответ
    const response = {
      users: Array.isArray(users) ? users : [], // Гарантируем, что users - массив
      pagination: {
        total,
        page,
        pages
      }
    };

    console.log('adminController.getUsers: Отправляем ответ:', { 
      totalUsers: total, 
      returnedUsers: response.users.length, 
      pagination: response.pagination 
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
        pages: 1
      },
      error: 'Не удалось получить список пользователей'
    });
  }
};

// Получение детальной информации о пользователе
export const getUserDetails = async (req: Request, res: Response) => {
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
export const updateUserRole = async (req: Request, res: Response) => {
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
export const toggleUserStatus = async (req: Request, res: Response) => {
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
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const result = await User.findByIdAndDelete(userId);
    
    if (!result) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    // Здесь также можно добавить удаление связанных с пользователем данных
    // Например, удаление медицинских записей, приемов и т.д.
    
    res.status(200).json({ message: 'Пользователь успешно удален' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Не удалось удалить пользователя' });
  }
};

// Отправка массовых уведомлений
export const sendBroadcastNotification = async (req: Request, res: Response) => {
  try {
    const { title, message, targetRole } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ message: 'Заголовок и текст уведомления обязательны' });
    }
    
    // Формируем фильтр для получателей
    const filter: any = {};
    
    if (targetRole && Object.values(UserRole).includes(targetRole as UserRole)) {
      filter.role = targetRole;
    }
    
    // Получаем ID всех пользователей, соответствующих фильтру
    const users = await User.find(filter).select('_id');
    const userIds = users.map((user: { _id: mongoose.Types.ObjectId }) => user._id);
    
    if (userIds.length === 0) {
      return res.status(404).json({ message: 'Не найдено пользователей для отправки уведомлений' });
    }
    
    // Создаем уведомления для каждого пользователя
    const notifications = userIds.map((userId: mongoose.Types.ObjectId) => ({
      user: userId,
      title,
      message,
      type: 'admin',
    }));
    
    await Notification.insertMany(notifications);
    
    res.status(200).json({ 
      message: 'Уведомления успешно отправлены', 
      recipientsCount: userIds.length 
    });
  } catch (error) {
    console.error('Error sending broadcast notification:', error);
    res.status(500).json({ message: 'Не удалось отправить уведомления' });
  }
}; 