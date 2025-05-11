import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { logger } from './logger';
import { cache } from './cache';

interface LogData {
  [key: string]: unknown;
}

interface NetworkState extends LogData {
  isConnected: boolean;
  type: string;
  isInternetReachable: boolean | null;
}

interface PendingRequest extends LogData {
  id: string;
  method: string;
  url: string;
  data?: unknown;
  timestamp: number;
}

export interface NetworkResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export const handleNetworkError = (error: Error): void => {
  console.error('Network error:', error.message);
};

export const parseResponse = <T = unknown>(response: Response): Promise<T> => {
  return response.json();
};

class NetworkManager {
  private static instance: NetworkManager;
  private networkState: NetworkState = {
    isConnected: true,
    type: 'unknown',
    isInternetReachable: true,
  };
  private pendingRequests: PendingRequest[] = [];
  private readonly maxPendingRequests = 100;
  private networkListener: (() => void) | null = null;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  private async initialize() {
    // Получаем начальное состояние сети
    const state = await NetInfo.fetch();
    this.updateNetworkState(state);

    // Подписываемся на изменения состояния сети
    this.networkListener = NetInfo.addEventListener(state => {
      this.updateNetworkState(state);
    });
  }

  private updateNetworkState(state: NetInfoState) {
    const newState: NetworkState = {
      isConnected: state.isConnected ?? false,
      type: state.type,
      isInternetReachable: state.isInternetReachable,
    };

    const wasOffline = !this.networkState.isConnected;
    const isNowOnline = newState.isConnected;

    this.networkState = newState;

    // Логируем изменение состояния сети
    logger.info('Network state changed', newState);

    // Если сеть восстановлена, пытаемся отправить отложенные запросы
    if (wasOffline && isNowOnline) {
      this.processPendingRequests();
    }
  }

  public isOnline(): boolean {
    return this.networkState.isConnected && this.networkState.isInternetReachable === true;
  }

  public getNetworkType(): string {
    return this.networkState.type;
  }

  public async addPendingRequest(request: Omit<PendingRequest, 'id' | 'timestamp'>) {
    const pendingRequest: PendingRequest = {
      ...request,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
    } as PendingRequest;

    this.pendingRequests.push(pendingRequest);

    // Ограничиваем количество отложенных запросов
    if (this.pendingRequests.length > this.maxPendingRequests) {
      this.pendingRequests.shift();
    }

    // Сохраняем отложенные запросы в кэш
    await cache.set('pending_requests', this.pendingRequests);
  }

  private async processPendingRequests() {
    if (!this.isOnline()) return;

    const requests = [...this.pendingRequests];
    this.pendingRequests = [];

    for (const request of requests) {
      try {
        // Здесь должна быть логика отправки запроса
        logger.info('Processing pending request', request);

        // После успешной отправки удаляем запрос из кэша
        await cache.remove(`pending_requests_${request.id}`);
      } catch (error) {
        logger.error('Failed to process pending request', { request, error });
        // Если запрос не удался, добавляем его обратно в очередь
        this.pendingRequests.push(request);
      }
    }

    // Обновляем кэш отложенных запросов
    await cache.set('pending_requests', this.pendingRequests);
  }

  public async getPendingRequests(): Promise<PendingRequest[]> {
    return [...this.pendingRequests];
  }

  public async clearPendingRequests() {
    this.pendingRequests = [];
    await cache.remove('pending_requests');
  }

  public dispose() {
    if (this.networkListener) {
      this.networkListener();
      this.networkListener = null;
    }
  }
}

export const networkManager = NetworkManager.getInstance();
