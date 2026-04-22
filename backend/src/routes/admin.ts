import { Router } from 'express';
import { protect, isAdmin } from '../middleware/auth';
import { 
  getAllUsers, 
  getSystemStats, 
  toggleRuleStatus, 
  getAllRules,
  updateUserStatus,
  updateUserRole,
  approveUser,
  deleteRule,
  getAllDeposits,
  approveDeposit,
  getAllProofs,
  getSystemStatus,
  toggleProtocolHalt
} from '../controllers/admin';

const router = Router();

// Apply both protect and isAdmin to all routes in this file
router.use(protect);
router.use(isAdmin);

// @route   GET /api/admin/users
router.get('/users', getAllUsers);

// @route   PUT /api/admin/users/:id/status
router.put('/users/:id/status', updateUserStatus);

// @route   PUT /api/admin/users/:id/role
router.put('/users/:id/role', updateUserRole);

// @route   PUT /api/admin/users/:id/approve
router.put('/users/:id/approve', approveUser);

// @route   GET /api/admin/deposits
router.get('/deposits', getAllDeposits);

// @route   PUT /api/admin/deposits/:id/approve
router.put('/deposits/:id/approve', approveDeposit);

// @route   GET /api/admin/stats
router.get('/stats', getSystemStats);

// @route   GET /api/admin/rules
router.get('/rules', getAllRules);

// @route   GET /api/admin/proofs
router.get('/proofs', getAllProofs);

// @route   PUT /api/admin/rules/:id/status
router.put('/rules/:id/status', toggleRuleStatus);

// @route   DELETE /api/admin/rules/:id
router.delete('/rules/:id', deleteRule);

// @route   GET /api/admin/system/status
router.get('/system/status', getSystemStatus);

// @route   POST /api/admin/system/toggle
router.post('/system/toggle', toggleProtocolHalt);

export default router;
