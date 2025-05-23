import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { UserRole } from '../types/user';
import { config } from '../config';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role: UserRole;
  };
}

// Функция для безопасного доступа к полям user
export const getUser = (req: AuthRequest) => {
  if (!req.user) {
    throw new Error('Пользователь не авторизован');
  }
  return req.user;
};

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.log('Токен не предоставлен');
      return res.status(401).json({ error: 'Пожалуйста, авторизуйтесь' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
        email: string;
        role: UserRole;
      };

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      console.log(`Пользователь аутентифицирован: ${req.user.id}, роль: ${req.user.role}`);
      next();
    } catch (error) {
      console.log('Неверный токен:', error);
      return res.status(401).json({ error: 'Пожалуйста, авторизуйтесь заново' });
    }
  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      console.log('isAdmin: Пользователь не аутентифицирован');
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    if (req.user.role !== UserRole.ADMIN) {
      console.log('isAdmin: Доступ запрещен - не администратор');
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    console.log('isAdmin: Доступ разрешен - пользователь является администратором');
    next();
  } catch (error) {
    console.error('isAdmin: Ошибка при проверке прав:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const checkRole = (allowedRoles: UserRole[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Пожалуйста, авторизуйтесь' });
      }

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(401).json({ error: 'Пользователь не найден' });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: 'Нет прав для выполнения этого действия' });
      }

      next();
    } catch (error) {
      console.error('Ошибка при проверке роли:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  };
};
