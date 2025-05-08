import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

interface SocketUser {
  userId: string;
  socketId: string;
}

class SocketService {
  private io: Server;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        // Разрешаем подключение с любых источников в режиме разработки
        origin: function(origin, callback) {
          // Для отладки
          console.log('WebSocket CORS check for origin:', origin);
          
          if (!origin || process.env.NODE_ENV === 'development') {
            callback(null, true);
            return;
          }
          
          const allowedOrigins = [
            process.env.CLIENT_URL, 
            'http://localhost:5000', 
            'http://192.168.31.250:5000'
          ].filter(Boolean);
          
          if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
          } else {
            console.warn('WebSocket rejected connection from origin:', origin);
            callback(null, true); // В режиме разработки всё равно пропускаем
          }
        },
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    // Для отладки убираем проверку токена полностью
    this.io.on('connection', (socket) => {
      try {
        console.log('Socket connected with id:', socket.id);
        
        // Используем идентификатор сокета в качестве идентификатора пользователя
        this.connectedUsers.set(socket.id, socket.id);
        
        socket.on('disconnect', () => {
          this.connectedUsers.delete(socket.id);
          console.log(`Socket disconnected: ${socket.id}`);
        });
      } catch (error) {
        console.error('Error in socket connection handler:', error);
        socket.disconnect();
      }
    });
  }

  public sendNotification(userId: string, notification: any) {
    // Для упрощенной модели уведомления могут не дойти к конкретным пользователям
    // Просто вызываем широковещательное уведомление
    this.sendBroadcastNotification(notification);
  }

  public sendBroadcastNotification(notification: any) {
    console.log('Sending broadcast notification to all clients');
    this.io.emit('notification', notification);
  }
}

let socketService: SocketService;

export const initializeSocket = (server: HttpServer) => {
  socketService = new SocketService(server);
  return socketService;
};

export const getSocketService = () => {
  if (!socketService) {
    throw new Error('Socket service not initialized');
  }
  return socketService;
}; 