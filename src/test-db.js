import dotenv from 'dotenv';
dotenv.config();

import prisma from './config/database.js';

try {
    await prisma.$connect();

    const result = await prisma.$queryRaw`SELECT current_database() AS database`;

    console.log('Database connection successful!');
    console.log(result);
} catch (error) {
    console.error('Database connection failed:', error.message);
    process.exitCode = 1;
} finally {
    await prisma.$disconnect();
}