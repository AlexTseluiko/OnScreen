import { Request, Response } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';
import { UserRole } from '../types/user';
import { createNotification, NotificationType } from '../utils/notifications';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import { JWT_SECRET, JWT_EXPIRY } from '../config';
import { AuthRequest } from '../middleware/auth';

// Логирование переменных окружения SMTP без конфиденциальных данных
console.log('SMTP Configuration:', {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER ? '***настроен***' : '***не настроен***',
  pass: process.env.SMTP_PASS ? '***настроен***' : '***не настроен***',
  from: process.env.SMTP_FROM || '***не настроен***',
});

// Настройка транспорта для отправки email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // для порта 587 используем STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Дополнительные опции для надежного соединения
  connectionTimeout: 10000, // 10 секунд таймаут на соединение
  greetingTimeout: 10000, // 10 секунд таймаут на приветствие
  socketTimeout: 15000, // 15 секунд таймаут на операции сокета
  debug: true, // включаем отладочный режим
  logger: true, // включаем логирование
  tls: {
    // не проверяем сертификат сервера (только для тестирования!)
    rejectUnauthorized: false,
  },
});

// Проверка соединения с SMTP сервером при запуске
transporter.verify(function (error, _success) {
  if (error) {
    console.error('Ошибка соединения с почтовым сервером:', error);
  } else {
    console.log('Соединение с почтовым сервером установлено успешно');
  }
});

// Генерация JWT токена
const generateToken = (
  userId: string,
  email: string,
  role: string = UserRole.PATIENT,
  expiresIn: string | number = JWT_EXPIRY
) => {
  console.log('Генерация токена для пользователя:', userId, 'с ролью:', role);

  // Создаем токен с id, email и role
  const options: SignOptions = { expiresIn: expiresIn as any };
  const token = jwt.sign(
    {
      id: userId,
      email,
      role,
    },
    JWT_SECRET as Secret,
    options
  );

  console.log('Токен успешно создан, длина:', token.length);
  return token;
};

// Генерация refresh token с более длительным сроком действия
const generateRefreshToken = (userId: string) => {
  // Refresh token действует 30 дней
  return generateToken(userId, '', '', '30d');
};

// Регистрация пользователя
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Проверка обязательных полей
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
    }

    // Проверка существования пользователя
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Разделение имени на firstName и lastName
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    // Создание токена верификации
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Создание пользователя
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: UserRole.PATIENT,
      verificationToken,
      isVerified: true,
    });

    // Отправка email для верификации
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Подтверждение регистрации',
        html: `
          <h1>Добро пожаловать!</h1>
          <p>Для подтверждения регистрации перейдите по ссылке:</p>
          <a href="${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}">
            Подтвердить email
          </a>
        `,
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Продолжаем выполнение, даже если отправка email не удалась
    }

    // Создание уведомления
    try {
      await createNotification(
        user._id,
        NotificationType.SYSTEM,
        'Добро пожаловать!',
        'Спасибо за регистрацию.'
      );
    } catch (notificationError) {
      console.error('Notification creation error:', notificationError);
      // Продолжаем выполнение, даже если создание уведомления не удалось
    }

    const token = generateToken(user._id, user.email, user.role);

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
};

// Аутентификация пользователя
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Проверяем наличие всех требуемых полей
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Пожалуйста, заполните все обязательные поля',
      });
    }

    // Проверяем, существует ли пользователь
    const user = await User.findOne({ email }).exec();
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Неверные учетные данные. Пожалуйста, проверьте почту и пароль.',
      });
    }

    // Проверяем, не заблокирован ли пользователь
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Ваш аккаунт заблокирован. Пожалуйста, обратитесь к администратору.',
      });
    }

    // Проверяем правильность пароля
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Неверные учетные данные. Пожалуйста, проверьте почту и пароль.',
      });
    }

    // Генерируем JWT токен
    const token = generateToken(user._id, user.email, user.role);

    // Генерируем refresh token
    const refreshToken = generateRefreshToken(user._id);

    // Добавляем дополнительную информацию о пользователе
    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    };

    // Отправляем ответ
    return res.status(200).json({
      success: true,
      token,
      refreshToken,
      user: userData,
    });
  } catch (error) {
    console.error('Ошибка при входе:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера при аутентификации',
    });
  }
};

// Подтверждение email
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ error: 'Недействительный токен' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    // Создание уведомления
    await createNotification(
      user._id,
      NotificationType.SYSTEM,
      'Email подтвержден',
      'Ваш email успешно подтвержден.'
    );

    res.json({ message: 'Email успешно подтвержден' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Ошибка при подтверждении email' });
  }
};

// Запрос на сброс пароля
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    console.log('Получен запрос на сброс пароля для пользователя:', req.body);

    const { email } = req.body;

    if (!email) {
      console.log('Email не указан в запросе');
      return res.status(400).json({ error: 'Email обязателен' });
    }

    console.log(`Поиск пользователя с email: ${email}`);
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`Пользователь с email ${email} не найден в базе данных`);
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    console.log(`Пользователь найден, ID: ${user._id}`);

    // Генерация токена для сброса пароля
    const resetToken = crypto.randomBytes(32).toString('hex');
    console.log('Сгенерирован токен сброса пароля, длина:', resetToken.length);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 час
    console.log('Установлен токен сброса пароля и срок его действия (1 час)');

    await user.save();
    console.log('Данные пользователя сохранены в базе данных');

    // Формирование URL для сброса пароля
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    console.log('URL для сброса пароля:', resetUrl);

    // Отправка email для сброса пароля
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Сброс пароля',
      html: `
        <h1>Сброс пароля</h1>
        <p>Для сброса пароля перейдите по ссылке:</p>
        <a href="${resetUrl}">
          Сбросить пароль
        </a>
        <p>Ссылка действительна в течение 1 часа.</p>
      `,
    };

    console.log('Подготовлен email с инструкциями по сбросу пароля');
    console.log('Настройки SMTP:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER ? '***настроен***' : '***не настроен***',
      pass: process.env.SMTP_PASS ? '***настроен***' : '***не настроен***',
      from: process.env.SMTP_FROM,
    });

    // В режиме разработки или если есть флаг, пропускаем отправку письма
    const skipEmail = process.env.NODE_ENV === 'development' || process.env.SKIP_EMAIL === 'true';

    if (skipEmail) {
      console.log('РЕЖИМ ТЕСТИРОВАНИЯ: Пропущена реальная отправка email.');
      console.log('Для завершения сброса пароля, используйте URL:', resetUrl);
      console.log('Токен сброса пароля:', resetToken);
    } else {
      try {
        console.log('Отправка email...');
        const info = await transporter.sendMail(mailOptions);
        console.log('Email успешно отправлен, ID сообщения:', info.messageId);
      } catch (emailError) {
        console.error('Ошибка при отправке email:', emailError);
        throw emailError; // Пробрасываем ошибку для обработки в блоке catch
      }
    }

    console.log('Запрос на сброс пароля успешно обработан');
    res.json({ message: 'Инструкции по сбросу пароля отправлены на ваш email' });
  } catch (error: unknown) {
    console.error('Ошибка при запросе сброса пароля:', error);

    // Проверяем, является ли error объектом с сообщением
    if (error && typeof error === 'object') {
      // Безопасно проверяем наличие свойства message
      if ('message' in error) {
        console.error('Детали ошибки:', error.message || 'Нет сообщения об ошибке');
      }

      // Проверяем наличие свойства code и его значение
      if ('code' in error) {
        const errorCode = (error as { code: string }).code;

        if (errorCode === 'ECONNREFUSED') {
          console.error('Не удалось подключиться к почтовому серверу. Проверьте настройки SMTP.');
          return res
            .status(500)
            .json({ error: 'Не удалось отправить email. Проблема с почтовым сервером.' });
        }

        if (errorCode === 'EAUTH') {
          console.error(
            'Ошибка аутентификации на почтовом сервере. Проверьте учетные данные SMTP.'
          );
          return res.status(500).json({ error: 'Ошибка аутентификации на почтовом сервере.' });
        }

        if (errorCode === 'ESOCKET') {
          console.error(
            'Ошибка соединения с почтовым сервером. Проверьте настройки порта и хоста.'
          );
          return res.status(500).json({ error: 'Ошибка соединения с почтовым сервером.' });
        }

        // Дополнительная обработка других кодов ошибок
        console.error(`Код ошибки: ${errorCode}`);
      }
    }

    res.status(500).json({ error: 'Ошибка при запросе сброса пароля' });
  }
};

// Сброс пароля
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Недействительный или истекший токен' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Создание уведомления
    await createNotification(
      user._id,
      NotificationType.SYSTEM,
      'Пароль изменен',
      'Ваш пароль был успешно изменен.'
    );

    res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Ошибка при сбросе пароля' });
  }
};

// Контроллер для смены пароля авторизованного пользователя
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Необходимо указать текущий и новый пароли' });
    }

    // Проверка надежности нового пароля
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Новый пароль должен содержать минимум 6 символов' });
    }

    // Найти пользователя в базе данных
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Проверить, соответствует ли текущий пароль
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Неверный текущий пароль' });
    }

    // Хеширование нового пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Обновить пароль пользователя
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error('Ошибка при смене пароля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Обновление JWT токена
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Отсутствует refresh token',
        code: 'missing_refresh_token',
      });
    }

    try {
      // Проверяем валидность refresh token
      const decoded = jwt.verify(refreshToken, JWT_SECRET as Secret) as {
        id: string;
      };

      // Находим пользователя в БД
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Пользователь не найден',
          code: 'user_not_found',
        });
      }

      if (user.isBlocked) {
        return res.status(403).json({
          success: false,
          message: 'Пользователь заблокирован',
          code: 'user_blocked',
        });
      }

      // Генерируем новые токены
      const newToken = generateToken(user._id, user.email, user.role);
      const newRefreshToken = generateRefreshToken(user._id);

      // Возвращаем новые токены
      return res.status(200).json({
        success: true,
        token: newToken,
        refreshToken: newRefreshToken,
      });
    } catch (jwtError) {
      console.error('Ошибка проверки refresh token:', jwtError);
      return res.status(401).json({
        success: false,
        message: 'Недействительный refresh token',
        code: 'invalid_refresh_token',
      });
    }
  } catch (error) {
    console.error('Ошибка обновления токена:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при обновлении токена',
      code: 'server_error',
    });
  }
};

// Выход пользователя
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    // В JWT аутентификации на стороне сервера нет необходимости
    // хранить токены, так как они хранятся на клиенте
    // Просто подтверждаем успешный выход.
    console.log('Выполнен выход пользователя:', req.user?.id);

    // Возвращаем успешный ответ
    res.status(200).json({
      success: true,
      message: 'Выход выполнен успешно',
    });
  } catch (error) {
    console.error('Ошибка при выходе:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при выходе из системы',
    });
  }
};

// Проверка валидности токена
export const verifyToken = async (req: AuthRequest, res: Response) => {
  try {
    // Если мы дошли до этой точки в коде, значит миддлвэр auth успешно проверил токен
    // и добавил данные пользователя в req.user
    res.status(200).json({
      success: true,
      message: 'Токен действителен',
      data: {
        valid: true,
        user: req.user,
      },
    });
  } catch (error) {
    console.error('Ошибка при проверке токена:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при проверке токена',
    });
  }
};
