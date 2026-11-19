import { prisma } from '../config/prisma.js';

export class MemoryService {
  static async create(userId, data) {
    const memory = await prisma.memory.create({
      data: {
        id: data.id,
        userId,
        title: data.title,
        originalContent: data.originalContent,
        processedContent: data.processedContent,
        memoryType: data.memoryType,
        category: data.category,
        tags: data.tags,
        associatedPerson: data.associatedPerson,
        associatedDate: data.associatedDate ? new Date(data.associatedDate) : null,
        isPinned: data.isPinned,
      },
    });

    await prisma.syncLog.create({
      data: {
        userId,
        entityType: 'memory',
        entityId: memory.id,
        action: 'create',
        clientTimestamp: memory.createdAt,
      },
    });

    return memory;
  }

  static async getAll(userId, { category, search, memoryType, includeDeleted = false }) {
    const where = {
      userId,
      ...(!includeDeleted && { deletedAt: null }),
      ...(category && category !== 'All' && { category }),
      ...(memoryType && { memoryType }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { originalContent: { contains: search, mode: 'insensitive' } },
          { associatedPerson: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    return prisma.memory.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });
  }

  static async getById(userId, memoryId) {
    const memory = await prisma.memory.findFirst({
      where: { id: memoryId, userId },
      include: { tasks: true, reminders: true },
    });

    if (!memory) {
      const error = new Error('Memory not found.');
      error.statusCode = 404;
      throw error;
    }

    return memory;
  }

  static async update(userId, memoryId, data) {
    // Verify ownership
    await this.getById(userId, memoryId);

    const updated = await prisma.memory.update({
      where: { id: memoryId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.originalContent && { originalContent: data.originalContent }),
        ...(data.processedContent !== undefined && { processedContent: data.processedContent }),
        ...(data.memoryType && { memoryType: data.memoryType }),
        ...(data.category && { category: data.category }),
        ...(data.tags && { tags: data.tags }),
        ...(data.associatedPerson !== undefined && { associatedPerson: data.associatedPerson }),
        ...(data.associatedDate !== undefined && {
          associatedDate: data.associatedDate ? new Date(data.associatedDate) : null,
        }),
        ...(data.isPinned !== undefined && { isPinned: data.isPinned }),
      },
    });

    await prisma.syncLog.create({
      data: {
        userId,
        entityType: 'memory',
        entityId: memoryId,
        action: 'update',
        clientTimestamp: new Date(),
      },
    });

    return updated;
  }

  static async delete(userId, memoryId, hardDelete = false) {
    await this.getById(userId, memoryId);

    if (hardDelete) {
      await prisma.memory.delete({ where: { id: memoryId } });
    } else {
      await prisma.memory.update({
        where: { id: memoryId },
        data: { deletedAt: new Date() },
      });
    }

    await prisma.syncLog.create({
      data: {
        userId,
        entityType: 'memory',
        entityId: memoryId,
        action: 'delete',
        clientTimestamp: new Date(),
      },
    });

    return { success: true, id: memoryId };
  }
}
