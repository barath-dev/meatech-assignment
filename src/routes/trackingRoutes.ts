import { Router } from 'express';
import { trackHabit, getHabitHistory } from '../controllers/trackingController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.post('/:id/track', asyncHandler(trackHabit));
router.get('/:id/history', asyncHandler(getHabitHistory));

export default router;
