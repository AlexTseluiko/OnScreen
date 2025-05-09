import { Response } from 'express';
import { User } from '../models/User';
import { Profile } from '../models/Profile';
import { AuthRequest } from '../middleware/auth';
import fs from 'fs';
import path from 'path';

interface FileRequest extends AuthRequest {
  file?: Express.Multer.File;
}

// Получение профиля пользователя
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Обновление профиля пользователя
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, email } = req.body;
    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Загрузка аватара
export const uploadAvatar = async (req: FileRequest, res: Response) => {
  try {
    const userId = req.user?.id;

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
      profile = await Profile.findOneAndUpdate({ userId }, { avatarUrl }, { new: true });
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
