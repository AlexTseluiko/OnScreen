import { Request, Response, NextFunction } from 'express';
import { auth, isAdmin, AuthRequest } from './auth';

// Этот файл устарел и оставлен для обратной совместимости
// Используйте импорты из ./auth.ts вместо этого файла

// Для совместимости со старым кодом
export { AuthRequest };
export { getUser } from './auth';

// Перенаправление на новую функцию аутентификации
export const authMiddleware = auth;

// Перенаправление на новую функцию проверки администратора
export const adminMiddleware = isAdmin;

// Middleware для проверки роли врача
export const doctorMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || (req.user.role !== 'doctor' && req.user.role !== 'admin')) {
    res.status(403).json({ error: 'Доступ запрещен. Требуются права врача' });
    return;
  }

  next();
};

// Middleware для проверки, является ли пользователь владельцем ресурса
export const ownerMiddleware = (idField: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const resourceId = req.params[idField];

    if (!req.user) {
      res.status(401).json({ error: 'Необходима авторизация' });
      return;
    }

    if (req.user.role === 'admin') {
      // Администраторы имеют доступ к любому ресурсу
      next();
      return;
    }

    // Для обычных пользователей проверяем соответствие ID
    if (resourceId !== req.user.id) {
      res.status(403).json({ error: 'Доступ запрещен. Вы не являетесь владельцем ресурса' });
      return;
    }

    next();
  };
};
