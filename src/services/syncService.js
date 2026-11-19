import { prisma } from '../config/prisma.js';
import { MemoryService } from './memoryService.js';
import { TaskService } from './taskService.js';
import { ReminderService } from './reminderService.js';

export class SyncService {
  static async sync(userId, { lastSyncedAt, mutations = [] }) {
    const appliedMutations = [];
    const serverTimestamp = new Date();

    // 1. Process client mutations (push phase)
    for (const mutation of mutations) {
      const { entityType, entityId, action, payload, clientTimestamp } = mutation;

      try {
        if (entityType === 'memory') {
          if (action === 'create') {
            await prisma.memory.upsert({
              where: { id: entityId },
              update: {
                title: payload.title,
                originalContent: payload.original_content || payload.originalContent,
                processedContent: payload.processed_content || payload.processedContent,
                category: payload.category || 'General',
                tags: typeof payload.tags === 'string' ? payload.tags.split(',') : (payload.tags || []),
                isPinned: Boolean(payload.is_pinned ?? payload.isPinned),
                updatedAt: new Date(clientTimestamp),
              },
              create: {
                id: entityId,
                userId,
                title: payload.title,
                originalContent: payload.original_content || payload.originalContent,
                processedContent: payload.processed_content || payload.processedContent,
                memoryType: payload.memory_type || payload.memoryType || 'general_note',
                category: payload.category || 'General',
                tags: typeof payload.tags === 'string' ? payload.tags.split(',') : (payload.tags || []),
                isPinned: Boolean(payload.is_pinned ?? payload.isPinned),
                createdAt: new Date(clientTimestamp),
                updatedAt: new Date(clientTimestamp),
              },
            });
          } else if (action === 'update') {
            await prisma.memory.updateMany({
              where: { id: entityId, userId },
              data: {
                ...(payload.title && { title: payload.title }),
                ...(payload.originalContent && { originalContent: payload.originalContent }),
                updatedAt: new Date(clientTimestamp),
              },
            });
          } else if (action === 'delete') {
            await prisma.memory.updateMany({
              where: { id: entityId, userId },
              data: { deletedAt: new Date(clientTimestamp) },
            });
          }
        } else if (entityType === 'task') {
          if (action === 'create') {
            await prisma.task.upsert({
              where: { id: entityId },
              update: {
                title: payload.title,
                status: payload.status || 'pending',
                updatedAt: new Date(clientTimestamp),
              },
              create: {
                id: entityId,
                userId,
                title: payload.title,
                description: payload.description,
                status: payload.status || 'pending',
                createdAt: new Date(clientTimestamp),
                updatedAt: new Date(clientTimestamp),
              },
            });
          } else if (action === 'update') {
            await prisma.task.updateMany({
              where: { id: entityId, userId },
              data: {
                ...(payload.title && { title: payload.title }),
                ...(payload.status && { status: payload.status }),
                updatedAt: new Date(clientTimestamp),
              },
            });
          } else if (action === 'delete') {
            await prisma.task.deleteMany({ where: { id: entityId, userId } });
          }
        } else if (entityType === 'reminder') {
          if (action === 'create') {
            await prisma.reminder.upsert({
              where: { id: entityId },
              update: {
                title: payload.title,
                scheduledAt: new Date(payload.scheduled_at || payload.scheduledAt),
                updatedAt: new Date(clientTimestamp),
              },
              create: {
                id: entityId,
                userId,
                title: payload.title,
                scheduledAt: new Date(payload.scheduled_at || payload.scheduledAt),
                timezone: payload.timezone || 'UTC',
                isEnabled: Boolean(payload.is_enabled ?? payload.isEnabled ?? true),
                createdAt: new Date(clientTimestamp),
                updatedAt: new Date(clientTimestamp),
              },
            });
          } else if (action === 'delete') {
            await prisma.reminder.deleteMany({ where: { id: entityId, userId } });
          }
        }

        appliedMutations.push(entityId);
      } catch (err) {
        console.error(`Failed to apply mutation for ${entityType} ${entityId}:`, err.message);
      }
    }

    // 2. Fetch server changes since lastSyncedAt (pull phase)
    const sinceDate = lastSyncedAt ? new Date(lastSyncedAt) : new Date(0);

    const updatedMemories = await prisma.memory.findMany({
      where: { userId, updatedAt: { gt: sinceDate } },
    });

    const updatedTasks = await prisma.task.findMany({
      where: { userId, updatedAt: { gt: sinceDate } },
    });

    const updatedReminders = await prisma.reminder.findMany({
      where: { userId, updatedAt: { gt: sinceDate } },
    });

    return {
      serverTimestamp: serverTimestamp.toISOString(),
      appliedCount: appliedMutations.length,
      pull: {
        memories: updatedMemories,
        tasks: updatedTasks,
        reminders: updatedReminders,
      },
    };
  }
}
