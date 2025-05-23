import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Comment } from '../models/Comment';
import { Article } from '../models/Article';
import { handleError } from '../utils/errorHandler';

// Получение комментариев к статье
export const getArticleComments = async (req: AuthRequest, res: Response) => {
  try {
    const { articleId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const comments = await Comment.find({ article: articleId, parentComment: null })
      .populate('author', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Comment.countDocuments({ article: articleId, parentComment: null });

    // Получаем ответы на комментарии
    const commentIds = comments.map(comment => comment._id);
    const replies = await Comment.find({ parentComment: { $in: commentIds } })
      .populate('author', 'firstName lastName avatar')
      .sort({ createdAt: 1 });

    // Формируем дерево комментариев
    const commentsWithReplies = comments.map(comment => {
      const commentReplies = replies.filter(
        reply => reply.parentComment?.toString() === comment._id.toString()
      );
      return {
        ...comment.toObject(),
        replies: commentReplies,
      };
    });

    res.json({
      comments: commentsWithReplies,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
    });
  } catch (error) {
    handleError(res, 'Ошибка при получении комментариев:', error);
  }
};

// Создание комментария
export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { articleId } = req.params;
    const { content, parentCommentId } = req.body;

    // Проверяем существование статьи
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ error: 'Статья не найдена' });
    }

    // Если это ответ на комментарий, проверяем его существование
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ error: 'Родительский комментарий не найден' });
      }
    }

    const comment = new Comment({
      content,
      author: req.user?.id,
      article: articleId,
      parentComment: parentCommentId,
    });

    await comment.save();
    await comment.populate('author', 'firstName lastName avatar');

    res.status(201).json(comment);
  } catch (error) {
    handleError(res, 'Ошибка при создании комментария:', error);
  }
};

// Обновление комментария
export const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Комментарий не найден' });
    }

    // Проверяем права доступа
    if (comment.author.toString() !== req.user?.id) {
      return res.status(403).json({ error: 'Нет прав для редактирования комментария' });
    }

    comment.content = content;
    await comment.save();

    res.json(comment);
  } catch (error) {
    handleError(res, 'Ошибка при обновлении комментария:', error);
  }
};

// Удаление комментария
export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Комментарий не найден' });
    }

    // Проверяем права доступа
    if (comment.author.toString() !== req.user?.id) {
      return res.status(403).json({ error: 'Нет прав для удаления комментария' });
    }

    // Удаляем все ответы на комментарий
    await Comment.deleteMany({ parentComment: commentId });
    await comment.deleteOne();

    res.json({ message: 'Комментарий успешно удален' });
  } catch (error) {
    handleError(res, 'Ошибка при удалении комментария:', error);
  }
};

// Лайк комментария
export const likeComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Комментарий не найден' });
    }

    comment.likes += 1;
    await comment.save();

    res.json(comment);
  } catch (error) {
    handleError(res, 'Ошибка при лайке комментария:', error);
  }
};
