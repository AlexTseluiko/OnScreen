import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/user';

// Типы для расширения интерфейса Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

/**
 * Middleware для проверки роли пользователя
 * @param roles Массив разрешенных ролей
 */
export const checkRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Пользователь не авторизован' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          message: 'Доступ запрещен. У вас нет необходимых прав для выполнения этого действия.'
        });
      }

      next();
    } catch (error) {
      console.error('Ошибка проверки роли пользователя:', error);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  };
}; 