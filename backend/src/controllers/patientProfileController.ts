import { Request, Response } from 'express';
import { PatientProfile } from '../models/PatientProfile';
import { User } from '../models/User';
import mongoose from 'mongoose';
import { UserRole } from '../types/user';
import { AuthRequest } from '../middleware/auth';

// Получение профиля пациента по ID пользователя
export const getPatientProfileByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Некорректный ID пользователя' });
    }
    
    const patientProfile = await PatientProfile.findOne({ userId })
      .populate('userId', 'firstName lastName email avatar')
      .populate('familyDoctor', 'firstName lastName specialization');
      
    if (!patientProfile) {
      return res.status(404).json({ message: 'Профиль пациента не найден' });
    }
    
    res.status(200).json(patientProfile);
  } catch (error) {
    console.error('Error getting patient profile:', error);
    res.status(500).json({ message: 'Ошибка при получении профиля пациента' });
  }
};

// Создание или обновление профиля пациента
export const createOrUpdatePatientProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.userId || req.user?.id;
    
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Некорректный ID пользователя' });
    }
    
    // Проверка прав доступа
    if (req.user?.role !== UserRole.ADMIN && req.user?.id !== userId) {
      return res.status(403).json({ message: 'У вас нет прав для редактирования этого профиля' });
    }
    
    // Проверка, что пользователь существует
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    // Находим существующий профиль или создаем новый
    let patientProfile = await PatientProfile.findOne({ userId });
    
    const {
      birthDate,
      gender,
      height,
      weight,
      bloodType,
      allergies,
      chronicConditions,
      medications,
      medicalHistory,
      emergencyContact,
      insurance,
      preferredLanguage,
      lastCheckup,
      familyDoctor,
      avatarUrl,
    } = req.body;
    
    if (patientProfile) {
      // Обновляем существующий профиль
      if (birthDate !== undefined) patientProfile.birthDate = birthDate;
      if (gender !== undefined) patientProfile.gender = gender;
      if (height !== undefined) patientProfile.height = height;
      if (weight !== undefined) patientProfile.weight = weight;
      if (bloodType !== undefined) patientProfile.bloodType = bloodType;
      if (allergies !== undefined) patientProfile.allergies = allergies;
      if (chronicConditions !== undefined) patientProfile.chronicConditions = chronicConditions;
      if (medications !== undefined) patientProfile.medications = medications;
      if (medicalHistory !== undefined) patientProfile.medicalHistory = medicalHistory;
      
      if (emergencyContact) {
        patientProfile.emergencyContact = {
          name: emergencyContact.name || patientProfile.emergencyContact.name,
          phone: emergencyContact.phone || patientProfile.emergencyContact.phone,
          relationship: emergencyContact.relationship || patientProfile.emergencyContact.relationship,
        };
      }
      
      if (insurance) {
        patientProfile.insurance = {
          provider: insurance.provider || patientProfile.insurance.provider,
          policyNumber: insurance.policyNumber || patientProfile.insurance.policyNumber,
          expiryDate: insurance.expiryDate || patientProfile.insurance.expiryDate,
        };
      }
      
      if (preferredLanguage !== undefined) patientProfile.preferredLanguage = preferredLanguage;
      if (lastCheckup !== undefined) patientProfile.lastCheckup = new Date(lastCheckup);
      if (familyDoctor !== undefined && mongoose.Types.ObjectId.isValid(familyDoctor)) {
        patientProfile.familyDoctor = familyDoctor;
      }
      if (avatarUrl !== undefined) patientProfile.avatarUrl = avatarUrl;
      
      await patientProfile.save();
    } else {
      // Создаем новый профиль
      patientProfile = new PatientProfile({
        userId,
        birthDate: birthDate || '',
        gender: gender || '',
        height: height || 0,
        weight: weight || 0,
        bloodType: bloodType || '',
        allergies: allergies || [],
        chronicConditions: chronicConditions || [],
        medications: medications || [],
        medicalHistory: medicalHistory || '',
        emergencyContact: emergencyContact || { name: '', phone: '', relationship: '' },
        insurance: insurance || { provider: '', policyNumber: '', expiryDate: '' },
        preferredLanguage: preferredLanguage || 'ru',
        lastCheckup: lastCheckup ? new Date(lastCheckup) : null,
        familyDoctor: (familyDoctor && mongoose.Types.ObjectId.isValid(familyDoctor)) ? familyDoctor : null,
        avatarUrl: avatarUrl || '',
      });
      
      await patientProfile.save();
    }
    
    // Обновляем роль пользователя на пациента, если роль не установлена
    if (!user.role) {
      user.role = UserRole.PATIENT;
      await user.save();
    }
    
    const populatedProfile = await PatientProfile.findOne({ userId })
      .populate('userId', 'firstName lastName email avatar')
      .populate('familyDoctor', 'firstName lastName specialization');
      
    res.status(200).json(populatedProfile);
  } catch (error) {
    console.error('Error creating/updating patient profile:', error);
    res.status(500).json({ message: 'Ошибка при создании/обновлении профиля пациента' });
  }
};

// Удаление профиля пациента
export const deletePatientProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Некорректный ID пользователя' });
    }
    
    // Проверка прав доступа
    if (req.user?.role !== UserRole.ADMIN && req.user?.id !== userId) {
      return res.status(403).json({ message: 'У вас нет прав для удаления этого профиля' });
    }
    
    const result = await PatientProfile.findOneAndDelete({ userId });
    
    if (!result) {
      return res.status(404).json({ message: 'Профиль пациента не найден' });
    }
    
    res.status(200).json({ message: 'Профиль пациента успешно удален' });
  } catch (error) {
    console.error('Error deleting patient profile:', error);
    res.status(500).json({ message: 'Ошибка при удалении профиля пациента' });
  }
}; 