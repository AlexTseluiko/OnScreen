import { Response } from 'express';
import { MedicalRecord } from '../models/MedicalRecord';
import { UserRole } from '../types/user';
import { createNotification, NotificationType } from '../utils/notifications';
import { AuthRequest } from '../middleware/auth';

// Получение списка медицинских записей
export const getMedicalRecords = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, patientId, doctorId, clinicId } = req.query;
    const query: Record<string, unknown> = {};

    if (patientId) {
      query.patient = patientId;
    }

    if (doctorId) {
      query.doctor = doctorId;
    }

    if (clinicId) {
      query.clinic = clinicId;
    }

    // Если пользователь не администратор, показываем только его записи
    if (req.user?.role !== UserRole.ADMIN) {
      query.patient = req.user?.id;
    }

    const records = await MedicalRecord.find(query)
      .sort({ date: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .populate('clinic', 'name');

    const total = await MedicalRecord.countDocuments(query);

    res.json({
      records,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error('Error getting medical records:', error);
    res.status(500).json({ message: 'Ошибка при получении медицинских записей' });
  }
};

// Получение медицинской записи по ID
export const getMedicalRecordById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const record = await MedicalRecord.findById(id)
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .populate('clinic', 'name');

    if (!record) {
      return res.status(404).json({ message: 'Медицинская запись не найдена' });
    }

    // Проверяем права доступа
    if (
      req.user?.role !== UserRole.ADMIN &&
      record.patient.toString() !== req.user?.id &&
      record.doctor.toString() !== req.user?.id
    ) {
      return res.status(403).json({ message: 'У вас нет прав на просмотр этой записи' });
    }

    res.json(record);
  } catch (error) {
    console.error('Error getting medical record:', error);
    res.status(500).json({ message: 'Ошибка при получении медицинской записи' });
  }
};

// Создание новой медицинской записи
export const createMedicalRecord = async (req: AuthRequest, res: Response) => {
  try {
    const {
      patientId,
      doctorId,
      clinicId,
      date,
      diagnosis,
      treatment,
      medications,
      notes,
      isPrivate,
    } = req.body;

    // Проверяем права доступа
    if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.DOCTOR) {
      return res.status(403).json({ message: 'У вас нет прав на создание медицинских записей' });
    }

    const record = new MedicalRecord({
      patient: patientId,
      doctor: doctorId,
      clinic: clinicId,
      date,
      diagnosis,
      treatment,
      medications,
      notes,
      isPrivate,
    });

    await record.save();

    // Отправляем уведомление пациенту
    await createNotification(
      patientId,
      NotificationType.APPOINTMENT,
      'Новая медицинская запись',
      'У вас появилась новая медицинская запись'
    );

    res.status(201).json(record);
  } catch (error) {
    console.error('Error creating medical record:', error);
    res.status(500).json({ message: 'Ошибка при создании медицинской записи' });
  }
};

// Обновление медицинской записи
export const updateMedicalRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { diagnosis, treatment, medications, notes, isPrivate } = req.body;

    const record = await MedicalRecord.findById(id);

    if (!record) {
      return res.status(404).json({ message: 'Медицинская запись не найдена' });
    }

    // Проверяем права доступа
    if (req.user?.role !== UserRole.ADMIN && record.doctor.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'У вас нет прав на редактирование этой записи' });
    }

    const updatedRecord = await MedicalRecord.findByIdAndUpdate(
      id,
      {
        diagnosis,
        treatment,
        medications,
        notes,
        isPrivate,
      },
      { new: true }
    )
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .populate('clinic', 'name');

    // Отправляем уведомление пациенту
    await createNotification(
      record.patient.toString(),
      NotificationType.APPOINTMENT,
      'Обновлена медицинская запись',
      'Ваша медицинская запись была обновлена'
    );

    res.json(updatedRecord);
  } catch (error) {
    console.error('Error updating medical record:', error);
    res.status(500).json({ message: 'Ошибка при обновлении медицинской записи' });
  }
};

// Удаление медицинской записи
export const deleteMedicalRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const record = await MedicalRecord.findById(id);

    if (!record) {
      return res.status(404).json({ message: 'Медицинская запись не найдена' });
    }

    // Проверяем права доступа
    if (req.user?.role !== UserRole.ADMIN && record.doctor.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'У вас нет прав на удаление этой записи' });
    }

    await MedicalRecord.findByIdAndDelete(id);

    res.json({ message: 'Медицинская запись успешно удалена' });
  } catch (error) {
    console.error('Error deleting medical record:', error);
    res.status(500).json({ message: 'Ошибка при удалении медицинской записи' });
  }
};
