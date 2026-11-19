import { Router } from 'express';
import authRoutes from './authRoutes.js';
import memoryRoutes from './memoryRoutes.js';
import { taskRouter, reminderRouter, syncRouter } from './taskAndReminderRoutes.js';

const apiRouter = Router();

apiRouter.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'kee-backend', time: new Date().toISOString() });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/memories', memoryRoutes);
apiRouter.use('/tasks', taskRouter);
apiRouter.use('/reminders', reminderRouter);
apiRouter.use('/sync', syncRouter);

export default apiRouter;
