import { Region } from 'react-native-maps';
import { MedicalFacility } from '../types/medical';
import { Dimensions } from 'react-native';

// Конвертация градусов в радианы
const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// Расчет расстояния между двумя точками в километрах
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Радиус Земли в км
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Получение цвета маркера в зависимости от типа учреждения
export const getMarkerColor = (type: MedicalFacility['type']): string => {
  switch (type) {
    case 'hospital':
      return '#FF3B30'; // Красный
    case 'clinic':
      return '#4CAF50'; // Зеленый
    case 'pharmacy':
      return '#FF9500'; // Оранжевый
    case 'emergency':
      return '#FF2D55'; // Розовый
    default:
      return '#3A7BFF'; // Синий
  }
};

// Получение иконки для маркера
export const getMarkerIcon = (type: MedicalFacility['type']): string => {
  switch (type) {
    case 'hospital':
      return '🏥';
    case 'clinic':
      return '👨‍⚕️';
    case 'pharmacy':
      return '💊';
    case 'emergency':
      return '🚑';
    default:
      return '📍';
  }
};

// Дефолтный регион для Украины (Киев)
export const DEFAULT_REGION: Region = {
  latitude: 50.4501, // Киев
  longitude: 30.5234,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Получение начального региона карты
export const getInitialRegion = (facilities: MedicalFacility[]): Region => {
  if (facilities.length === 0) {
    return DEFAULT_REGION;
  }

  const latitudes = facilities.map(f => f.coordinates.latitude);
  const longitudes = facilities.map(f => f.coordinates.longitude);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: (maxLat - minLat) * 1.5,
    longitudeDelta: (maxLng - minLng) * 1.5,
  };
};

// Фильтрация учреждений по радиусу
export const filterByRadius = (
  facilities: MedicalFacility[],
  userLocation: { latitude: number; longitude: number },
  radius: number
): MedicalFacility[] => {
  return facilities.filter(facility => {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      facility.coordinates.latitude,
      facility.coordinates.longitude
    );
    return distance <= radius / 1000; // Конвертируем метры в километры
  });
};

// Сортировка учреждений по расстоянию
export const sortByDistance = (
  facilities: MedicalFacility[],
  userLocation: { latitude: number; longitude: number }
): MedicalFacility[] => {
  return [...facilities].sort((a, b) => {
    const distanceA = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      a.coordinates.latitude,
      a.coordinates.longitude
    );
    const distanceB = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      b.coordinates.latitude,
      b.coordinates.longitude
    );
    return distanceA - distanceB;
  });
};

// Получение оптимального радиуса отображения для заданных точек
export const getOptimalZoomRadius = (points: { latitude: number; longitude: number }[]): number => {
  if (points.length <= 1) {
    return 1000; // Стандартный радиус в метрах
  }

  const latitudes = points.map(p => p.latitude);
  const longitudes = points.map(p => p.longitude);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  // Рассчитываем диагональное расстояние между точками
  const diagonalDistance = calculateDistance(minLat, minLng, maxLat, maxLng);

  // Радиус в метрах, с коэффициентом для лучшего зума
  return diagonalDistance * 1000 * 1.2;
};

// Расчет приблизительного времени в пути между двумя точками (в минутах)
export const estimateTravelTime = (
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  mode: 'walking' | 'driving' | 'transit' = 'driving'
): number => {
  // Рассчитываем расстояние в километрах
  const distance = calculateDistance(startLat, startLng, endLat, endLng);

  // Средняя скорость в км/ч
  let averageSpeed;
  switch (mode) {
    case 'walking':
      averageSpeed = 5; // 5 км/ч
      break;
    case 'transit':
      averageSpeed = 20; // 20 км/ч
      break;
    case 'driving':
    default:
      averageSpeed = 40; // 40 км/ч в городе
      break;
  }

  // Возвращаем время в минутах
  return Math.ceil((distance / averageSpeed) * 60);
};

// Функция форматирования времени в пути
export const formatTravelTime = (minutes: number): string => {
  if (minutes < 1) {
    return 'менее 1 мин';
  }

  if (minutes < 60) {
    return `${minutes} мин`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} ч`;
  }

  return `${hours} ч ${remainingMinutes} мин`;
};

// Получение адаптивного размера кластера в зависимости от количества точек
export const getClusterSize = (count: number): number => {
  const { width } = Dimensions.get('window');
  const baseSize = width * 0.12; // 12% от ширины экрана

  if (count < 10) {
    return baseSize;
  } else if (count < 50) {
    return baseSize * 1.2;
  } else if (count < 100) {
    return baseSize * 1.4;
  } else {
    return baseSize * 1.6;
  }
};

// Распределение маркеров по категориям для аналитики
export const categorizeMarkersByType = (markers: MedicalFacility[]): Record<string, number> => {
  const categories: Record<string, number> = {
    hospital: 0,
    clinic: 0,
    pharmacy: 0,
    emergency: 0,
    other: 0,
  };

  markers.forEach(marker => {
    if (marker.type in categories) {
      categories[marker.type]++;
    } else {
      categories.other++;
    }
  });

  return categories;
};
