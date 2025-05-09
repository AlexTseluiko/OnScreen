import { Region } from 'react-native-maps';
import { MedicalFacility } from '../types/medical';

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

// Получение начального региона карты
export const getInitialRegion = (facilities: MedicalFacility[]): Region => {
  if (facilities.length === 0) {
    return {
      latitude: 55.7558, // Москва
      longitude: 37.6173,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
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
