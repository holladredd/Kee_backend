import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import apiRouter from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Security and utility middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting on sensitive authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: { success: false, error: 'Too many authentication attempts, please try again later.' },
});

app.use('/api/v1/auth', authLimiter);
app.use('/api/v1', apiRouter);

// Root greeting
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Kee (Knowledge Extension Entity) Backend API',
    tagline: 'Your memory. Extended.',
    description: 'Personal AI memory and intelligence assistant API',
    version: '1.0.0',
    endpoints: '/api/v1/health',
  });
});

// Centralized error handling
app.use(errorHandler);

export default app;
