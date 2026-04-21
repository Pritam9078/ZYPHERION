import { Router } from 'express';
import { login, getMe } from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.get('/me', authenticateToken, getMe);

// SDK-First v1 Auth Routes
router.get('/request-message', (req, res) => {
  const { wallet } = req.query;
  const nonce = Math.random().toString(36).substring(2, 15);
  res.json({ message: `ZYPHERION_AUTH_${nonce}`, nonce, expiresIn: 300 });
});

router.post('/verify-signature', (req, res) => {
  const { wallet, signature, message, nonce } = req.body;
  // Stub for signature verification
  const token = 'mock-jwt-token-for-sdk';
  res.json({ token, role: 'user' });
});

export default router;
