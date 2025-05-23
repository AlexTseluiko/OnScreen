import { Server } from 'socket.io';
import { createServer } from 'http';
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

  constructor(server: ReturnType<typeof createServer>) {
    this.io = new Server(server);

    this.connectedUsers = new Map();

    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', socket => {
      console.log('Socket connected:', socket.id);

      socket.on('authenticate', (data: { userId: string; role: UserRole }) => {
        this.connectedUsers.set(socket.id, {
          userId: data.userId,
          role: data.role,
          socketId: socket.id,
        });
        console.log('User authenticated:', data.userId);
      });

      socket.on('subscribe', (userId: string) => {
        socket.join(`user:${userId}`);
        console.log(`User ${userId} subscribed to notifications`);
      });

      socket.on('unsubscribe', (userId: string) => {
        socket.leave(`user:${userId}`);
        console.log(`User ${userId} unsubscribed from notifications`);
      });

      socket.on('disconnect', () => {
        this.connectedUsers.delete(socket.id);
        console.log('Socket disconnected:', socket.id);
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

export const initializeSocket = (httpServer: ReturnType<typeof createServer>): void => {
  socketManager = new SocketManager(httpServer);
};

export const getSocketManager = (): SocketManager => {
  if (!socketManager) {
    throw new Error('Socket manager not initialized');
  }
  return socketManager;
};

export default SocketManager;
