import { Router } from 'express';
import { TaskController, ReminderController, SyncController } from '../controllers/taskController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  taskCreateSchema,
  taskUpdateSchema,
  reminderCreateSchema,
  reminderUpdateSchema,
  syncPushPullSchema,
} from '../validators/schemas.js';

export const taskRouter = Router();
taskRouter.use(authenticate);
taskRouter.post('/', validate(taskCreateSchema), TaskController.create);
taskRouter.get('/', TaskController.getAll);
taskRouter.patch('/:id', validate(taskUpdateSchema), TaskController.update);
taskRouter.delete('/:id', TaskController.delete);

export const reminderRouter = Router();
reminderRouter.use(authenticate);
reminderRouter.post('/', validate(reminderCreateSchema), ReminderController.create);
reminderRouter.get('/', ReminderController.getAll);
reminderRouter.patch('/:id', validate(reminderUpdateSchema), ReminderController.update);
reminderRouter.delete('/:id', ReminderController.delete);

export const syncRouter = Router();
syncRouter.use(authenticate);
syncRouter.post('/', validate(syncPushPullSchema), SyncController.sync);
