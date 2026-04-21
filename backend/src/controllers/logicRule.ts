import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import LogicRule from '../models/LogicRule';
import SystemSetting from '../models/SystemSetting';
import { verifyActionIntent } from '../utils/signature';

// @desc    Create a new logic rule
// @route   POST /api/rules
// @access  Private
export const createRule = async (req: AuthRequest, res: Response) => {
  const { name, description, conditions, condition, targetChain, status, automationConfig, signature, message, nonce } = req.body;

  if (!req.user?.address) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Global Protocol Halt Check
  const settings = await SystemSetting.findOne();
  if (settings?.protocolHalt) {
    return res.status(403).json({ message: 'PROTOCOL_HALTED: Operations are currently suspended by Overseer.' });
  }

  // Mandatory Action Signature Verification
  if (!signature || !message || !nonce) {
    return res.status(400).json({ message: 'Cryptographic authorization required for this action.' });
  }

  const verification = await verifyActionIntent(req.user.address, message, signature, nonce, 'CREATE_RULE');
  if (!verification.success) {
    return res.status(401).json({ message: verification.message });
  }

  const normalizedConditions = conditions ?? (condition || targetChain ? { condition, targetChain } : undefined);

  if (!name || !normalizedConditions) {
    return res.status(400).json({ message: 'Please provide name and conditions' });
  }

  try {
    const rule = await LogicRule.create({
      creator: req.user.address,
      name,
      description,
      conditions: normalizedConditions,
      status: status ?? 'active',
    });

    res.status(201).json(rule);
  } catch (error) {
    console.error('Error creating rule:', error);
    res.status(500).json({ message: 'Server error while creating rule' });
  }
};

// @desc    Get all rules for the logged-in user
// @route   GET /api/rules
// @access  Private
export const getMyRules = async (req: AuthRequest, res: Response) => {
  if (!req.user?.address) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const rules = await LogicRule.find({ creator: req.user.address }).sort({ createdAt: -1 });
    res.json(rules);
  } catch (error) {
    console.error('Error fetching rules:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a single rule by ID
// @route   GET /api/rules/:id
// @access  Private
export const getRuleById = async (req: AuthRequest, res: Response) => {
  if (!req.user?.address) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const rule = await LogicRule.findById(req.params.id);

    if (!rule) {
      return res.status(404).json({ message: 'Rule not found' });
    }

    if (rule.creator !== req.user.address) {
      return res.status(403).json({ message: 'Not authorized to view this rule' });
    }

    res.json(rule);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a rule
// @route   PUT /api/rules/:id
// @access  Private
export const updateRule = async (req: AuthRequest, res: Response) => {
  const { name, description, conditions, condition, targetChain, status } = req.body;

  if (!req.user?.address) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Global Protocol Halt Check
  const settings = await SystemSetting.findOne();
  if (settings?.protocolHalt) {
    return res.status(403).json({ message: 'PROTOCOL_HALTED: Rule updates are currently suspended.' });
  }

  try {
    const rule = await LogicRule.findById(req.params.id);

    if (!rule) {
      return res.status(404).json({ message: 'Rule not found' });
    }

    if (rule.creator !== req.user.address) {
      return res.status(403).json({ message: 'Not authorized to update this rule' });
    }

    // Mandatory Action Signature Verification
    const { signature, message, nonce } = req.body;
    if (!signature || !message || !nonce) {
      return res.status(400).json({ message: 'Cryptographic authorization required for this action.' });
    }

    const verification = await verifyActionIntent(req.user.address, message, signature, nonce, 'UPDATE_RULE');
    if (!verification.success) {
      return res.status(401).json({ message: verification.message });
    }

    const normalizedConditions = conditions ?? (condition || targetChain ? { condition, targetChain } : undefined);

    rule.name = name ?? rule.name;
    rule.description = description ?? rule.description;
    rule.conditions = normalizedConditions ?? rule.conditions;
    rule.status = status ?? rule.status;

    const updatedRule = await rule.save();
    res.json(updatedRule);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a rule
// @route   DELETE /api/rules/:id
// @access  Private
export const deleteRule = async (req: AuthRequest, res: Response) => {
  if (!req.user?.address) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Global Protocol Halt Check
  const settings = await SystemSetting.findOne();
  if (settings?.protocolHalt) {
    return res.status(403).json({ message: 'PROTOCOL_HALTED: Infrastructure decommissioning is suspended.' });
  }

  try {
    const rule = await LogicRule.findById(req.params.id);

    if (!rule) {
      return res.status(404).json({ message: 'Rule not found' });
    }

    if (rule.creator !== req.user.address) {
      return res.status(403).json({ message: 'Not authorized to delete this rule' });
    }

    // Mandatory Action Signature Verification
    const { signature, message, nonce } = req.body;
    if (!signature || !message || !nonce) {
      return res.status(400).json({ message: 'Cryptographic authorization required for this action.' });
    }

    const verification = await verifyActionIntent(req.user.address, message, signature, nonce, 'DELETE_RULE');
    if (!verification.success) {
      return res.status(401).json({ message: verification.message });
    }

    await rule.deleteOne();
    res.json({ message: 'Rule removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
