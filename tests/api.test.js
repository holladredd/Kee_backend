import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { generateToken, authenticate } from '../src/middlewares/auth.js';
import {
  registerSchema,
  loginSchema,
  memoryCreateSchema,
  taskCreateSchema,
  reminderCreateSchema,
} from '../src/validators/schemas.js';

describe('Kee Backend Unit Tests', () => {
  describe('Password Hashing with bcrypt', () => {
    test('hashes password and verifies match correctly', async () => {
      const password = 'SuperSecretPassword123!';
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      assert.notStrictEqual(password, hash);
      assert.ok(await bcrypt.compare(password, hash));
      assert.strictEqual(await bcrypt.compare('WrongPassword', hash), false);
    });
  });

  describe('JWT Authentication Middleware', () => {
    test('generates a valid signed JWT token', () => {
      const payload = { userId: '123e4567-e89b-12d3-a456-426614174000', email: 'test@kee.app' };
      const token = generateToken(payload);
      assert.ok(typeof token === 'string');
      assert.ok(token.split('.').length === 3);
    });

    test('authenticates valid token and attaches user to request', () => {
      const payload = { userId: '123e4567-e89b-12d3-a456-426614174000', email: 'test@kee.app' };
      const token = generateToken(payload);

      const req = { headers: { authorization: `Bearer ${token}` } };
      let nextCalled = false;
      const res = {};
      const next = () => { nextCalled = true; };

      authenticate(req, res, next);
      assert.ok(nextCalled);
      assert.strictEqual(req.user.id, payload.userId);
      assert.strictEqual(req.user.email, payload.email);
    });

    test('rejects missing or invalid Bearer token with 401', () => {
      const req = { headers: {} };
      let statusSent = null;
      let jsonSent = null;
      const res = {
        status(code) { statusSent = code; return this; },
        json(data) { jsonSent = data; return this; },
      };
      const next = () => {};

      authenticate(req, res, next);
      assert.strictEqual(statusSent, 401);
      assert.strictEqual(jsonSent.success, false);
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
