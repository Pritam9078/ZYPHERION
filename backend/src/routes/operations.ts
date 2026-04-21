import { Router } from 'express';
import { protect } from '../middleware/auth';
import { 
  getMyOperations, 
  requestProof, 
  submitProof 
} from '../controllers/operation';

const router = Router();

// @route   GET /api/ops
// @desc    Get all proofs/operations for the logged-in user
router.get('/', protect, getMyOperations);

// @route   POST /api/ops/proofs/request
// @desc    Request a new proof (Mock)
router.post('/proofs/request', protect, requestProof);

// @route   POST /api/ops/proofs/submit
// @desc    Submit proof to "Contract" (Mock)
router.post('/proofs/submit', protect, submitProof);

export default router;

