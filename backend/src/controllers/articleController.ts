import { Response } from 'express';
import { Article } from '../models/Article';
import mongoose from 'mongoose';
import { UserRole } from '../types/user';
import { AuthRequest } from '../middleware/auth';

// Получение списка статей
export const getArticles = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const query: Record<string, unknown> = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const articles = await Article.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('author', 'firstName lastName avatar');

    const total = await Article.countDocuments(query);

    res.json({
      articles,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error('Ошибка при получении статей:', error);
    res.status(500).json({
      error:
        'Ошибка при получении статей: ' +
        (error instanceof Error ? error.message : 'неизвестная ошибка'),
    });
  }
};

// Получение статьи по ID
export const getArticleById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Некорректный ID статьи' });
    }

    const article = await Article.findById(id).populate('author', 'firstName lastName avatar');

    if (!article) {
      return res.status(404).json({ message: 'Статья не найдена' });
    }

    // Проверка доступа к неопубликованным статьям
    if (
      !article.published &&
      req.user &&
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.DOCTOR
    ) {
      return res.status(403).json({ message: 'У вас нет доступа к этой статье' });
    }

    res.status(200).json(article);
  } catch (error) {
    console.error('Error getting article:', error);
    res.status(500).json({ message: 'Ошибка при получении статьи' });
  }
};

// Создание новой статьи
export const createArticle = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, category, tags, imageUrl, published } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ message: 'Пожалуйста, заполните все обязательные поля' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    const newArticle = new Article({
      title,
      content,
      author: req.user.id,
      category,
      tags: tags || [],
      imageUrl,
      published: published || false,
      publishedAt: published ? new Date() : null,
    });

    const savedArticle = await newArticle.save();

    res.status(201).json(savedArticle);
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ message: 'Ошибка при создании статьи' });
  }
};

// Обновление статьи
export const updateArticle = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags, imageUrl, published } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Некорректный ID статьи' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ message: 'Статья не найдена' });
    }

    // Проверка прав на редактирование
    if (req.user.role !== UserRole.ADMIN && article.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'У вас нет прав на редактирование этой статьи' });
    }

    const updateData: Record<string, unknown> = {
      title: title || article.title,
      content: content || article.content,
      category: category || article.category,
      tags: tags || article.tags,
      imageUrl: imageUrl !== undefined ? imageUrl : article.imageUrl,
    };

    // Обновление статуса публикации
    if (published !== undefined && published !== article.published) {
      updateData.published = published;

      // Если статья публикуется, установить дату публикации
      if (published && !article.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const updatedArticle = await Article.findByIdAndUpdate(id, updateData, { new: true }).populate(
      'author',
      'firstName lastName avatar'
    );

    res.status(200).json(updatedArticle);
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ message: 'Ошибка при обновлении статьи' });
  }
};

// Удаление статьи
export const deleteArticle = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Некорректный ID статьи' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ message: 'Статья не найдена' });
    }

    // Проверка прав на удаление
    if (req.user.role !== UserRole.ADMIN && article.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'У вас нет прав на удаление этой статьи' });
    }

    await Article.findByIdAndDelete(id);

    res.status(200).json({ message: 'Статья успешно удалена' });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ message: 'Ошибка при удалении статьи' });
  }
};
