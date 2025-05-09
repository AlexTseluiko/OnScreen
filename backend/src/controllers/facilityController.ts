import { Request, Response } from 'express';
import { Facility } from '../models/Facility';

// Получение списка учреждений
export const getFacilities = async (req: Request, res: Response) => {
  try {
    const { search, type, services, rating, lat, lng, radius } = req.query;

    const query: any = {};

    // Поиск по тексту
    if (search) {
      query.$text = { $search: search as string };
    }

    // Фильтр по типу
    if (type) {
      query.type = type;
    }

    // Фильтр по услугам
    if (services) {
      const servicesArray = (services as string).split(',');
      query.services = { $all: servicesArray };
    }

    // Фильтр по рейтингу
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Поиск по геолокации
    if (lat && lng && radius) {
      query.coordinates = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)],
          },
          $maxDistance: Number(radius) * 1000, // Конвертируем километры в метры
        },
      };
    }

    const facilities = await Facility.find(query).select('-__v').sort({ rating: -1 });

    res.json(facilities);
  } catch (error) {
    console.error('Get facilities error:', error);
    res.status(500).json({ error: 'Ошибка при получении списка учреждений' });
  }
};

// Получение учреждения по ID
export const getFacilityById = async (req: Request, res: Response) => {
  try {
    const facility = await Facility.findById(req.params.id).select('-__v');

    if (!facility) {
      return res.status(404).json({ error: 'Учреждение не найдено' });
    }

    res.json(facility);
  } catch (error) {
    console.error('Get facility error:', error);
    res.status(500).json({ error: 'Ошибка при получении учреждения' });
  }
};

// Создание учреждения
export const createFacility = async (req: Request, res: Response) => {
  try {
    const facility = await Facility.create(req.body);
    res.status(201).json(facility);
  } catch (error) {
    console.error('Create facility error:', error);
    res.status(500).json({ error: 'Ошибка при создании учреждения' });
  }
};

// Обновление учреждения
export const updateFacility = async (req: Request, res: Response) => {
  try {
    const facility = await Facility.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).select('-__v');

    if (!facility) {
      return res.status(404).json({ error: 'Учреждение не найдено' });
    }

    res.json(facility);
  } catch (error) {
    console.error('Update facility error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении учреждения' });
  }
};

// Удаление учреждения
export const deleteFacility = async (req: Request, res: Response) => {
  try {
    const facility = await Facility.findByIdAndDelete(req.params.id);

    if (!facility) {
      return res.status(404).json({ error: 'Учреждение не найдено' });
    }

    res.json({ message: 'Учреждение успешно удалено' });
  } catch (error) {
    console.error('Delete facility error:', error);
    res.status(500).json({ error: 'Ошибка при удалении учреждения' });
  }
};
