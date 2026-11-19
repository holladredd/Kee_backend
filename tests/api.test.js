import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { generateToken } from '../src/middlewares/auth.js';
import {
  registerSchema,
  memoryCreateSchema,
  taskCreateSchema,
  reminderCreateSchema,
} from '../src/validators/schemas.js';

describe('Kee Backend Unit Tests', () => {
  describe('JWT Authentication Middleware', () => {
    test('generates a valid signed JWT token', () => {
      const payload = { userId: '123e4567-e89b-12d3-a456-426614174000', email: 'test@kee.app' };
      const token = generateToken(payload);
      assert.ok(typeof token === 'string');
      assert.ok(token.split('.').length === 3);
    });
  });

  describe('Zod Validation Schemas', () => {
    test('validates valid registration payload', () => {
      const valid = { email: 'user@example.com', password: 'securePassword123' };
      const result = registerSchema.safeParse(valid);
      assert.ok(result.success);
    });

    test('rejects registration with short password', () => {
      const invalid = { email: 'user@example.com', password: '123' };
      const result = registerSchema.safeParse(invalid);
      assert.strictEqual(result.success, false);
    });

    test('validates valid memory creation payload with default category', () => {
      const payload = {
        title: 'Meeting with Sarah',
        originalContent: 'Discussed Q4 roadmap and design review.',
        memoryType: 'personal_memory',
      };
      const result = memoryCreateSchema.safeParse(payload);
      assert.ok(result.success);
      assert.strictEqual(result.data.category, 'General');
    });

    test('validates task payload with default priority', () => {
      const payload = {
        title: 'Renew server certificates',
      };
      const result = taskCreateSchema.safeParse(payload);
      assert.ok(result.success);
      assert.strictEqual(result.data.priority, 'normal');
      assert.strictEqual(result.data.status, 'pending');
    });

    test('validates reminder payload with valid ISO scheduled date', () => {
      const payload = {
        title: 'Check dentist appointment',
        scheduledAt: '2026-11-20T10:00:00.000Z',
      };
      const result = reminderCreateSchema.safeParse(payload);
      assert.ok(result.success);
      assert.strictEqual(result.data.isEnabled, true);
    });

    test('rejects reminder payload with invalid date', () => {
      const payload = {
        title: 'Check dentist appointment',
        scheduledAt: 'not-a-date',
      };
      const result = reminderCreateSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });
  });
});
