import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Keypair } from '@stellar/stellar-sdk';
import User from '../models/User';

export const login = async (req: Request, res: Response) => {
  const { address, signature, message, accountType } = req.body;

  if (!address || !signature || !message) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // 1. Verify that 'message' is "Authenticate with Zypherion Protocol"
    if (message !== "Authenticate with Zypherion Protocol") {
      return res.status(400).json({ message: 'Invalid message' });
    }

    // 2. Verify Stellar signature
    const keypair = Keypair.fromPublicKey(address);
    let isValid = false;

    try {
      const sigBuffer = Buffer.from(signature, 'base64');
      
      // Try raw message
      isValid = keypair.verify(Buffer.from(message), sigBuffer);
      
      if (!isValid) {
        // Try with Stellar prefix
        const prefix = "Stellar Signed Message: ";
        isValid = keypair.verify(Buffer.from(prefix + message), sigBuffer);
      }

      console.log('[Auth] Verification result:', isValid);
    } catch (e) {
      console.log('[Auth] Verification error:', e);
    }

    if (!isValid) {
      // DEV MODE Fallback
      if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
         console.warn('[Auth] DEV MODE: Allowing signature bypass for', address);
         isValid = true;
      }
    }

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid signature' });
    }
    
    // 3. Persist User in DB & Determine role
    let user = await User.findOne({ address });
    
    const adminAddress = process.env.ADMIN_WALLET_ADDRESS;
    const isFirstAdmin = adminAddress && address === adminAddress;
    const role = isFirstAdmin ? 'admin' : (user?.role || 'user');

    if (!user) {
      user = await User.create({
        address,
        role,
        accountType: accountType || 'Guest',
        tier: 'Free',
        approved: role === 'admin' ? true : false, // Admins auto-approved
      });
      console.log('[Auth] New user registered:', address);
    } else if (user.role !== role) {
      user.role = role;
      await user.save();
    }

    // 4. Issue JWT
    const jwtSecret = process.env.JWT_SECRET || 'zypherion_fallback_secret_67890';
    const token = jwt.sign(
      { 
        address: user.address, 
        role: user.role, 
        tier: user.tier, 
        approved: user.approved 
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      user: { 
        address: user.address, 
        role: user.role, 
        accountType: user.accountType,
        tier: user.tier,
        kycStatus: user.kycStatus,
        approved: user.approved
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await User.findOne({ address: req.user.address });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({ 
      user: {
        address: user.address,
        role: user.role,
        accountType: user.accountType,
        tier: user.tier,
        kycStatus: user.kycStatus,
        approved: user.approved,
        proofsUsedThisMonth: user.proofsUsedThisMonth,
        creditsBalance: user.creditsBalance
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get user profile' });
  }
};
