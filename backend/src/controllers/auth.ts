import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Keypair } from '@stellar/stellar-sdk';
import User from '../models/User';

export const login = async (req: Request, res: Response) => {
  const { address, signature, message } = req.body;

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

    // Standard Stellar message prefix
    const prefix = "Stellar Signed Message: ";
    const fullerMessage = prefix + message;
    
    const dataToVerify = Buffer.from(message);
    const prefixedDataToVerify = Buffer.from(fullerMessage);

    try {
      const sigBuffer = Buffer.from(signature, 'base64');
      isValid = keypair.verify(dataToVerify, sigBuffer);
      
      if (!isValid) {
        console.log('[Auth] Raw failed, trying prefixed verification...');
        isValid = keypair.verify(prefixedDataToVerify, sigBuffer);
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
        role
      });
      console.log('[Auth] New user registered:', address);
    } else if (user.role !== role) {
      user.role = role;
      await user.save();
    }

    // 4. Issue JWT
    const jwtSecret = process.env.JWT_SECRET || 'zypherion_fallback_secret_67890';
    const token = jwt.sign(
      { address: user.address, role: user.role },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { address: user.address, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMe = async (req: any, res: Response) => {
  res.json({ user: req.user });
};
