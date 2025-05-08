import { Request, Response } from 'express';
import { MedicalRecord } from '../models/MedicalRecord';
import { User, UserRole } from '../models/User';
import { createNotification, NotificationType } from '../utils/notificationUtils';

// Создание медицинской карты
export const createMedicalRecord = async (req: Request, res: Response) => {
  try {
    const {
      patientId,
      clinicId,
      diagnosis,
      treatment,
      medications,
      notes,
      attachments,
      isPrivate,
    } = req.body;

    const doctorId = req.user.id;

    // Проверяем права доступа
    if (req.user.role !== UserRole.DOCTOR && req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Нет прав для создания медицинской карты' });
    }

    // Создаем медицинскую карту
    const medicalRecord = await MedicalRecord.create({
      patient: patientId,
      doctor: doctorId,
      clinic: clinicId,
      date: new Date(),
      diagnosis,
      treatment,
      medications,
      notes,
      attachments,
      isPrivate,
    });

    // Отправляем уведомление пациенту
    await createNotification(
      medicalRecord.patient.toString(),
      NotificationType.MEDICAL_RECORD,
      'Новая медицинская запись',
      `Добавлена новая медицинская запись от ${req.user.firstName} ${req.user.lastName}`,
      { recordId: medicalRecord._id }
    );

    res.status(201).json(medicalRecord);
  } catch (error) {
    console.error('Create medical record error:', error);
    res.status(500).json({ error: 'Ошибка при создании медицинской карты' });
  }
};

// Получение медицинских карт пациента
export const getPatientMedicalRecords = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const userId = req.user.id;

    // Проверяем права доступа
    if (
      userId !== patientId &&
      req.user.role !== UserRole.DOCTOR &&
      req.user.role !== UserRole.ADMIN
    ) {
      return res.status(403).json({ error: 'Нет прав для просмотра медицинских карт' });
    }

    const query: any = { patient: patientId };

    // Если пользователь не врач и не админ, показываем только публичные записи
    if (req.user.role === UserRole.PATIENT) {
      query.isPrivate = false;
    }

    const medicalRecords = await MedicalRecord.find(query)
      .sort({ date: -1 })
      .populate('doctor', 'firstName lastName')
      .populate('clinic', 'name');

    res.json(medicalRecords);
  } catch (error) {
    console.error('Get patient medical records error:', error);
    res.status(500).json({ error: 'Ошибка при получении медицинских карт' });
  }
};

// Получение медицинской карты по ID
export const getMedicalRecordById = async (req: Request, res: Response) => {
  try {
    const { recordId } = req.params;
    const userId = req.user.id;

    const medicalRecord = await MedicalRecord.findById(recordId)
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .populate('clinic', 'name');

    if (!medicalRecord) {
      return res.status(404).json({ error: 'Медицинская карта не найдена' });
    }

    // Проверяем права доступа
    if (
      userId !== medicalRecord.patient.toString() &&
      req.user.role !== UserRole.DOCTOR &&
      req.user.role !== UserRole.ADMIN
    ) {
      return res.status(403).json({ error: 'Нет прав для просмотра медицинской карты' });
    }

    // Если запись приватная и пользователь не врач/админ, запрещаем доступ
    if (
      medicalRecord.isPrivate &&
      req.user.role === UserRole.PATIENT &&
      userId !== medicalRecord.patient.toString()
    ) {
      return res.status(403).json({ error: 'Нет прав для просмотра этой записи' });
    }

    res.json(medicalRecord);
  } catch (error) {
    console.error('Get medical record by ID error:', error);
    res.status(500).json({ error: 'Ошибка при получении медицинской карты' });
  }
};

// Обновление медицинской карты
export const updateMedicalRecord = async (req: Request, res: Response) => {
  try {
    const { recordId } = req.params;
    const {
      diagnosis,
      treatment,
      medications,
      notes,
      attachments,
      isPrivate,
    } = req.body;

    const medicalRecord = await MedicalRecord.findById(recordId);
    if (!medicalRecord) {
      return res.status(404).json({ error: 'Медицинская карта не найдена' });
    }

    // Проверяем права доступа
    if (
      req.user.id !== medicalRecord.doctor.toString() &&
      req.user.role !== UserRole.ADMIN
    ) {
      return res.status(403).json({ error: 'Нет прав для редактирования медицинской карты' });
    }

    Object.assign(medicalRecord, {
      diagnosis,
      treatment,
      medications,
      notes,
      attachments,
      isPrivate,
    });

    await medicalRecord.save();

    // Отправляем уведомление пациенту
    await createNotification(
      medicalRecord.patient.toString(),
      NotificationType.MEDICAL_RECORD,
      'Обновление медицинской записи',
      'В вашей медицинской карте обновлена запись'
    );

    res.json(medicalRecord);
  } catch (error) {
    console.error('Update medical record error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении медицинской карты' });
  }
};

// Удаление медицинской карты
export const deleteMedicalRecord = async (req: Request, res: Response) => {
  try {
    const { recordId } = req.params;

    const medicalRecord = await MedicalRecord.findById(recordId);
    if (!medicalRecord) {
      return res.status(404).json({ error: 'Медицинская карта не найдена' });
    }

    // Проверяем права доступа
    if (
      req.user.id !== medicalRecord.doctor.toString() &&
      req.user.role !== UserRole.ADMIN
    ) {
      return res.status(403).json({ error: 'Нет прав для удаления медицинской карты' });
    }

    await MedicalRecord.deleteOne({ _id: recordId });

    res.json({ message: 'Медицинская карта успешно удалена' });
  } catch (error) {
    console.error('Delete medical record error:', error);
    res.status(500).json({ error: 'Ошибка при удалении медицинской карты' });
  }
}; 