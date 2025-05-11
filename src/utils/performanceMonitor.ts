/**
 * Утилита для мониторинга производительности приложения
 */
import { PerformanceObserver, PerformanceEntry } from 'react-native-performance';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface PerformanceData {
  metrics: PerformanceMetric[];
  context: Record<string, unknown>;
}

export const measurePerformance = <T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> => {
  const startTime = Date.now();
  return fn().finally(() => {
    const duration = Date.now() - startTime;
    logPerformanceMetric(name, duration, 'ms', metadata);
  });
};

export const logPerformanceMetric = (
  name: string,
  value: number,
  unit?: string,
  metadata?: Record<string, unknown>
): void => {
  // Логируем метрику производительности
  console.log(`Performance metric: ${name} = ${value}${unit ? ` ${unit}` : ''}`, metadata);
};

interface PerformanceMetrics {
  timestamp: number;
  duration: number;
  name: string;
  type: string;
  details?: Record<string, unknown>;
}

interface PerformanceConfig {
  enabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  threshold: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private config: PerformanceConfig;
  private metrics: PerformanceMetrics[] = [];
  private observer: PerformanceObserver | null = null;

  private constructor() {
    this.config = {
      enabled: true,
      logLevel: 'info',
      threshold: 1000,
    };
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  public configure(config: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public startMonitoring(): void {
    if (!this.config.enabled) return;

    this.observer = new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach((entry: PerformanceEntry) => {
        this.recordMetric({
          timestamp: entry.startTime,
          duration: entry.duration,
          name: entry.name,
          type: entry.entryType,
        });
      });
    });

    this.observer.observe({ entryTypes: ['measure', 'mark'] });
  }

  public stopMonitoring(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  private recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    this.checkThreshold(metric);
  }

  private checkThreshold(metric: PerformanceMetrics): void {
    if (metric.duration > this.config.threshold) {
      this.log(`Performance warning: ${metric.name} took ${metric.duration}ms`, 'warn');
    }
  }

  private log(message: string, level: PerformanceConfig['logLevel']): void {
    if (this.config.logLevel === level) {
      console[level](message);
    }
  }

  public getMetrics(): PerformanceMetrics[] {
    return this.metrics;
  }

  public clearMetrics(): void {
    this.metrics = [];
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
