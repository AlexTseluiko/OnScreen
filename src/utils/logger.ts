import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { getDeviceInfo } from './deviceInfo';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  deviceInfo?: any;
}

class Logger {
  private static instance: Logger;
  private logFile: string;
  private maxLogSize: number = 5 * 1024 * 1024; // 5MB
  private isInitialized: boolean = false;

  private constructor() {
    this.logFile = `${FileSystem.documentDirectory}logs/app.log`;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private async initialize() {
    if (this.isInitialized) return;

    try {
      const dir = `${FileSystem.documentDirectory}logs`;
      const dirInfo = await FileSystem.getInfoAsync(dir);

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }

      const fileInfo = await FileSystem.getInfoAsync(this.logFile);
      if (!fileInfo.exists) {
        await FileSystem.writeAsStringAsync(this.logFile, '');
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize logger:', error);
    }
  }

  private async rotateLogs() {
    try {
      const fileInfo = await FileSystem.getInfoAsync(this.logFile);
      if (fileInfo.exists && fileInfo.size > this.maxLogSize) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = `${FileSystem.documentDirectory}logs/app-${timestamp}.log`;
        await FileSystem.moveAsync({
          from: this.logFile,
          to: backupFile,
        });
        await FileSystem.writeAsStringAsync(this.logFile, '');
      }
    } catch (error) {
      console.error('Failed to rotate logs:', error);
    }
  }

  private async writeLog(entry: LogEntry) {
    try {
      await this.initialize();
      await this.rotateLogs();

      const logString = JSON.stringify(entry) + '\n';
      const existingContent = await FileSystem.readAsStringAsync(this.logFile);
      await FileSystem.writeAsStringAsync(this.logFile, existingContent + logString, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  public async log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      deviceInfo: await getDeviceInfo(),
    };

    // Вывод в консоль для разработки
    if (__DEV__) {
      console.log(`[${level.toUpperCase()}] ${message}`, data || '');
    }

    await this.writeLog(entry);
  }

  public async info(message: string, data?: any) {
    await this.log('info', message, data);
  }

  public async warn(message: string, data?: any) {
    await this.log('warn', message, data);
  }

  public async error(message: string, data?: any) {
    await this.log('error', message, data);
  }

  public async debug(message: string, data?: any) {
    if (__DEV__) {
      await this.log('debug', message, data);
    }
  }

  public async getLogs(): Promise<string> {
    try {
      await this.initialize();
      return await FileSystem.readAsStringAsync(this.logFile);
    } catch (error) {
      console.error('Failed to read logs:', error);
      return '';
    }
  }

  public async clearLogs() {
    try {
      await this.initialize();
      await FileSystem.writeAsStringAsync(this.logFile, '');
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }
}

export const logger = Logger.getInstance();
