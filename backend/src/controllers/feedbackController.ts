import { Request, Response } from 'express';
import { Feedback } from '../models/Feedback';

/**
 * Создание новой записи обратной связи
 */
export const createFeedback = async (req: Request, res: Response) => {
  try {
    const { feedbackText, feedbackType, email } = req.body;

    // Проверка наличия текста обратной связи
    if (!feedbackText || feedbackText.trim() === '') {
      return res.status(400).json({ error: 'Текст обратной связи обязателен' });
    }

    // Создание новой записи обратной связи
    const newFeedback = new Feedback({
      feedbackText,
      feedbackType: feedbackType || 'other',
      email: email || null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      date: new Date(),
    });

    // Сохранение в базе данных
    await newFeedback.save();

    // Если в запросе есть ссылка на сокет-сервер, отправляем уведомление о новой обратной связи
    if (req.app.get('io')) {
      req.app.get('io').emit('newFeedback', {
        _id: newFeedback._id,
        feedbackType: newFeedback.feedbackType,
      });
    }

    // Ответ клиенту
    res.status(201).json({
      success: true,
      message: 'Обратная связь успешно отправлена',
      feedbackId: newFeedback._id,
    });
  } catch (error) {
    console.error('Ошибка при создании обратной связи:', error);
    res.status(500).json({ error: 'Ошибка сервера при обработке обратной связи' });
  }
};

/**
 * Получение всех записей обратной связи (только для администраторов)
 */
export const getAllFeedback = async (req: Request, res: Response) => {
  try {
    // Получаем параметры пагинации из запроса
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Получаем параметры сортировки
    const sortField = (req.query.sortField as string) || 'date';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 1 : -1;

    // Фильтрация по типу
    const filterType = req.query.type as string | undefined;
    const filter = filterType ? { feedbackType: filterType } : {};

    // Запрос на получение обратной связи с пагинацией и сортировкой
    const feedback = await Feedback.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit);

    // Получаем общее количество записей для этого фильтра
    const totalCount = await Feedback.countDocuments(filter);

    // Возвращаем результат
    res.status(200).json({
      success: true,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      feedback,
    });
  } catch (error) {
    console.error('Ошибка при получении списка обратной связи:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении списка обратной связи' });
  }
};

/**
 * Получение одной записи обратной связи по ID (для администраторов)
 */
export const getFeedbackById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({ error: 'Запись обратной связи не найдена' });
    }

    res.status(200).json({
      success: true,
      feedback,
    });
  } catch (error) {
    console.error('Ошибка при получении обратной связи:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении обратной связи' });
  }
};

/**
 * Отметка обратной связи как прочитанной
 */
export const markFeedbackAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      {
        isRead: true,
        // Добавляем таймштамп когда была прочитана обратная связь
        $set: { readAt: new Date() },
      },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ error: 'Запись обратной связи не найдена' });
    }

    res.status(200).json({
      success: true,
      message: 'Обратная связь отмечена как прочитанная',
      feedback,
    });
  } catch (error) {
    console.error('Ошибка при обновлении статуса обратной связи:', error);
    res.status(500).json({ error: 'Ошибка сервера при обновлении статуса обратной связи' });
  }
};

/**
 * Добавление заметок администратора к обратной связи
 */
export const addAdminNotes = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    if (!adminNotes || adminNotes.trim() === '') {
      return res.status(400).json({ error: 'Текст заметки не может быть пустым' });
    }

    const feedback = await Feedback.findByIdAndUpdate(id, { adminNotes }, { new: true });

    if (!feedback) {
      return res.status(404).json({ error: 'Запись обратной связи не найдена' });
    }

    res.status(200).json({
      success: true,
      message: 'Заметка администратора добавлена',
      feedback,
    });
  } catch (error) {
    console.error('Ошибка при добавлении заметки администратора:', error);
    res.status(500).json({ error: 'Ошибка сервера при добавлении заметки администратора' });
  }
};
