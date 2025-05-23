import express, { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import routes from './routes';
import { initializeSocket } from './utils/socket';
import userRoutes from './routes/userRoutes';
import facilityRoutes from './routes/facilityRoutes';
import screeningRoutes from './routes/screeningRoutes';
import authRoutes from './routes/auth';
import notificationRoutes from './routes/notificationRoutes';
import adminRoutes from './routes/admin';
import articleRoutes from './routes/article';

// Загрузка переменных окружения
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Определяем список разрешенных источников
const allowedOrigins = [
  'http://localhost:19006', // Web версия Expo
  'http://localhost:19000', // Expo dev tools
  'http://localhost:3000', // Web версия React
  'http://localhost:8081', // Metro bundler
  'http://10.0.2.2:19006', // Android эмулятор для web
  'http://10.0.2.2:3000', // Android эмулятор
  'capacitor://localhost', // Capacitor
  'http://localhost', // Локальные тесты
  'http://192.168.31.250:19006', // IP машины для Expo Web
  'http://192.168.31.250:8081', // IP машины для Metro
  'http://192.168.31.250:5000', // IP машины для браузера
  'exp://192.168.31.250:8081', // Expo URL формат
  'exp://192.168.31.250:19000', // Expo DevTools
];

// Настройка CORS для WebSocket
const io = new Server(httpServer, {
  cors: {
    // В режиме разработки разрешаем подключения с любых источников
    origin: function (origin, callback) {
      if (!origin || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Доступ запрещен политикой CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Инициализация WebSocket
initializeSocket(httpServer);

// Middleware для безопасности
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; style-src 'self' 'unsafe-inline' https://www.gstatic.com https://translate.googleapis.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://translate.googleapis.com; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ws: wss: http://*:* https://*:*;"
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Настройка CORS для Express
app.use(
  cors({
    origin: function (origin, callback) {
      // Для разработки разрешаем запросы без origin (например, из Postman)
      if (!origin || process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`Заблокированный запрос от ${origin}`);
        callback(null, true); // В режиме разработки всё равно пропускаем
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../public')));

// Корневой маршрут
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Используем все маршруты через единый роутер
app.use('/api', routes);

// Подключение маршрутов API
app.use('/api/users', userRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/screening', screeningRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Алиасы маршрутов для совместимости с клиентским кодом
app.use('/api/clinics', facilityRoutes);
app.use('/api/screening-programs', screeningRoutes);
app.use(
  '/api/feedback',
  express
    .Router()
    .get('/', (req, res) =>
      res.status(200).json({ feedback: [], page: 1, totalPages: 1, totalCount: 0 })
    )
    .patch('/:id/read', (req, res) => res.status(200).json({ success: true }))
    .patch('/:id/note', (req, res) => res.status(200).json({ success: true }))
);
app.use('/api/articles', articleRoutes);

// Обработка маршрутов, которые не существуют
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Обработка ошибок - используем тип ErrorRequestHandler из Express
const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  console.error('Ошибка сервера:', err);
  res.status(500).json({ error: 'Что-то пошло не так!' });
};

app.use(errorHandler);

// Подключение к MongoDB
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = parseInt(process.env.PORT || '5000', 10);
    // Указываем '0.0.0.0', чтобы сервер слушал на всех сетевых интерфейсах
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on all interfaces, port ${PORT}`);
      // Показываем все доступные адреса для подключения
      // Импортируем os через import
      import('os').then(os => {
        const networkInterfaces = os.networkInterfaces();
        console.log('Доступные адреса для подключения:');
        for (const interfaceName in networkInterfaces) {
          const interfaces = networkInterfaces[interfaceName];
          if (interfaces) {
            interfaces.forEach((iface: { family: string; internal: boolean; address: string }) => {
              if (iface.family === 'IPv4' && !iface.internal) {
                console.log(`http://${iface.address}:${PORT}`);
              }
            });
          }
        }
        console.log(`Access via http://localhost:${PORT} or http://<your-ip-address>:${PORT}`);
      });
    });
  })
  .catch(error => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Обработка необработанных исключений
process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', error => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});
