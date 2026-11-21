import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import authRoutes from './authRoutes.js';
import memoryRoutes from './memoryRoutes.js';
import { taskRouter, reminderRouter, syncRouter } from './taskAndReminderRoutes.js';

const apiRouter = Router();

apiRouter.get('/health', async (req, res) => {
  let dbStatus = 'connected';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    dbStatus = 'disconnected';
  }
  res.status(200).json({
    status: 'ok',
    service: 'kee-backend',
    database: dbStatus,
    time: new Date().toISOString(),
  });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/memories', memoryRoutes);
apiRouter.use('/tasks', taskRouter);
apiRouter.use('/reminders', reminderRouter);
apiRouter.use('/sync', syncRouter);

export default apiRouter;
