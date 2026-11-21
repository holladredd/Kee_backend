import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

export default prisma;
