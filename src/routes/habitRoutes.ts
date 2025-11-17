import { Router } from 'express';
import { body } from 'express-validator';
import {
  createHabit,
  getHabits,
  getHabit,
  updateHabit,
  deleteHabit,
} from '../controllers/habitController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').optional().trim(),
    body('frequency')
      .isIn(['daily', 'weekly'])
      .withMessage('Frequency must be daily or weekly'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('reminderTime').optional().trim(),
  ],
  asyncHandler(createHabit)
);

router.get('/', asyncHandler(getHabits));

router.get('/:id', asyncHandler(getHabit));

router.put(
  '/:id',
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().trim(),
    body('frequency')
      .optional()
      .isIn(['daily', 'weekly'])
      .withMessage('Frequency must be daily or weekly'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('reminderTime').optional().trim(),
  ],
  asyncHandler(updateHabit)
);

router.delete('/:id', asyncHandler(deleteHabit));

export default router;
