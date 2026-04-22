import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    address: string;
    role: 'admin' | 'user';
    tier?: 'Free' | 'Basic' | 'Pro' | 'Enterprise';
    approved?: boolean;
  };
  body: any;
  query: any;
  params: any;
  headers: any;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Missing token' });

  const jwtSecret = process.env.JWT_SECRET || 'zypherion_fallback_secret_67890';

  jwt.verify(token, jwtSecret, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

export const authenticateToken = protect;

export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Re-check role from DB to avoid stale JWT role claims
    const dbUser = await User.findOne({ address: req.user?.address });
    
    // Also allow if the address matches ADMIN_WALLET_ADDRESS env var directly
    const envAdmin = process.env.ADMIN_WALLET_ADDRESS;
    const isEnvAdmin = envAdmin && req.user?.address === envAdmin;

    if (dbUser?.role !== 'admin' && !isEnvAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Sync DB role if env admin is not yet persisted
    if (isEnvAdmin && dbUser && dbUser.role !== 'admin') {
      dbUser.role = 'admin';
      await dbUser.save();
    }

    next();
  } catch (err) {
    return res.status(500).json({ message: 'Role verification failed' });
  }
};

/**
 * Middleware to enforce SaaS tier access.
 * Usage: router.get('/pro-feature', protect, requireTier('Pro'), handler)
 */
const tierHierarchy = {
  'Free': 0,
  'Basic': 1,
  'Pro': 2,
  'Enterprise': 3
};

export const requireTier = (requiredTier: keyof typeof tierHierarchy) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const dbUser = await User.findOne({ address: req.user?.address });
      if (!dbUser) return res.status(401).json({ message: 'User not found' });
      
      if (!dbUser.approved && dbUser.accountType !== 'Guest') {
        return res.status(403).json({ message: 'Account pending admin approval.' });
      }

      const userTier = dbUser.tier || 'Free';
      if (tierHierarchy[userTier] < tierHierarchy[requiredTier]) {
        return res.status(403).json({ 
          message: `Upgrade required. This feature requires ${requiredTier} tier.` 
        });
      }

      req.user!.tier = userTier;
      req.user!.approved = dbUser.approved;
      next();
    } catch (err) {
      return res.status(500).json({ message: 'Tier verification failed' });
    }
  };
};
