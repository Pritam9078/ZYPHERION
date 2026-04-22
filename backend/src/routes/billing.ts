import { Router } from 'express';
import { protect } from '../middleware/auth';
import { createDeposit, getUserDeposits } from '../controllers/billing';

const router = Router();

// Protect all routes
router.use(protect);

// @route   GET /api/billing
router.get('/', getUserDeposits);

// @route   POST /api/billing/deposit
router.post('/deposit', createDeposit);

export default router;
