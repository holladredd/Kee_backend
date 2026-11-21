import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { prisma } from './config/prisma.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`[Kee API] Server listening on port ${PORT}`);
    console.log(`[Kee API] Health check: http://localhost:${PORT}/api/v1/health`);
  });

  // Verify Database Connection
  try {
    console.log(`[Kee DB] Connecting to database...`);
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log(`[Kee DB] ✓ PostgreSQL database connected successfully!`);
    console.log(`==================================================\n`);
  } catch (error) {
    console.error(`[Kee DB] ✗ Database connection failed:`, error.message);
    console.log(`==================================================\n`);
  }

  // Graceful shutdown
  const shutdown = async () => {
    console.log(`\n[Kee API] Shutting down server...`);
    await prisma.$disconnect();
    server.close(() => {
      console.log(`[Kee API] Server and DB connections closed.`);
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();
