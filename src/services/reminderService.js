import { prisma } from '../config/prisma.js';

export class ReminderService {
  static async create(userId, data) {
    const reminder = await prisma.reminder.create({
      data: {
        id: data.id,
        userId,
        taskId: data.taskId,
        memoryId: data.memoryId,
        title: data.title,
        scheduledAt: new Date(data.scheduledAt),
        timezone: data.timezone,
        recurrenceRule: data.recurrenceRule,
        isEnabled: data.isEnabled,
      },
    });

    await prisma.syncLog.create({
      data: {
        userId,
        entityType: 'reminder',
        entityId: reminder.id,
        action: 'create',
        clientTimestamp: reminder.createdAt,
      },
    });

    return reminder;
  }

  static async getAll(userId) {
    return prisma.reminder.findMany({
      where: { userId },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  static async update(userId, reminderId, data) {
    const existing = await prisma.reminder.findFirst({
      where: { id: reminderId, userId },
    });

    if (!existing) {
      const error = new Error('Reminder not found.');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.reminder.update({
      where: { id: reminderId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.scheduledAt && { scheduledAt: new Date(data.scheduledAt) }),
        ...(data.timezone && { timezone: data.timezone }),
        ...(data.recurrenceRule !== undefined && { recurrenceRule: data.recurrenceRule }),
        ...(data.isEnabled !== undefined && { isEnabled: data.isEnabled }),
      },
    });

    await prisma.syncLog.create({
      data: {
        userId,
        entityType: 'reminder',
        entityId: reminderId,
        action: 'update',
        clientTimestamp: new Date(),
      },
    });

    return updated;
  }

  static async delete(userId, reminderId) {
    const existing = await prisma.reminder.findFirst({
      where: { id: reminderId, userId },
    });

    if (!existing) {
      const error = new Error('Reminder not found.');
      error.statusCode = 404;
      throw error;
    }

    await prisma.reminder.delete({ where: { id: reminderId } });

    await prisma.syncLog.create({
      data: {
        userId,
        entityType: 'reminder',
        entityId: reminderId,
        action: 'delete',
        clientTimestamp: new Date(),
      },
    });

    return { success: true, id: reminderId };
  }
}
