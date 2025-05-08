import { Router } from 'express';
import { auth } from '../middleware/auth';
import { DoctorRequest } from '../models/DoctorRequest';
import { User } from '../models/User';
import { NotificationType } from '../types/notification';
import { Notification } from '../models/Notification';
import { getSocketService } from '../utils/socket';
import bcrypt from 'bcryptjs';

const router = Router();

// Маршрут для запроса на получение роли доктора
router.post('/request-doctor-role', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // Проверяем, что ID пользователя существует
    if (!userId) {
      return res.status(400).json({ error: 'ID пользователя не определен' });
    }
    
    // Проверяем, что пользователь существует
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Проверяем, не отправлял ли пользователь уже запрос
    const existingRequest = await DoctorRequest.findOne({ 
      user: userId,
      status: 'pending'
    });
    
    if (existingRequest) {
      return res.status(400).json({ 
        error: 'Вы уже отправили запрос на получение роли доктора. Он находится на рассмотрении.' 
      });
    }
    
    // Создаем новый запрос
    const { specialization, experience, education, licenseNumber, about } = req.body;
    
    // Проверяем обязательные поля
    if (!specialization || !licenseNumber) {
      return res.status(400).json({ 
        error: 'Специализация и номер лицензии обязательны для заполнения' 
      });
    }
    
    // Создаем запрос
    const doctorRequest = new DoctorRequest({
      user: userId,
      specialization,
      experience,
      education,
      licenseNumber,
      about,
      status: 'pending'
    });
    
    await doctorRequest.save();
    
    // Создаем уведомление для администраторов
    const admins = await User.find({ role: 'admin' }).select('_id');
    
    for (const admin of admins) {
      const notification = new Notification({
        user: admin._id,
        type: NotificationType.SYSTEM,
        title: 'Новый запрос на роль доктора',
        message: `Пользователь ${user.firstName} ${user.lastName} запросил роль доктора. Требуется рассмотрение.`,
        data: {
          requestId: doctorRequest._id,
          userId: user._id
        }
      });
      
      await notification.save();
      
      // Отправляем уведомление через сокет, если администратор онлайн
      const socketService = getSocketService();
      if (socketService) {
        socketService.sendNotification(admin._id.toString(), {
          type: NotificationType.SYSTEM,
          title: 'Новый запрос на роль доктора',
          message: `Пользователь ${user.firstName} ${user.lastName} запросил роль доктора. Требуется рассмотрение.`
        });
      }
    }
    
    // Отправляем подтверждение пользователю
    const userNotification = new Notification({
      user: userId,
      type: NotificationType.SYSTEM,
      title: 'Запрос отправлен',
      message: 'Ваш запрос на получение роли доктора отправлен. Пожалуйста, ожидайте ответа администратора.'
    });
    
    await userNotification.save();
    
    // Уведомляем пользователя через сокет
    const socketService = getSocketService();
    if (socketService) {
      socketService.sendNotification(userId, {
        type: NotificationType.SYSTEM,
        title: 'Запрос отправлен',
        message: 'Ваш запрос на получение роли доктора отправлен. Пожалуйста, ожидайте ответа администратора.'
      });
    }
    
    res.status(201).json({ 
      message: 'Запрос на получение роли доктора успешно отправлен',
      request: doctorRequest
    });
    
  } catch (error) {
    console.error('Ошибка при отправке запроса на роль доктора:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение статуса запроса пользователя
router.get('/doctor-request-status', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // Проверяем, что ID пользователя существует
    if (!userId) {
      return res.status(400).json({ error: 'ID пользователя не определен' });
    }
    
    // Находим последний запрос пользователя
    const request = await DoctorRequest.findOne({ user: userId })
      .sort({ createdAt: -1 });
    
    if (!request) {
      return res.status(404).json({ error: 'Запросы не найдены' });
    }
    
    res.json({
      status: request.status,
      createdAt: request.createdAt,
      processedAt: request.processedAt
    });
    
  } catch (error) {
    console.error('Ошибка при получении статуса запроса:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Маршрут для смены пароля пользователя
router.put('/password', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { oldPassword, newPassword } = req.body;
    
    // Проверяем, что ID пользователя существует
    if (!userId) {
      return res.status(401).json({ error: 'ID пользователя не определен' });
    }
    
    // Проверяем, что пользователь существует
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Проверяем валидность данных
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Текущий и новый пароли обязательны' });
    }
    
    // Проверяем минимальную длину пароля
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Новый пароль должен содержать минимум 6 символов' });
    }
    
    // Проверяем совпадение текущего пароля
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Текущий пароль неверен' });
    }
    
    // Хешируем новый пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Обновляем пароль пользователя
    user.password = hashedPassword;
    await user.save();
    
    res.status(200).json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error('Ошибка при смене пароля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router; 