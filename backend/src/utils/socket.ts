import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { UserRole } from '../types/user';
import { INotification } from '../models/Notification';

interface SocketUser {
  userId: string;
  role: UserRole;
  socketId: string;
}

class SocketManager {
  private io: Server;
  private connectedUsers: Map<string, SocketUser>;

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.connectedUsers = new Map();

    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', socket => {
      console.log('New client connected:', socket.id);

      socket.on('authenticate', (data: { userId: string; role: UserRole }) => {
        this.connectedUsers.set(socket.id, {
          userId: data.userId,
          role: data.role,
          socketId: socket.id,
        });
        console.log('User authenticated:', data.userId);
      });

      socket.on('disconnect', () => {
        this.connectedUsers.delete(socket.id);
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  public sendNotification(userId: string, notification: INotification): void {
    const userSocket = Array.from(this.connectedUsers.values()).find(
      user => user.userId === userId
    );

    if (userSocket) {
      this.io.to(userSocket.socketId).emit('notification', notification);
    }
  }

  public broadcastNotification(notification: INotification, roles?: UserRole[]): void {
    if (roles) {
      const targetUsers = Array.from(this.connectedUsers.values()).filter(user =>
        roles.includes(user.role)
      );
      targetUsers.forEach(user => {
        this.io.to(user.socketId).emit('notification', notification);
      });
    } else {
      this.io.emit('notification', notification);
    }
  }
}

let socketManager: SocketManager;

export const initializeSocket = (server: HttpServer): void => {
  socketManager = new SocketManager(server);
};

export const getSocketManager = (): SocketManager => {
  if (!socketManager) {
    throw new Error('Socket manager not initialized');
  }
  return socketManager;
};

export default SocketManager;
