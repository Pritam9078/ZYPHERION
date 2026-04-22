import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Billing from '../models/Billing';

// @desc    Record a new deposit transaction
// @route   POST /api/billing/deposit
// @access  Private
export const createDeposit = async (req: AuthRequest, res: Response) => {
  const { depositAmount, txHash, currency } = req.body;
  const userAddress = req.user?.address;

  if (!userAddress) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!depositAmount || !txHash) {
    return res.status(400).json({ message: 'Missing deposit amount or transaction hash' });
  }

  try {
    const existing = await Billing.findOne({ txHash });
    if (existing) {
      return res.status(400).json({ message: 'Transaction hash already submitted' });
    }

    const billingRecord = await Billing.create({
      userAddress,
      depositAmount,
      currency: currency || 'XLM',
      txHash,
      status: 'pending',
      type: 'deposit'
    });

    res.status(201).json(billingRecord);
  } catch (error) {
    console.error('Error recording deposit:', error);
    res.status(500).json({ message: 'Server error recording deposit' });
  }
};

// @desc    Get all billing records for the user
// @route   GET /api/billing
// @access  Private
export const getUserDeposits = async (req: AuthRequest, res: Response) => {
  const userAddress = req.user?.address;

  if (!userAddress) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const deposits = await Billing.find({ userAddress }).sort({ createdAt: -1 });
    res.json(deposits);
  } catch (error) {
    console.error('Error fetching deposits:', error);
    res.status(500).json({ message: 'Server error fetching deposits' });
  }
};
