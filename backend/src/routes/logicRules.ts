import { Router } from 'express';
import { createRule, getMyRules, getRuleById, updateRule, deleteRule } from '../controllers/index';
import { protect } from '../middleware/auth';

const router = Router();

router.route('/')
  .post(protect, createRule)
  .get(protect, getMyRules);

router.route('/:id')
  .get(protect, getRuleById)
  .put(protect, updateRule)
  .delete(protect, deleteRule);

export default router;
