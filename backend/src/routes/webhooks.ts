import { Router } from 'express';
import { protect } from '../middleware/auth';

export const webhookRoutes = Router();

// @route   POST /v1/webhooks/register
webhookRoutes.post('/register', protect, async (req, res) => {
  const { url, events } = req.body;
  // Stub for webhook registration
  console.log(`[Webhook] Registered ${url} for events:`, events);
  res.json({ message: 'Webhook registered successfully', url, events });
});
