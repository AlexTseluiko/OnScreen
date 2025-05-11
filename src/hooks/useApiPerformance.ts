import { useState, useCallback } from 'react';
import { performanceMonitor } from '../utils/performanceMonitor';

/**
 * Типы для статистики API запросов
 */
export interface ApiPerformanceStats {
  endpoint: string;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  successCount: number;
  errorCount: number;
  totalCalls: number;
  lastCall: Date | null;
}

/**
 * Хук для мониторинга производительности запросов к API
 *
 * @returns объект с функциями для анализа производительности API
 */
export function useApiPerformance() {
  const [stats, setStats] = useState<Record<string, ApiPerformanceStats>>({});

  /**
   * Получение всей статистики
   */
  const getAllStats = useCallback(() => {
    const perfStats = performanceMonitor.getMetricStats();

    // Фильтруем только API-запросы
    const apiStats: Record<string, ApiPerformanceStats> = {};

    Object.entries(perfStats).forEach(([name, metric]) => {
      // Фильтруем только записи API
      if (name.startsWith('api:')) {
        const endpoint = name.replace('api:', '');

        // Разделяем на успешные и неуспешные запросы
        const successMetric = perfStats[`${name}:success`] || {
          count: 0,
          avgDuration: 0,
          minDuration: 0,
          maxDuration: 0,
        };
        const errorMetric = perfStats[`${name}:error`] || {
          count: 0,
          avgDuration: 0,
          minDuration: 0,
          maxDuration: 0,
        };

        apiStats[endpoint] = {
          endpoint,
          avgResponseTime: metric.avgDuration,
          minResponseTime: metric.minDuration,
          maxResponseTime: metric.maxDuration,
          successCount: successMetric.count,
          errorCount: errorMetric.count,
          totalCalls: metric.count,
          lastCall: new Date(),
        };
      }
    });

    setStats(apiStats);
    return apiStats;
  }, []);

  /**
   * Получение статистики для конкретного эндпоинта
   */
  const getEndpointStats = useCallback(
    (endpoint: string) => {
      const allStats = getAllStats();
      return allStats[endpoint] || null;
    },
    [getAllStats]
  );

  /**
   * Сброс статистики
   */
  const resetStats = useCallback(() => {
    performanceMonitor.clearMetrics();
    setStats({});
  }, []);

  /**
   * Отслеживание производительности конкретного API запроса
   * Используется для обертывания API функций
   */
  const trackApiCall = useCallback(
    async <T>(endpoint: string, apiCall: () => Promise<T>): Promise<T> => {
      const trackingKey = `api:${endpoint}`;

      try {
        const result = await performanceMonitor.measureAsync(trackingKey, apiCall);
        // Отмечаем успешный запрос
        performanceMonitor.measure(`${trackingKey}:success`, () => {});
        return result;
      } catch (error) {
        // Отмечаем неудачный запрос
        performanceMonitor.measure(`${trackingKey}:error`, () => {});
        throw error;
      }
    },
    []
  );

  /**
   * Получение списка самых медленных запросов
   */
  const getSlowestEndpoints = useCallback(
    (limit = 5) => {
      const allStats = getAllStats();
      return Object.values(allStats)
        .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
        .slice(0, limit);
    },
    [getAllStats]
  );

  /**
   * Получение списка запросов с наибольшим количеством ошибок
   */
  const getMostErrorProneEndpoints = useCallback(
    (limit = 5) => {
      const allStats = getAllStats();
      return Object.values(allStats)
        .sort((a, b) => {
          const errorRateA = a.errorCount / (a.totalCalls || 1);
          const errorRateB = b.errorCount / (b.totalCalls || 1);
          return errorRateB - errorRateA;
        })
        .slice(0, limit);
    },
    [getAllStats]
  );

  return {
    stats,
    getAllStats,
    getEndpointStats,
    resetStats,
    trackApiCall,
    getSlowestEndpoints,
    getMostErrorProneEndpoints,
  };
}

export default useApiPerformance;
