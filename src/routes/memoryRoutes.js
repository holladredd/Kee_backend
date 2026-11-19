import { Router } from 'express';
import { MemoryController } from '../controllers/memoryController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { memoryCreateSchema, memoryUpdateSchema } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(memoryCreateSchema), MemoryController.create);
router.get('/', MemoryController.getAll);
router.get('/:id', MemoryController.getById);
router.patch('/:id', validate(memoryUpdateSchema), MemoryController.update);
router.delete('/:id', MemoryController.delete);

export default router;
