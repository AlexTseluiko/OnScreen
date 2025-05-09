import { Request, Response } from 'express';
import { Message, MessageType } from '../models/Message';
import { User, UserRole } from '../models/User';
import { createNotification, NotificationType } from '../utils/notifications';

// Отправка сообщения
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { recipientId, content, type = MessageType.TEXT, attachments, appointmentId } = req.body;
    const senderId = req.user.id;

    // Проверяем, существует ли получатель
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: 'Получатель не найден' });
    }

    // Создаем сообщение
    const message = await Message.create({
      sender: senderId,
      recipient: recipientId,
      content,
      type,
      attachments,
      appointment: appointmentId,
    });

    // Отправляем уведомление получателю
    await createNotification(
      recipientId,
      NotificationType.MESSAGE,
      'Новое сообщение',
      `У вас новое сообщение от ${req.user.firstName} ${req.user.lastName}`
    );

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Ошибка при отправке сообщения' });
  }
};

// Получение истории сообщений
export const getMessageHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Проверяем права доступа
    if (
      currentUserId !== userId &&
      req.user.role !== UserRole.DOCTOR &&
      req.user.role !== UserRole.ADMIN
    ) {
      return res.status(403).json({ error: 'Нет прав для просмотра сообщений' });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'firstName lastName')
      .populate('recipient', 'firstName lastName')
      .populate('appointment', 'date time');

    res.json(messages);
  } catch (error) {
    console.error('Get message history error:', error);
    res.status(500).json({ error: 'Ошибка при получении истории сообщений' });
  }
};

// Отметка сообщений как прочитанных
export const markMessagesAsRead = async (req: Request, res: Response) => {
  try {
    const { senderId } = req.params;
    const recipientId = req.user.id;

    await Message.updateMany(
      {
        sender: senderId,
        recipient: recipientId,
        readAt: { $exists: false },
      },
      {
        readAt: new Date(),
      }
    );

    res.json({ message: 'Сообщения отмечены как прочитанные' });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({ error: 'Ошибка при отметке сообщений' });
  }
};

// Удаление сообщения
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Сообщение не найдено' });
    }

    // Проверяем права доступа
    if (
      userId !== message.sender.toString() &&
      userId !== message.recipient.toString() &&
      req.user.role !== UserRole.ADMIN
    ) {
      return res.status(403).json({ error: 'Нет прав для удаления сообщения' });
    }

    await Message.deleteOne({ _id: messageId });

    res.json({ message: 'Сообщение успешно удалено' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Ошибка при удалении сообщения' });
  }
};
