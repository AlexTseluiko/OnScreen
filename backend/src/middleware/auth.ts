import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { User, UserRole } from '../models/User';
import { UserRole as UserRoleType } from '../types/user';

interface DecodedToken {
  id: string;
  email: string;
  role?: UserRole;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

// Расширяем интерфейс Request для добавления информации о пользователе в req.user
export interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

/**
 * Middleware для проверки аутентификации и добавления информации о пользователе в req.user
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Требуется авторизация' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret') as DecodedToken;
      
      // Проверяем, не заблокирован ли пользователь
      if (decoded.id) {
        const user = await User.findById(decoded.id);
        
        if (!user) {
          return res.status(404).json({ message: 'Пользователь не найден' });
        }
        
        if (user.isBlocked) {
          return res.status(403).json({ 
            message: 'Ваш аккаунт заблокирован. Пожалуйста, обратитесь к администратору.' 
          });
        }
        
        (req as AuthRequest).user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role || UserRoleType.PATIENT
        };
      }
      
      next();
    } catch (error) {
      console.error('Ошибка верификации токена:', error);
      return res.status(401).json({ message: 'Невалидный токен' });
    }
  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    return res.status(500).json({ message: 'Ошибка сервера при аутентификации' });
  }
};

/**
 * Middleware для проверки админских прав
 */
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Не авторизован' });
    }
    
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Доступ запрещен. Требуются права администратора.' });
    }
    
    next();
  } catch (error) {
    console.error('Ошибка проверки прав администратора:', error);
    return res.status(500).json({ message: 'Ошибка сервера при проверке прав администратора' });
  }
};

// Совместимость со старым кодом
export const auth = authenticate;

export const checkRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Пожалуйста, авторизуйтесь.' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'У вас нет доступа к этому ресурсу.' });
      }
      
      next();
    } catch (error) {
      console.error('Ошибка проверки роли:', error);
      return res.status(500).json({ error: 'Ошибка сервера при проверке прав доступа' });
    }
  };
}; 