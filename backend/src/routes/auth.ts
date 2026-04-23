import { Router } from 'express';
import { login, getMe, verifyDID, updateProfile, regenerateApiKey } from '../controllers/auth';
import { authenticateToken, authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);
router.post('/regenerate-api-key', authenticateToken, regenerateApiKey);
router.post('/verify-did', authenticate, verifyDID);

// SDK-First v1 Auth Routes
router.get('/request-message', (req: any, res: any) => {
  const { wallet } = req.query;
  const nonce = Math.random().toString(36).substring(2, 15);
  res.json({ message: `ZYPHERION_AUTH_${nonce}`, nonce, expiresIn: 300 });
});

router.post('/verify-signature', (req: any, res: any) => {
  const { wallet, signature, message, nonce } = req.body;
  // Stub for signature verification
  const token = 'mock-jwt-token-for-sdk';
  res.json({ token, role: 'user' });
});

export default router;
