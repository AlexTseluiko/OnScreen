import { Request, Response } from 'express';
import { DoctorProfile } from '../models/DoctorProfile';
import { User } from '../models/User';
import mongoose from 'mongoose';
import { UserRole } from '../types/user';

// Получение всех профилей докторов
export const getDoctorProfiles = async (req: Request, res: Response) => {
  try {
    const { specialization, verified } = req.query;

    const query: any = {};

    // Фильтрация по специализации
    if (specialization) {
      query.specialization = specialization;
    }

    // Фильтрация по статусу верификации
    if (verified !== undefined) {
      query.verified = verified === 'true';
    }

    const doctorProfiles = await DoctorProfile.find(query).populate(
      'userId',
      'firstName lastName email avatar'
    );

    res.status(200).json(doctorProfiles);
  } catch (error) {
    console.error('Error getting doctor profiles:', error);
    res.status(500).json({ message: 'Ошибка при получении профилей докторов' });
  }
};

// Получение профиля доктора по ID пользователя
export const getDoctorProfileByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Некорректный ID пользователя' });
    }

    const doctorProfile = await DoctorProfile.findOne({ userId }).populate(
      'userId',
      'firstName lastName email avatar'
    );

    if (!doctorProfile) {
      return res.status(404).json({ message: 'Профиль доктора не найден' });
    }

    res.status(200).json(doctorProfile);
  } catch (error) {
    console.error('Error getting doctor profile:', error);
    res.status(500).json({ message: 'Ошибка при получении профиля доктора' });
  }
};

// Создание или обновление профиля доктора
export const createOrUpdateDoctorProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId || req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Некорректный ID пользователя' });
    }

    // Проверка прав доступа
    if (req.user.role !== UserRole.ADMIN && req.user.id !== userId) {
      return res.status(403).json({ message: 'У вас нет прав для редактирования этого профиля' });
    }

    // Проверка, что пользователь существует и имеет роль доктора
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (user.role !== UserRole.DOCTOR && req.user.role !== UserRole.ADMIN) {
      return res.status(400).json({
        message: 'Профиль доктора может быть создан только для пользователей с ролью доктора',
      });
    }

    const {
      specialization,
      education,
      experience,
      certificates,
      languages,
      biography,
      consultationFee,
      availability,
      workplaces,
      avatarUrl,
    } = req.body;

    // Находим существующий профиль или создаем новый
    let doctorProfile = await DoctorProfile.findOne({ userId });

    if (doctorProfile) {
      // Обновляем существующий профиль
      doctorProfile.specialization = specialization || doctorProfile.specialization;
      doctorProfile.education = education || doctorProfile.education;
      doctorProfile.experience = experience || doctorProfile.experience;
      doctorProfile.certificates = certificates || doctorProfile.certificates;
      doctorProfile.languages = languages || doctorProfile.languages;
      doctorProfile.biography = biography || doctorProfile.biography;

      if (consultationFee !== undefined) {
        doctorProfile.consultationFee = consultationFee;
      }

      if (availability) {
        doctorProfile.availability = {
          days: availability.days || doctorProfile.availability?.days || [],
          timeSlots: availability.timeSlots || doctorProfile.availability?.timeSlots || [],
        };
      }

      if (workplaces) {
        doctorProfile.workplaces = workplaces;
      }

      if (avatarUrl) {
        doctorProfile.avatarUrl = avatarUrl;
      }

      // Только админ может верифицировать профиль
      if (req.user.role === UserRole.ADMIN && req.body.verified !== undefined) {
        doctorProfile.verified = req.body.verified;
      }

      await doctorProfile.save();
    } else {
      // Создаем новый профиль
      doctorProfile = new DoctorProfile({
        userId,
        specialization,
        education: education || [],
        experience: experience || '',
        certificates: certificates || [],
        languages: languages || [],
        biography: biography || '',
        consultationFee,
        availability: availability || { days: [], timeSlots: [] },
        workplaces: workplaces || [],
        avatarUrl: avatarUrl || '',
        verified: req.user.role === UserRole.ADMIN && req.body.verified === true,
      });

      await doctorProfile.save();
    }

    // Обновляем роль пользователя на доктора, если она еще не установлена
    if (user.role !== UserRole.DOCTOR) {
      user.role = UserRole.DOCTOR;
      await user.save();
    }

    const populatedProfile = await DoctorProfile.findOne({ userId }).populate(
      'userId',
      'firstName lastName email avatar'
    );

    res.status(200).json(populatedProfile);
  } catch (error) {
    console.error('Error creating/updating doctor profile:', error);
    res.status(500).json({ message: 'Ошибка при создании/обновлении профиля доктора' });
  }
};

// Верификация профиля доктора (только для админов)
export const verifyDoctorProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { verified } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Некорректный ID пользователя' });
    }

    // Проверка прав доступа (только админ)
    if (req.user.role !== UserRole.ADMIN) {
      return res
        .status(403)
        .json({ message: 'Только администраторы могут верифицировать профили докторов' });
    }

    const doctorProfile = await DoctorProfile.findOne({ userId });

    if (!doctorProfile) {
      return res.status(404).json({ message: 'Профиль доктора не найден' });
    }

    doctorProfile.verified = verified === true;
    await doctorProfile.save();

    res.status(200).json({
      message: `Профиль доктора успешно ${verified ? 'верифицирован' : 'деверифицирован'}`,
    });
  } catch (error) {
    console.error('Error verifying doctor profile:', error);
    res.status(500).json({ message: 'Ошибка при верификации профиля доктора' });
  }
};

// Удаление профиля доктора
export const deleteDoctorProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Некорректный ID пользователя' });
    }

    // Проверка прав доступа
    if (req.user.role !== UserRole.ADMIN && req.user.id !== userId) {
      return res.status(403).json({ message: 'У вас нет прав для удаления этого профиля' });
    }

    const result = await DoctorProfile.findOneAndDelete({ userId });

    if (!result) {
      return res.status(404).json({ message: 'Профиль доктора не найден' });
    }

    res.status(200).json({ message: 'Профиль доктора успешно удален' });
  } catch (error) {
    console.error('Error deleting doctor profile:', error);
    res.status(500).json({ message: 'Ошибка при удалении профиля доктора' });
  }
};
