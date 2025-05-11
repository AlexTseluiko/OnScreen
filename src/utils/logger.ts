import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

// Определяем типы для логов
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export type LogData = Record<string, unknown>;
export type LogMessage = string | Error | LogData;

interface DeviceInfo {
  platform: string;
  version: string;
  model?: string;
  brand?: string;
  manufacturer?: string;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: LogMessage;
  data?: LogData;
  deviceInfo?: DeviceInfo;
}

interface LoggerConfig {
  maxLogSize: number;
  logRetentionDays: number;
  logLevel: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  logFilePath: string;
}

export class Logger {
  private static instance: Logger;
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private isProcessing: boolean = false;
  private lastCleanup: number = Date.now();
  private readonly CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 часа
  private logFile: string;
  private maxLogSize: number = 5 * 1024 * 1024; // 5MB
  private isInitialized: boolean = false;
  private isWeb: boolean;

  private constructor() {
    this.logFile = `${FileSystem.documentDirectory}logs/app.log`;
    this.isWeb = Platform.OS === 'web';
    this.config = {
      maxLogSize: 5 * 1024 * 1024, // 5MB
      logRetentionDays: 7,
      logLevel: 'info',
      enableConsole: true,
      enableFile: true,
      logFilePath: `${FileSystem.documentDirectory}logs/app.log`,
    };
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isWeb) {
      console.log('Logger initialized for web platform');
      return;
    }

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

  public async rotateLogs(): Promise<void> {
    if (this.isWeb) {
      return;
    }

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

  private async writeToFile(entry: LogEntry): Promise<void> {
    if (!this.config.enableFile || this.isWeb) return;

    try {
      const logDir = this.config.logFilePath.substring(0, this.config.logFilePath.lastIndexOf('/'));
      const dirInfo = await FileSystem.getInfoAsync(logDir);

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(logDir, { intermediates: true });
      }

      const logEntry = this.formatLogEntry(entry);
      const existingContent = await FileSystem.readAsStringAsync(this.config.logFilePath).catch(
        () => ''
      );
      await FileSystem.writeAsStringAsync(
        this.config.logFilePath,
        existingContent + logEntry + '\n',
        {
          encoding: FileSystem.EncodingType.UTF8,
        }
      );

      await this.cleanupOldLogs();
    } catch (error) {
      console.error('Ошибка записи в файл логов:', error);
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    const message = entry.message instanceof Error ? entry.message.message : entry.message;
    const data = entry.data ? JSON.stringify(entry.data) : '';
    return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${message} ${data}`;
  }

  private async cleanupOldLogs(): Promise<void> {
    const now = Date.now();
    if (now - this.lastCleanup < this.CLEANUP_INTERVAL) return;

    try {
      const fileInfo = await FileSystem.getInfoAsync(this.config.logFilePath);
      if (!fileInfo.exists) return;

      if (fileInfo.size > this.config.maxLogSize) {
        const content = await FileSystem.readAsStringAsync(this.config.logFilePath);
        const lines = content.split('\n');
        const cutoffDate = new Date(now - this.config.logRetentionDays * 24 * 60 * 60 * 1000);
        const newLines = lines.filter(line => {
          const match = line.match(/\[(.*?)\]/);
          if (!match) return false;
          const timestamp = new Date(match[1]);
          return timestamp > cutoffDate;
        });

        await FileSystem.writeAsStringAsync(this.config.logFilePath, newLines.join('\n') + '\n');
      }

      this.lastCleanup = now;
    } catch (error) {
      console.error('Ошибка очистки старых логов:', error);
    }
  }

  public log(level: LogLevel, message: LogMessage, data?: LogData): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };

    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    void this.writeToFile(entry);
  }

  private logToConsole(entry: LogEntry): void {
    const message = entry.message instanceof Error ? entry.message.message : entry.message;
    const data = entry.data ? JSON.stringify(entry.data) : '';

    switch (entry.level) {
      case 'error':
        console.error(`[${entry.timestamp}] ${message}`, data);
        break;
      case 'warn':
        console.warn(`[${entry.timestamp}] ${message}`, data);
        break;
      case 'debug':
        console.debug(`[${entry.timestamp}] ${message}`, data);
        break;
      default:
        console.log(`[${entry.timestamp}] ${message}`, data);
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

  public error(message: LogMessage, data?: LogData): void {
    this.log('error', message, data);
  }

  public warn(message: LogMessage, data?: LogData): void {
    this.log('warn', message, data);
  }

  public info(message: LogMessage, data?: LogData): void {
    this.log('info', message, data);
  }

  public debug(message: LogMessage, data?: LogData): void {
    this.log('debug', message, data);
  }
}

export const logger = Logger.getInstance();
