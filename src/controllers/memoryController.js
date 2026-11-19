import { MemoryService } from '../services/memoryService.js';

export class MemoryController {
  static async create(req, res, next) {
    try {
      const memory = await MemoryService.create(req.user.id, req.validatedData);
      res.status(201).json({ success: true, data: memory });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { category, search, memoryType, includeDeleted } = req.query;
      const memories = await MemoryService.getAll(req.user.id, {
        category,
        search,
        memoryType,
        includeDeleted: includeDeleted === 'true',
      });
      res.status(200).json({ success: true, data: memories });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const memory = await MemoryService.getById(req.user.id, req.params.id);
      res.status(200).json({ success: true, data: memory });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const memory = await MemoryService.update(req.user.id, req.params.id, req.validatedData);
      res.status(200).json({ success: true, data: memory });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const hardDelete = req.query.hard === 'true';
      const result = await MemoryService.delete(req.user.id, req.params.id, hardDelete);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
