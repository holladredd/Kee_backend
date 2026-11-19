import { prisma } from '../config/prisma.js';

export class TaskService {
  static async create(userId, data) {
    const task = await prisma.task.create({
      data: {
        id: data.id,
        userId,
        memoryId: data.memoryId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        dueTime: data.dueTime,
      },
    });

    await prisma.syncLog.create({
      data: {
        userId,
        entityType: 'task',
        entityId: task.id,
        action: 'create',
        clientTimestamp: task.createdAt,
      },
    });

    return task;
  }

  static async getAll(userId, status) {
    return prisma.task.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  static async update(userId, taskId, data) {
    const existing = await prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!existing) {
      const error = new Error('Task not found.');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.priority && { priority: data.priority }),
        ...(data.status && {
          status: data.status,
          completedAt: data.status === 'completed' ? new Date() : null,
        }),
        ...(data.dueDate !== undefined && {
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
        }),
        ...(data.dueTime !== undefined && { dueTime: data.dueTime }),
      },
    });

    await prisma.syncLog.create({
      data: {
        userId,
        entityType: 'task',
        entityId: taskId,
        action: 'update',
        clientTimestamp: new Date(),
      },
    });

    return updated;
  }

  static async delete(userId, taskId) {
    const existing = await prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!existing) {
      const error = new Error('Task not found.');
      error.statusCode = 404;
      throw error;
    }

    await prisma.task.delete({ where: { id: taskId } });

    await prisma.syncLog.create({
      data: {
        userId,
        entityType: 'task',
        entityId: taskId,
        action: 'delete',
        clientTimestamp: new Date(),
      },
    });

    return { success: true, id: taskId };
  }
}
