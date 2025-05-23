import { Request, Response } from 'express';
import { DoctorProfile } from '../models/DoctorProfile';
import { User } from '../models/User';
import { AuthRequest, getUser } from '../middleware/auth';
import { UserRole } from '../types/user';

// Получение списка профилей врачей
export const getDoctorProfiles = async (req: AuthRequest, res: Response) => {
  try {
    const { specialization, verified } = req.query;

    const filter: Record<string, unknown> = {};

    if (specialization) {
      filter.specialization = specialization;
    }

    // Если запрос не от админа, показываем только подтвержденные профили
    const user = req.user;
    if (user?.role !== UserRole.ADMIN) {
      filter.verified = true;
    } else if (verified !== undefined) {
      filter.verified = verified === 'true';
    }

    const doctorProfiles = await DoctorProfile.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json(doctorProfiles);
  } catch (error) {
    console.error('Ошибка при получении профилей врачей:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении профилей врачей' });
  }
};

// Получение профиля врача по ID пользователя
export const getDoctorProfileByUserId = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.userId || getUser(req).id;

    const doctorProfile = await DoctorProfile.findOne({ userId }).populate(
      'user',
      'firstName lastName email'
    );

    if (!doctorProfile) {
      return res.status(404).json({ error: 'Профиль врача не найден' });
    }

    // Проверка прав доступа
    const user = getUser(req);
    if (user.role !== UserRole.ADMIN && user.id !== userId) {
      return res.status(403).json({ error: 'Нет прав для просмотра этого профиля' });
    }

    res.json(doctorProfile);
  } catch (error) {
    console.error('Ошибка при получении профиля врача:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении профиля врача' });
  }
};

// Создание или обновление профиля врача
export const createOrUpdateDoctorProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.userId;

    // Проверяем, существует ли пользователь
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Проверяем роль пользователя или права администратора
    const currentUser = getUser(req);
    if (user.role !== UserRole.DOCTOR && currentUser.role !== UserRole.ADMIN) {
      return res.status(403).json({
        error: 'Нет прав для создания профиля врача. Пользователь должен иметь роль врача.',
      });
    }

    // Проверяем права на редактирование
    if (currentUser.id !== userId && currentUser.role !== UserRole.ADMIN) {
      return res.status(403).json({
        error: 'Нет прав для редактирования этого профиля',
      });
    }

    const {
      specialization,
      experience,
      education,
      certifications,
      workSchedule,
      about,
      languages,
      acceptingNewPatients,
      price,
      services,
    } = req.body;

    // Ищем существующий профиль
    let doctorProfile = await DoctorProfile.findOne({ userId });

    if (doctorProfile) {
      // Обновляем существующий профиль
      Object.assign(doctorProfile, {
        specialization,
        experience,
        education,
        certifications,
        workSchedule,
        about,
        languages,
        acceptingNewPatients,
        price,
        services,
      });

      // Обновляем статус верификации, если запрос от админа
      const currentUser = getUser(req);
      if (currentUser.role === UserRole.ADMIN && req.body.verified !== undefined) {
        doctorProfile.verified = req.body.verified;
      }

      await doctorProfile.save();
    } else {
      // Создаем новый профиль
      doctorProfile = await DoctorProfile.create({
        userId,
        specialization,
        experience,
        education,
        certifications,
        workSchedule,
        about,
        languages,
        acceptingNewPatients,
        price,
        services,
        verified: currentUser.role === UserRole.ADMIN && req.body.verified === true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    res.json(doctorProfile);
  } catch (error) {
    console.error('Ошибка при создании/обновлении профиля врача:', error);
    res.status(500).json({ error: 'Ошибка сервера при сохранении профиля врача' });
  }
};

// Подтверждение профиля врача (только для админа)
export const verifyDoctorProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { verified } = req.body;

    // Проверяем права администратора
    const currentUser = getUser(req);
    if (currentUser.role !== UserRole.ADMIN) {
      return res
        .status(403)
        .json({ error: 'Только администратор может подтверждать профили врачей' });
    }

    const doctorProfile = await DoctorProfile.findOne({ userId });
    if (!doctorProfile) {
      return res.status(404).json({ error: 'Профиль врача не найден' });
    }

    doctorProfile.verified = verified;
    doctorProfile.updatedAt = new Date();

    await doctorProfile.save();

    res.json(doctorProfile);
  } catch (error) {
    console.error('Ошибка при подтверждении профиля врача:', error);
    res.status(500).json({ error: 'Ошибка сервера при подтверждении профиля врача' });
  }
};

// Удаление профиля врача
export const deleteDoctorProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    // Проверяем права доступа
    const currentUser = getUser(req);
    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== userId) {
      return res.status(403).json({ error: 'Нет прав для удаления этого профиля' });
    }

    const result = await DoctorProfile.deleteOne({ userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Профиль врача не найден' });
    }

    res.json({ message: 'Профиль врача успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении профиля врача:', error);
    res.status(500).json({ error: 'Ошибка сервера при удалении профиля врача' });
  }
};
