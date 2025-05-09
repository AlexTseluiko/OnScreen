import { Response } from 'express';
import { Clinic } from '../models/Clinic';
import { User } from '../models/User';
import { UserRole } from '../types/user';
import { createNotification, NotificationType } from '../utils/notifications';
import { AuthRequest } from '../middleware/auth';

// Создание клиники
export const createClinic = async (req: AuthRequest, res: Response) => {
  try {
    console.log('Начало создания клиники');

    // Получаем данные клиники из JSON поля
    let clinicData: Record<string, unknown> = {};

    if (req.body.clinicData) {
      try {
        clinicData = JSON.parse(req.body.clinicData);
        console.log('Успешно распарсили clinicData:', clinicData);
      } catch (e) {
        console.error('Ошибка при парсинге clinicData:', e);
        return res.status(400).json({ error: 'Некорректный формат JSON в clinicData' });
      }
    } else {
      console.error('Отсутствует поле clinicData в запросе');
      return res.status(400).json({ error: 'Отсутствует поле clinicData' });
    }

    // Проверяем обязательные поля
    const requiredFields = ['name', 'description', 'address', 'phone', 'email'];
    for (const field of requiredFields) {
      if (!clinicData[field]) {
        console.error(`Отсутствует обязательное поле: ${field}`);
        return res.status(400).json({ error: `Отсутствует обязательное поле: ${field}` });
      }
    }

    // Проверяем вложенные поля адреса
    const addressFields = ['street', 'city', 'state', 'zipCode', 'coordinates'];
    for (const field of addressFields) {
      if (!(clinicData.address as Record<string, unknown>)[field]) {
        console.error(`Отсутствует обязательное поле адреса: ${field}`);
        return res.status(400).json({ error: `Отсутствует обязательное поле адреса: ${field}` });
      }
    }

    // Проверяем координаты
    const coordinates = (clinicData.address as Record<string, unknown>).coordinates as Record<
      string,
      unknown
    >;
    if (!coordinates.latitude || !coordinates.longitude) {
      console.error('Отсутствуют координаты');
      return res.status(400).json({ error: 'Отсутствуют широта или долгота в координатах' });
    }

    // Обрабатываем загруженные фотографии
    const photos = req.files ? (req.files as Express.Multer.File[]).map(file => file.filename) : [];
    console.log('Загруженные фотографии:', photos);

    // Создаем новую клинику
    const clinic = new Clinic({
      ...clinicData,
      photos,
    });

    await clinic.save();

    res.status(201).json(clinic);
  } catch (error) {
    console.error('Ошибка при создании клиники:', error);
    res.status(500).json({
      error:
        'Ошибка при создании клиники: ' +
        (error instanceof Error ? error.message : 'неизвестная ошибка'),
    });
  }
};

// Получение списка клиник
export const getClinics = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-rating',
      search,
      services,
      rating,
      location,
    } = req.query;

    // Проверяем, запрос от админки или от клиента
    const isAdmin = req.originalUrl.includes('/admin') || req.headers['x-is-admin'];
    console.log('Получение клиник. isAdmin:', isAdmin, 'URL:', req.originalUrl);

    const query: Record<string, unknown> = {};

    // Поиск по названию и описанию
    if (search) {
      query.$text = { $search: search as string };
    }

    // Фильтр по услугам
    if (services) {
      query.services = { $in: (services as string).split(',') };
    }

    // Фильтр по рейтингу
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Поиск по местоположению
    if (location) {
      const [latitude, longitude, radius] = (location as string).split(',').map(Number);
      query['address.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: radius * 1000, // радиус в метрах
        },
      };
    }

    const clinics = await Clinic.find(query)
      .sort(sort as string)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('doctors', 'firstName lastName avatar')
      .lean();

    const total = await Clinic.countDocuments(query);

    // Если запрос от админки, отправляем только массив клиник
    if (isAdmin) {
      console.log('Возвращаем массив клиник для админки, найдено:', clinics.length);
      return res.json(clinics);
    }

    // Для клиентского приложения возвращаем объект с пагинацией
    console.log('Возвращаем объект с клиниками для клиента, найдено:', clinics.length);
    res.json({
      clinics,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error('Get clinics error:', error);
    res.status(500).json({ error: 'Ошибка при получении списка клиник' });
  }
};

// Получение клиники по ID
export const getClinicById = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req.params;

    const clinic = await Clinic.findById(clinicId)
      .populate('doctors', 'firstName lastName avatar')
      .lean();

    if (!clinic) {
      return res.status(404).json({ error: 'Клиника не найдена' });
    }

    res.json(clinic);
  } catch (error) {
    console.error('Get clinic by ID error:', error);
    res.status(500).json({ error: 'Ошибка при получении клиники' });
  }
};

// Обновление клиники
export const updateClinic = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req.params;
    console.log('Начало обновления клиники:', clinicId);

    // Получаем данные клиники из JSON поля
    let clinicData: Record<string, unknown> = {};
    if (req.body.clinicData) {
      try {
        clinicData = JSON.parse(req.body.clinicData);
        console.log('Успешно распарсили clinicData:', clinicData);
      } catch (e) {
        console.error('Ошибка при парсинге clinicData:', e);
        return res.status(400).json({ error: 'Некорректный формат JSON в clinicData' });
      }
    } else {
      console.log('Обычные поля формы:', req.body);
      clinicData = req.body;
    }

    // Находим клинику
    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ error: 'Клиника не найдена' });
    }

    // Получаем новые фотографии
    const newPhotos = req.files
      ? (req.files as Express.Multer.File[]).map(file => file.filename)
      : [];
    console.log('Новые фотографии:', newPhotos);

    // Обрабатываем вложенные объекты
    const addressData = clinicData.address as Record<string, unknown>;
    if (addressData) {
      // Если есть новые координаты, обновляем их
      if (addressData.coordinates) {
        clinic.address.coordinates = addressData.coordinates as {
          latitude: number;
          longitude: number;
        };
      }
      // Обновляем остальные поля адреса
      Object.assign(clinic.address, addressData);
    }

    // Обновляем основные поля клиники
    Object.assign(clinic, clinicData);

    // Добавляем новые фотографии
    if (newPhotos.length > 0) {
      clinic.photos = [...clinic.photos, ...newPhotos];
    }

    await clinic.save();

    res.json(clinic);
  } catch (error) {
    console.error('Ошибка при обновлении клиники:', error);
    res.status(500).json({
      error:
        'Ошибка при обновлении клиники: ' +
        (error instanceof Error ? error.message : 'неизвестная ошибка'),
    });
  }
};

// Удаление клиники
export const deleteClinic = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req.params;
    console.log('Начало удаления клиники:', clinicId);

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ error: 'Клиника не найдена' });
    }

    // Проверка прав доступа (временно отключено для тестирования)
    // if (req.user && req.user.role !== UserRole.ADMIN) {
    //   return res.status(403).json({ error: 'У вас нет прав для удаления клиники' });
    // }

    // Удаление фотографий с сервера следует реализовать в продакшене
    // clinic.photos.forEach(photo => deleteFile(photo));

    await Clinic.deleteOne({ _id: clinicId });
    console.log('Клиника успешно удалена');

    res.json({ message: 'Клиника успешно удалена' });
  } catch (error) {
    console.error('Delete clinic error:', error);
    res.status(500).json({
      error:
        'Ошибка при удалении клиники: ' +
        (error instanceof Error ? error.message : 'неизвестная ошибка'),
    });
  }
};

// Добавление врача в клинику
export const addDoctor = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req.params;
    const { doctorId } = req.body;

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ error: 'Клиника не найдена' });
    }

    const doctor = await User.findOne({ _id: doctorId, role: UserRole.DOCTOR });
    if (!doctor) {
      return res.status(404).json({ error: 'Врач не найден' });
    }

    if (clinic.doctors.includes(doctorId)) {
      return res.status(400).json({ error: 'Врач уже работает в этой клинике' });
    }

    clinic.doctors.push(doctorId);
    await clinic.save();

    // Создание уведомления для врача
    await createNotification(
      doctorId,
      NotificationType.SYSTEM,
      'Новое место работы',
      `Вы были добавлены в клинику "${clinic.name}"`,
      { clinicId: clinic._id }
    );

    res.json(clinic);
  } catch (error) {
    console.error('Add doctor error:', error);
    res.status(500).json({ error: 'Ошибка при добавлении врача' });
  }
};

// Удаление врача из клиники
export const removeDoctor = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req.params;
    const { doctorId } = req.body;

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ error: 'Клиника не найдена' });
    }

    if (!clinic.doctors.includes(doctorId)) {
      return res.status(400).json({ error: 'Врач не работает в этой клинике' });
    }

    clinic.doctors = clinic.doctors.filter(id => id.toString() !== doctorId);
    await clinic.save();

    // Создание уведомления для врача
    await createNotification(
      doctorId,
      NotificationType.SYSTEM,
      'Изменение места работы',
      `Вы были удалены из клиники "${clinic.name}"`,
      { clinicId: clinic._id }
    );

    res.json(clinic);
  } catch (error) {
    console.error('Remove doctor error:', error);
    res.status(500).json({ error: 'Ошибка при удалении врача' });
  }
};
