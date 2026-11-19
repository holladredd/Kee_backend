import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Valid email address is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email address is required'),
  password: z.string().min(1, 'Password is required'),
});

export const memoryCreateSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  originalContent: z.string().min(1, 'Original content is required'),
  processedContent: z.string().optional().nullable(),
  memoryType: z.enum([
    'task',
    'reminder',
    'personal_memory',
    'idea',
    'commitment',
    'personal_preference',
    'important_date',
    'reference',
    'shopping',
    'general_note',
  ]).default('general_note'),
  category: z.string().default('General'),
  tags: z.array(z.string()).default([]),
  associatedPerson: z.string().optional().nullable(),
  associatedDate: z.string().datetime().optional().nullable(),
  isPinned: z.boolean().default(false),
});

export const memoryUpdateSchema = memoryCreateSchema.partial();

export const taskCreateSchema = z.object({
  id: z.string().uuid().optional(),
  memoryId: z.string().uuid().optional().nullable(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  dueDate: z.string().datetime().optional().nullable(),
  dueTime: z.string().optional().nullable(),
});

export const taskUpdateSchema = taskCreateSchema.partial();

export const reminderCreateSchema = z.object({
  id: z.string().uuid().optional(),
  taskId: z.string().uuid().optional().nullable(),
  memoryId: z.string().uuid().optional().nullable(),
  title: z.string().min(1, 'Title is required'),
  scheduledAt: z.string().datetime(),
  timezone: z.string().default('UTC'),
  recurrenceRule: z.string().optional().nullable(),
  isEnabled: z.boolean().default(true),
});

export const reminderUpdateSchema = reminderCreateSchema.partial();

export const syncPushPullSchema = z.object({
  lastSyncedAt: z.string().datetime().optional().nullable(),
  mutations: z.array(
    z.object({
      entityType: z.enum(['memory', 'task', 'reminder', 'attachment']),
      entityId: z.string().uuid(),
      action: z.enum(['create', 'update', 'delete']),
      clientTimestamp: z.string().datetime(),
      payload: z.record(z.any()),
    })
  ).default([]),
});
