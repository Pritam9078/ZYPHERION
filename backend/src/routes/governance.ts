import express from 'express';
import { approveProof, getPendingGovernance } from '../controllers/governance';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/pending', authenticate, getPendingGovernance);
router.post('/approve', authenticate, approveProof);

export default router;
