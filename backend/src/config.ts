import dotenv from 'dotenv';

// Загрузка переменных окружения из .env файла
dotenv.config();

// Константы для подключения к базе данных
export const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medical-app';

// Константы для JWT
export const JWT_SECRET = process.env.JWT_SECRET || 'your-default-jwt-secret';
export const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

// Настройки сервера
export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
export const NODE_ENV = process.env.NODE_ENV || 'development';

// Настройки CORS
export const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Проверка наличия необходимых переменных окружения
const requiredEnvVars = ['JWT_SECRET'];

if (NODE_ENV === 'production') {
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingVars.length > 0) {
    console.error(
      `Missing required environment variables in production: ${missingVars.join(', ')}`
    );
    process.exit(1);
  }
}

// Настройки электронной почты
export const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || '',
  port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
};

// Базовый URL для frontend
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5000';

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/onscreen',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  nodeEnv: process.env.NODE_ENV || 'development',
};
