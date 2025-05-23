import { Response } from 'express';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { createNotification } from '../utils/notifications';
import { UserRole } from '../types/user';
import { NotificationType } from '../utils/notifications';
import bcrypt from 'bcryptjs';

// Получение списка пользователей
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    console.error('Ошибка при получении списка пользователей:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Запрос на получение роли доктора
export const requestDoctorRole = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Пользователь не авторизован' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Проверяем, что пользователь ещё не доктор
    if (user.role === UserRole.DOCTOR) {
      return res.status(400).json({ error: 'Пользователь уже имеет роль доктора' });
    }

    // Обновляем пользователя, добавляя информацию о запросе
    user.doctorRequest = {
      status: 'pending',
      requestedAt: new Date(),
    };
    await user.save();

    // Находим администраторов для отправки уведомления
    const admins = await User.find({ role: UserRole.ADMIN });
    if (admins.length > 0) {
      const admin = admins[0]; // Отправляем первому админу

      await createNotification(
        admin._id.toString(),
        NotificationType.SYSTEM,
        'Запрос на роль доктора',
        `Пользователь ${user.firstName} ${user.lastName} запросил роль доктора. Требуется рассмотрение.`
      );
    }

    // Отправляем уведомление пользователю
    await createNotification(
      userId,
      NotificationType.SYSTEM,
      'Запрос на роль доктора отправлен',
      'Ваш запрос на получение роли доктора отправлен. Пожалуйста, ожидайте ответа администратора.'
    );

    res.json({
      success: true,
      message: 'Запрос на роль доктора успешно отправлен',
    });
  } catch (error) {
    console.error('Ошибка при отправке запроса на роль доктора:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получение статуса запроса на роль доктора
export const getDoctorRequestStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ error: 'ID пользователя не определен' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (!user.doctorRequest) {
      return res.status(404).json({ error: 'Запрос на роль доктора не найден' });
    }

    res.json({
      status: user.doctorRequest.status,
      requestedAt: user.doctorRequest.requestedAt,
      processedAt: user.doctorRequest.processedAt,
    });
  } catch (error) {
    console.error('Ошибка при получении статуса запроса:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Смена пароля пользователя
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { oldPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'ID пользователя не определен' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Текущий и новый пароли обязательны' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Новый пароль должен содержать минимум 6 символов' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Текущий пароль неверен' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error('Ошибка при смене пароля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
