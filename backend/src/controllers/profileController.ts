import { Request, Response } from 'express';
import { Profile } from '../models/Profile';
import { User } from '../models/User';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// Получение профиля пользователя
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    
    console.log('Запрос на получение профиля. ID пользователя:', userId);
    
    if (!userId) {
      console.log('ID пользователя отсутствует в запросе');
      return res.status(401).json({ message: 'Требуется авторизация' });
    }
    
    // Поиск профиля пользователя
    let profile = await Profile.findOne({ userId });

    if (!profile) {
      console.log('Профиль не найден');
      return res.status(404).json({ message: 'Профиль не найден' });
    }

    console.log('Профиль найден и возвращен');
    res.json(profile);
  } catch (error) {
    console.error('Ошибка при получении профиля:', error);
    res.status(500).json({ error: 'Ошибка при получении профиля' });
  }
};

// Обновление профиля пользователя
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const profileData = req.body;
    
    console.log('Запрос на обновление профиля. ID пользователя:', userId);
    console.log('Данные профиля:', JSON.stringify(profileData, null, 2));
    
    if (!userId) {
      console.log('ID пользователя отсутствует в запросе');
      return res.status(401).json({ message: 'Требуется авторизация' });
    }

    // Проверяем, существует ли профиль
    let profile = await Profile.findOne({ userId });

    if (profile) {
      console.log('Обновляем существующий профиль');
      // Обновляем существующий профиль
      profile = await Profile.findOneAndUpdate(
        { userId },
        { ...profileData, userId },
        { new: true, runValidators: true }
      );
    } else {
      console.log('Создаем новый профиль');
      // Создаем новый профиль
      profile = await Profile.create({
        ...profileData,
        userId,
      });
    }

    console.log('Профиль успешно обновлен/создан');
    res.json(profile);
  } catch (error) {
    console.error('Ошибка при обновлении профиля:', error);
    res.status(500).json({ error: 'Ошибка при обновлении профиля' });
  }
};

// Загрузка аватара
export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      console.log('ID пользователя отсутствует в запросе');
      return res.status(401).json({ error: 'Требуется авторизация' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }
    
    const avatarUrl = `/uploads/${req.file.filename}`;
    
    // Обновляем аватар в профиле
    let profile = await Profile.findOne({ userId });
    
    if (profile) {
      // Если есть старый аватар, удаляем файл
      if (profile.avatarUrl && profile.avatarUrl !== avatarUrl) {
        try {
          const oldAvatarPath = path.join(__dirname, '../../public', profile.avatarUrl);
          if (fs.existsSync(oldAvatarPath)) {
            fs.unlinkSync(oldAvatarPath);
          }
        } catch (err) {
          console.error('Error removing old avatar:', err);
        }
      }
      
      // Обновляем аватар в профиле
      profile = await Profile.findOneAndUpdate(
        { userId },
        { avatarUrl },
        { new: true }
      );
    } else {
      // Создаем новый профиль с аватаром
      profile = await Profile.create({
        userId,
        avatarUrl,
      });
    }
    
    // Обновляем аватар в модели пользователя
    await User.findByIdAndUpdate(userId, { avatar: avatarUrl });
    
    res.json({ avatarUrl });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Ошибка при загрузке аватара' });
  }
}; 