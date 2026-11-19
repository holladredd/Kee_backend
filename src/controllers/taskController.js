import { TaskService } from '../services/taskService.js';
import { ReminderService } from '../services/reminderService.js';
import { SyncService } from '../services/syncService.js';

export class TaskController {
  static async create(req, res, next) {
    try {
      const task = await TaskService.create(req.user.id, req.validatedData);
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { status } = req.query;
      const tasks = await TaskService.getAll(req.user.id, status);
      res.status(200).json({ success: true, data: tasks });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const task = await TaskService.update(req.user.id, req.params.id, req.validatedData);
      res.status(200).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const result = await TaskService.delete(req.user.id, req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export class ReminderController {
  static async create(req, res, next) {
    try {
      const reminder = await ReminderService.create(req.user.id, req.validatedData);
      res.status(201).json({ success: true, data: reminder });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const reminders = await ReminderService.getAll(req.user.id);
      res.status(200).json({ success: true, data: reminders });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const reminder = await ReminderService.update(req.user.id, req.params.id, req.validatedData);
      res.status(200).json({ success: true, data: reminder });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const result = await ReminderService.delete(req.user.id, req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export class SyncController {
  static async sync(req, res, next) {
    try {
      const result = await SyncService.sync(req.user.id, req.validatedData);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
