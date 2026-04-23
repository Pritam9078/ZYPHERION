import { Router } from 'express';
import { protect } from '../middleware/auth';
import { 
  getMyOperations, 
  requestProof, 
  submitProof,
  getProofStatus,
  triggerExecution
} from '../controllers/operation';

const router = Router();

// @route   GET /api/ops
// @desc    Get all proofs/operations for the logged-in user
router.get('/', protect, getMyOperations);

// @route   POST /api/ops/proofs/request
// @desc    Request a new proof (Mock)
router.post('/proofs/request', protect, requestProof);
router.post('/generate', protect, requestProof); // SDK Alias

// @route   POST /api/ops/proofs/submit
// @desc    Submit proof to "Contract" (Mock)
router.post('/proofs/submit', protect, submitProof);

// @route   GET /api/ops/proof/:id
// @desc    Get specific proof status
router.get('/proof/:id', protect, getProofStatus);
router.get('/status/:id', protect, getProofStatus); // SDK Alias

// @route   POST /api/ops/trigger
// @desc    Trigger execution (SDK/API)
router.post('/trigger', protect, triggerExecution);

export default router;

