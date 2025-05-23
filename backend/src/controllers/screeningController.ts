import { Request, Response } from 'express';
import ScreeningProgram, { ScreeningProgramDocument } from '../models/ScreeningProgram';
import ScreeningAppointment from '../models/ScreeningAppointment';
import { Types } from 'mongoose';

// Определяем тип для ошибок
interface ValidationError extends Error {
  name: string;
  message: string;
}

/**
 * Получить список всех скрининговых программ
 */
export const getAllPrograms = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [programs, total] = await Promise.all([
      ScreeningProgram.find().sort({ category: 1, title: 1 }).skip(skip).limit(Number(limit)),
      ScreeningProgram.countDocuments(),
    ]);

    res.status(200).json({
      programs,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error('Ошибка при получении скрининговых программ:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении скрининговых программ' });
  }
};

/**
 * Получить скрининговую программу по ID
 */
export const getProgramById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Некорректный ID программы' });
      return;
    }

    const program = await ScreeningProgram.findById(id);

    if (!program) {
      res.status(404).json({ error: 'Программа не найдена' });
      return;
    }

    res.status(200).json(program);
  } catch (error) {
    console.error(`Ошибка при получении скрининговой программы по ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Ошибка сервера при получении скрининговой программы' });
  }
};

/**
 * Создать новую скрининговую программу
 */
export const createProgram = async (req: Request, res: Response): Promise<void> => {
  try {
    const programData = req.body;

    // Создаем новую программу
    const newProgram = new ScreeningProgram(programData);
    await newProgram.save();

    res.status(201).json(newProgram);
  } catch (error) {
    console.error('Ошибка при создании скрининговой программы:', error);

    if ((error as ValidationError).name === 'ValidationError') {
      res.status(400).json({
        error: 'Ошибка валидации данных программы',
        details: (error as ValidationError).message,
      });
    } else {
      res.status(500).json({ error: 'Ошибка сервера при создании скрининговой программы' });
    }
  }
};

/**
 * Обновить существующую скрининговую программу
 */
export const updateProgram = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const programData = req.body;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Некорректный ID программы' });
      return;
    }

    // Проверяем, существует ли программа
    const existingProgram = await ScreeningProgram.findById(id);

    if (!existingProgram) {
      res.status(404).json({ error: 'Программа не найдена' });
      return;
    }

    // Обновляем программу
    const updatedProgram = await ScreeningProgram.findByIdAndUpdate(id, programData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedProgram);
  } catch (error) {
    console.error(`Ошибка при обновлении скрининговой программы с ID ${req.params.id}:`, error);

    if ((error as ValidationError).name === 'ValidationError') {
      res.status(400).json({
        error: 'Ошибка валидации данных программы',
        details: (error as ValidationError).message,
      });
    } else {
      res.status(500).json({ error: 'Ошибка сервера при обновлении скрининговой программы' });
    }
  }
};

/**
 * Удалить скрининговую программу
 */
export const deleteProgram = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Некорректный ID программы' });
      return;
    }

    // Проверяем, существует ли программа
    const existingProgram = await ScreeningProgram.findById(id);

    if (!existingProgram) {
      res.status(404).json({ error: 'Программа не найдена' });
      return;
    }

    // Удаляем программу
    await ScreeningProgram.findByIdAndDelete(id);

    // Также можно удалить все связанные записи на скрининг
    // await ScreeningAppointment.deleteMany({ programId: id });

    res.status(200).json({ message: 'Программа успешно удалена' });
  } catch (error) {
    console.error(`Ошибка при удалении скрининговой программы с ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Ошибка сервера при удалении скрининговой программы' });
  }
};

/**
 * Планирование скрининга
 */
export const scheduleScreening = async (req: Request, res: Response): Promise<void> => {
  try {
    const { programId, date, userId } = req.body;

    // Проверяем входные данные
    if (!programId || !date || !userId) {
      res.status(400).json({ error: 'Отсутствуют обязательные данные (programId, date, userId)' });
      return;
    }

    if (!Types.ObjectId.isValid(programId) || !Types.ObjectId.isValid(userId)) {
      res.status(400).json({ error: 'Некорректный ID программы или пользователя' });
      return;
    }

    // Проверяем, существует ли программа
    const program = await ScreeningProgram.findById(programId);

    if (!program) {
      res.status(404).json({ error: 'Программа не найдена' });
      return;
    }

    // Создаем запись на скрининг
    const appointment = new ScreeningAppointment({
      programId,
      userId,
      date: new Date(date),
      status: 'scheduled',
    });

    await appointment.save();

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Ошибка при планировании скрининга:', error);

    if ((error as ValidationError).name === 'ValidationError') {
      res.status(400).json({
        error: 'Ошибка валидации данных записи',
        details: (error as ValidationError).message,
      });
    } else {
      res.status(500).json({ error: 'Ошибка сервера при планировании скрининга' });
    }
  }
};

/**
 * Получить все записи на скрининг пользователя
 */
export const getUserAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!Types.ObjectId.isValid(userId)) {
      res.status(400).json({ error: 'Некорректный ID пользователя' });
      return;
    }

    const appointments = await ScreeningAppointment.find({ userId })
      .populate('programId')
      .sort({ date: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    console.error(
      `Ошибка при получении записей на скрининг для пользователя ${req.params.userId}:`,
      error
    );
    res.status(500).json({ error: 'Ошибка сервера при получении записей на скрининг' });
  }
};
