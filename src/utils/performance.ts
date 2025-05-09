import { logger } from './logger';

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 1000;

  private constructor() {
    // В браузере нет PerformanceObserver для measure, поэтому просто инициализируем монитор
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }
    logger.debug('Performance metric:', metric);
  }

  public startMeasure(name: string): void {
    performance.mark(`${name}-start`);
  }

  public endMeasure(name: string, startTime: number): void {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    const duration = performance.now() - startTime;
    this.addMetric({
      name,
      duration,
      timestamp: startTime,
    });
  }

  public async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    try {
      return await fn();
    } finally {
      this.endMeasure(name, startTime);
    }
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public clearMetrics(): void {
    this.metrics = [];
  }

  public getAverageMetrics(): Record<string, number> {
    const averages: Record<string, { total: number; count: number }> = {};

    this.metrics.forEach(metric => {
      if (!averages[metric.name]) {
        averages[metric.name] = { total: 0, count: 0 };
      }
      averages[metric.name].total += metric.duration;
      averages[metric.name].count += 1;
    });

    return Object.entries(averages).reduce(
      (acc, [name, { total, count }]) => {
        acc[name] = total / count;
        return acc;
      },
      {} as Record<string, number>
    );
  }

  public getMetricsByTimeRange(startTime: number, endTime: number): PerformanceMetric[] {
    return this.metrics.filter(
      metric => metric.timestamp >= startTime && metric.timestamp <= endTime
    );
  }

  public recordApiCall(url: string, method: string, duration: number): void {
    this.addMetric({
      name: `api_${method}_${url}`,
      duration,
      timestamp: performance.now(),
      metadata: {
        url,
        method,
        type: 'api_call',
      },
    });
  }

  public recordApiError(url: string, method: string, error: unknown): void {
    this.addMetric({
      name: `api_error_${method}_${url}`,
      duration: 0,
      timestamp: performance.now(),
      metadata: {
        url,
        method,
        type: 'api_error',
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
