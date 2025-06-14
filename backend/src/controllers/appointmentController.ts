import { Request, Response } from 'express';
import { Appointment, AppointmentStatus } from '../models/Appointment';
import { Doctor } from '../models/Doctor';
import { createNotification, NotificationType } from '../utils/notifications';
import { Clinic } from '../models/Clinic';
import { AuthRequest, getUser } from '../middleware/auth';
import { User } from '../models/User';
import { UserRole } from '../types/user';

// Создание записи
export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId, clinicId, date, time, type, notes, symptoms } = req.body;

    const patientId = getUser(req).id;

    // Проверяем доступность врача
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.isAvailable) {
      return res.status(400).json({ error: 'Врач недоступен' });
    }

    // Проверяем, нет ли уже записи на это время
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date,
      time,
      status: { $ne: AppointmentStatus.CANCELLED },
    });

    if (existingAppointment) {
      return res.status(400).json({ error: 'Это время уже занято' });
    }

    // Создаем запись
    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      clinic: clinicId,
      date,
      time,
      type,
      notes,
      symptoms,
      status: AppointmentStatus.PENDING,
    });

    // Получаем информацию о клинике
    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ error: 'Клиника не найдена' });
    }

    // Отправляем уведомление владельцу клиники
    await createNotification(
      clinic.owner.toString(),
      NotificationType.APPOINTMENT,
      'Новая запись',
      `Пользователь записался на прием на ${date} в ${time}`,
      { appointmentId: appointment._id, clinicId }
    );

    await createNotification(
      patientId.toString(),
      NotificationType.APPOINTMENT,
      'Новая запись',
      `Вы записаны на прием к врачу ${doctor.user} на ${date} в ${time}`
    );

    await createNotification(
      doctor.user.toString(),
      NotificationType.APPOINTMENT,
      'Новая запись',
      `У вас новая запись на ${date} в ${time}`
    );

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Ошибка при создании записи' });
  }
};

// Получение записей пользователя
export const getUserAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUser(req).id;
    const { status, startDate, endDate } = req.query;

    const query: Record<string, unknown> = {
      $or: [{ patient: userId }, { doctor: userId }],
    };

    if (status) {
      query.status = status;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const appointments = await Appointment.find(query)
      .sort({ date: 1, time: 1 })
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .populate('clinic', 'name');

    res.json(appointments);
  } catch (error) {
    console.error('Get user appointments error:', error);
    res.status(500).json({ error: 'Ошибка при получении записей' });
  }
};

// Обновление статуса записи
export const updateAppointmentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }

    // Проверка прав доступа
    // Только врач, к которому запись, или админ может менять статус
    const user = getUser(req);
    if (
      user.id !== appointment.patient.toString() &&
      user.id !== appointment.doctor.toString() &&
      user.role !== UserRole.ADMIN
    ) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    appointment.status = status;
    await appointment.save();

    // Отправляем уведомление о изменении статуса
    await createNotification(
      appointment.patient.toString(),
      NotificationType.APPOINTMENT,
      'Статус записи изменен',
      `Статус вашей записи изменен на ${status}`
    );

    res.json(appointment);
  } catch (error) {
    console.error('Ошибка при обновлении статуса записи:', error);
    res.status(500).json({ error: 'Ошибка сервера при обновлении статуса' });
  }
};

// Отмена записи
export const cancelAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { appointmentId } = req.params;
    const userId = getUser(req).id;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      user: userId,
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }

    // Отправляем уведомление владельцу клиники
    const clinic = await Clinic.findById(appointment.clinic);
    if (clinic) {
      await createNotification(
        clinic.owner.toString(),
        NotificationType.APPOINTMENT,
        'Отмена записи',
        `Пользователь отменил запись на ${appointment.date} в ${appointment.time}`,
        { appointmentId: appointment._id, clinicId: clinic._id }
      );
    }

    await Appointment.deleteOne({ _id: appointmentId });

    res.json({ message: 'Запись успешно отменена' });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: 'Ошибка при отмене записи' });
  }
};

// Получение записей клиники
export const getClinicAppointments = async (req: Request, res: Response) => {
  try {
    const { clinicId } = req.params;
    const { date } = req.query;

    const query: Record<string, unknown> = { clinic: clinicId };
    if (date) {
      query.date = date;
    }

    const appointments = await Appointment.find(query)
      .populate('user', 'name phone')
      .populate('doctor', 'name specialization')
      .sort({ time: 1 });

    res.json(appointments);
  } catch (error) {
    console.error('Get clinic appointments error:', error);
    res.status(500).json({ error: 'Ошибка при получении записей' });
  }
};

// Получение подробной информации о записи
export const getAppointmentDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { appointmentId } = req.params;

    // Использование функции getUser для безопасного доступа к user
    const userId = getUser(req).id;

    const appointment = await Appointment.findById(appointmentId)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization')
      .exec();

    if (!appointment) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }

    // Проверка прав доступа
    // Только пациент, врач или админ могут просматривать детали записи
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (
      userId !== appointment.patient._id.toString() &&
      userId !== appointment.doctor._id.toString() &&
      user.role !== UserRole.ADMIN
    ) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Ошибка при получении деталей записи:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении деталей' });
  }
};
