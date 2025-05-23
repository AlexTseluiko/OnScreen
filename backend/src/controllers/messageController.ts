import { Response } from 'express';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { UserRole } from '../types/user';
import { createNotification, NotificationType } from '../utils/notifications';
import { AuthRequest, getUser } from '../middleware/auth';

// Отправка нового сообщения
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const senderId = getUser(req).id;
    const { recipientId, content } = req.body;

    if (!recipientId || !content) {
      return res.status(400).json({ error: 'Необходимо указать получателя и текст сообщения' });
    }

    // Проверяем существование получателя
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: 'Получатель не найден' });
    }

    // Создаем новое сообщение
    const newMessage = new Message({
      sender: senderId,
      recipient: recipientId,
      content,
      createdAt: new Date(),
      read: false,
    });

    await newMessage.save();

    // Отправляем уведомление получателю
    const sender = await User.findById(senderId);
    await createNotification(
      recipientId,
      NotificationType.MESSAGE,
      'Новое сообщение',
      `У вас новое сообщение от ${sender?.firstName || ''} ${sender?.lastName || ''}`,
      { messageId: newMessage._id }
    );

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
    res.status(500).json({ error: 'Ошибка сервера при отправке сообщения' });
  }
};

// Получение истории сообщений с другим пользователем
export const getMessageHistory = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = getUser(req).id;
    const { userId } = req.params;

    // Для обычных пользователей разрешаем видеть только собственные сообщения
    // Для докторов и админов разрешаем просматривать сообщения других пользователей
    const currentUser = await User.findById(currentUserId);
    if (
      currentUserId !== userId &&
      currentUser?.role !== UserRole.DOCTOR &&
      currentUser?.role !== UserRole.ADMIN
    ) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    // Поиск сообщений, где текущий пользователь является отправителем или получателем
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Ошибка при получении истории сообщений:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении истории сообщений' });
  }
};

// Отметка сообщений как прочитанных
export const markMessagesAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const recipientId = getUser(req).id;
    const { senderId } = req.params;

    // Обновляем статус всех непрочитанных сообщений от данного отправителя
    const result = await Message.updateMany(
      { sender: senderId, recipient: recipientId, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    res.json({ message: `Отмечено прочитанными: ${result.modifiedCount} сообщений` });
  } catch (error) {
    console.error('Ошибка при отметке сообщений как прочитанных:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получение непрочитанных сообщений
export const getUnreadMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUser(req).id;

    const unreadMessages = await Message.find({
      recipient: userId,
      read: false,
    }).sort({ createdAt: -1 });

    res.json(unreadMessages);
  } catch (error) {
    console.error('Ошибка при получении непрочитанных сообщений:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Удаление сообщения
export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const user = getUser(req);

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Сообщение не найдено' });
    }

    // Проверяем права доступа (только отправитель, получатель или админ могут удалять)
    if (
      message.sender.toString() !== user.id &&
      message.recipient.toString() !== user.id &&
      user.role !== UserRole.ADMIN
    ) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    await Message.findByIdAndDelete(messageId);
    res.json({ message: 'Сообщение успешно удалено' });
  } catch (error) {
    console.error('Ошибка при удалении сообщения:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
