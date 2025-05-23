import { Request, Response } from 'express';
import { Doctor } from '../models/Doctor';
import { User } from '../models/User';
import { UserRole } from '../types/user';
import { createNotification, NotificationType } from '../utils/notifications';
import { AuthRequest, getUser } from '../middleware/auth';
import { DoctorProfile } from '../models/DoctorProfile';

// Создание врача
export const createDoctor = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      clinicId,
      specialization,
      experience,
      education,
      certifications,
      workingHours,
    } = req.body;

    // Проверяем, существует ли пользователь
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Создаем врача
    const doctor = await Doctor.create({
      user: userId,
      clinic: clinicId,
      specialization,
      experience,
      education,
      certifications,
      workingHours,
      isAvailable: true,
    });

    // Обновляем роль пользователя
    user.role = UserRole.DOCTOR;
    await user.save();

    res.status(201).json(doctor);
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({ error: 'Ошибка при создании врача' });
  }
};

// Получение списка врачей
export const getDoctors = async (req: Request, res: Response) => {
  try {
    const { clinicId, specialization, rating } = req.query;

    const query: Record<string, unknown> = {};

    if (clinicId) {
      query.clinic = clinicId;
    }

    if (specialization) {
      query.specialization = specialization;
    }

    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    const doctors = await Doctor.find(query)
      .populate('user', 'firstName lastName email')
      .populate('clinic', 'name');

    res.json(doctors);
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Ошибка при получении списка врачей' });
  }
};

// Получение врача по ID
export const getDoctorById = async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId } = req.params;

    const doctor = await DoctorProfile.findById(doctorId).populate('user', 'email').lean();

    if (!doctor) {
      return res.status(404).json({ error: 'Врач не найден' });
    }

    res.json(doctor);
  } catch (error) {
    console.error('Get doctor by ID error:', error);
    res.status(500).json({ error: 'Ошибка при получении информации о враче' });
  }
};

// Обновление информации о враче
export const updateDoctor = async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId } = req.params;
    const { specialization, experience, education, certifications, workingHours, isAvailable } =
      req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Врач не найден' });
    }

    // Проверяем права доступа
    const user = getUser(req);
    if (user.id !== doctor.user.toString() && user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Нет прав для редактирования информации о враче' });
    }

    Object.assign(doctor, {
      specialization,
      experience,
      education,
      certifications,
      workingHours,
      isAvailable,
    });

    await doctor.save();

    res.json(doctor);
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении информации о враче' });
  }
};

// Удаление врача
export const deleteDoctor = async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Врач не найден' });
    }

    // Проверяем права доступа
    const user = getUser(req);
    if (user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Нет прав для удаления врача' });
    }

    // Обновляем роль пользователя
    const user1 = await User.findById(doctor.user);
    if (user1) {
      user1.role = UserRole.PATIENT;
      await user1.save();
    }

    await Doctor.deleteOne({ _id: doctorId });

    res.json({ message: 'Врач успешно удален' });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({ error: 'Ошибка при удалении врача' });
  }
};

// Получение всех докторов с пагинацией
export const getAllDoctors = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const specialization = req.query.specialization as string;
    const verified = req.query.verified === 'true';
    const name = req.query.name as string;

    const skip = (page - 1) * limit;

    // Создаем фильтр для запроса
    const filter: Record<string, unknown> = { verified: true };

    // Добавляем фильтры, если они указаны
    if (specialization) {
      filter.specialization = specialization;
    }

    // Для администратора можно показывать и неподтвержденных докторов
    if (req.user?.role === UserRole.ADMIN) {
      if (req.query.verified !== undefined) {
        filter.verified = verified;
      } else {
        delete filter.verified; // Показываем всех, если фильтр не указан
      }
    }

    // Поиск по имени (регулярное выражение для частичного совпадения)
    if (name) {
      filter.$or = [
        { firstName: { $regex: name, $options: 'i' } },
        { lastName: { $regex: name, $options: 'i' } },
      ];
    }

    // Запрос с попытками использовать индексы
    const doctors = await DoctorProfile.find(filter)
      .populate('user', 'email')
      .skip(skip)
      .limit(limit)
      .lean();

    // Получаем общее количество для пагинации
    const total = await DoctorProfile.countDocuments(filter);

    // Дополнительно обогащаем данные нужной информацией
    const enhancedDoctors = await Promise.all(
      doctors.map(async doctor => {
        // Здесь можно добавить дополнительные данные
        // Например, рейтинг или количество отзывов
        return {
          ...doctor,
          // Дополнительные поля
        };
      })
    );

    res.json({
      data: enhancedDoctors,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Ошибка при получении списка докторов:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении списка докторов' });
  }
};

// Обновление профиля доктора
export const updateDoctorProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId } = req.params;
    const updateData = req.body;

    // Проверяем существование профиля
    const doctor = await DoctorProfile.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Профиль доктора не найден' });
    }

    // Получаем userId из профиля доктора
    // Предполагаем, что в DoctorProfile поле userId содержит ссылку на пользователя
    const userId = doctor.userId?.toString();
    if (!userId) {
      return res.status(404).json({ error: 'ID пользователя в профиле доктора не найден' });
    }

    // Проверяем права доступа (только владелец профиля или админ)
    const user = getUser(req);
    if (user.id !== userId && user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    // Удаляем поля, которые нельзя изменять напрямую
    delete updateData.verified;
    delete updateData.userId;
    delete updateData._id;

    // Обновляем профиль
    const updatedDoctor = await DoctorProfile.findByIdAndUpdate(
      doctorId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json(updatedDoctor);
  } catch (error) {
    console.error('Ошибка при обновлении профиля доктора:', error);
    res.status(500).json({ error: 'Ошибка сервера при обновлении профиля' });
  }
};

// Подтверждение профиля доктора (только для админа)
export const verifyDoctorProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId } = req.params;
    const { verified } = req.body;

    // Проверяем права доступа (только админ)
    const user = getUser(req);
    if (user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора' });
    }

    // Обновляем статус верификации
    const updatedDoctor = await DoctorProfile.findByIdAndUpdate(
      doctorId,
      { verified },
      { new: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({ error: 'Профиль доктора не найден' });
    }

    res.json(updatedDoctor);
  } catch (error) {
    console.error('Ошибка при верификации профиля доктора:', error);
    res.status(500).json({ error: 'Ошибка сервера при верификации профиля' });
  }
};

// Удаление профиля доктора
export const deleteDoctorProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId } = req.params;

    // Проверяем существование профиля
    const doctor = await DoctorProfile.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Профиль доктора не найден' });
    }

    // Получаем userId из профиля доктора
    const userId = doctor.userId?.toString();
    if (!userId) {
      return res.status(404).json({ error: 'ID пользователя в профиле доктора не найден' });
    }

    // Проверяем права доступа (только админ)
    const user = getUser(req);
    if (user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора' });
    }

    // Удаляем профиль
    await DoctorProfile.findByIdAndDelete(doctorId);

    // Также можно изменить роль пользователя обратно на "user"
    await User.findByIdAndUpdate(userId, { role: UserRole.PATIENT });

    res.json({ message: 'Профиль доктора успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении профиля доктора:', error);
    res.status(500).json({ error: 'Ошибка сервера при удалении профиля' });
  }
};
