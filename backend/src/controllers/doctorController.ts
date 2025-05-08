import { Request, Response } from 'express';
import { Doctor } from '../models/Doctor';
import { User, UserRole } from '../models/User';
import { createNotification, NotificationType } from '../utils/notifications';

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

    const query: any = {};

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
export const getDoctorById = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId)
      .populate('user', 'firstName lastName email')
      .populate('clinic', 'name');

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
export const updateDoctor = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const {
      specialization,
      experience,
      education,
      certifications,
      workingHours,
      isAvailable,
    } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Врач не найден' });
    }

    // Проверяем права доступа
    if (req.user.id !== doctor.user.toString() && req.user.role !== UserRole.ADMIN) {
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
export const deleteDoctor = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Врач не найден' });
    }

    // Проверяем права доступа
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Нет прав для удаления врача' });
    }

    // Обновляем роль пользователя
    const user = await User.findById(doctor.user);
    if (user) {
      user.role = UserRole.PATIENT;
      await user.save();
    }

    await Doctor.deleteOne({ _id: doctorId });

    res.json({ message: 'Врач успешно удален' });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({ error: 'Ошибка при удалении врача' });
  }
}; 