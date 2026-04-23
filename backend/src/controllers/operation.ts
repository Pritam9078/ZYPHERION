import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Proof from '../models/Proof';
import LogicRule from '../models/LogicRule';
import SystemSetting from '../models/SystemSetting';
import { verifyActionIntent } from '../utils/signature';

// @desc    Get all proofs/operations for the logged-in user
// @route   GET /api/ops
// @access  Private
export const getMyOperations = async (req: AuthRequest, res: Response) => {
  if (!req.user?.address) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const proofs = await Proof.find({ submitter: req.user.address })
      .populate('ruleId', 'name')
      .sort({ createdAt: -1 });
    
    res.json(proofs);
  } catch (error) {
    console.error('Error fetching operations:', error);
    res.status(500).json({ message: 'Server error while fetching operations' });
  }
};

// @desc    Request a new proof
// @route   POST /api/ops/proofs/request
// @access  Private
export const requestProof = async (req: AuthRequest, res: Response) => {
  const { ruleId } = req.body;

  if (!req.user?.address) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Global Protocol Halt Check
  const settings = await SystemSetting.findOne();
  if (settings?.protocolHalt) {
    return res.status(403).json({ message: 'PROTOCOL_HALTED: Proof generation is currently disabled.' });
  }

  if (!ruleId) {
    return res.status(400).json({ message: 'Please provide ruleId' });
  }

  try {
    // Mock proof generation logic
    const mockProofData = `proof_zphi_${Math.random().toString(36).substring(7)}`;
    
    const proof = await Proof.create({
      ruleId,
      submitter: req.user.address,
      proofData: mockProofData,
      status: 'pending'
    });

    res.status(201).json(proof);
  } catch (error) {
    console.error('Error requesting proof:', error);
    res.status(500).json({ message: 'Server error while requesting proof' });
  }
};

export const triggerExecution = async (req: AuthRequest, res: Response) => {
  const { ruleId, signature, message, nonce } = req.body;
  const userAddress = req.user?.address;

  if (!userAddress) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const settings = await SystemSetting.findOne();
  if (settings?.protocolHalt) {
    return res.status(403).json({ message: 'PROTOCOL_HALTED: Execution triggers are currently suspended.' });
  }

  if (!ruleId) {
    return res.status(400).json({ message: 'Please provide ruleId' });
  }

  if (!signature || !message || !nonce) {
    return res.status(400).json({ message: 'Cryptographic authorization required to trigger execution.' });
  }

  const verification = await verifyActionIntent(userAddress, message, signature, nonce, 'TRIGGER_EXECUTION');
  if (!verification.success) {
    return res.status(403).json({ message: verification.message });
  }

  try {
    const rule = await LogicRule.findById(ruleId);
    if (!rule) return res.status(404).json({ message: 'Logic registry rule not found.' });

    const proof = await Proof.create({
      ruleId,
      submitter: userAddress,
      proofData: `auto_proof_${Math.random().toString(36).substring(7)}`,
      status: 'pending'
    });

    if ((req as any).io) {
      (req as any).io.to(userAddress).emit('execution_update', {
        message: `Execution triggered for ${rule.name}`,
        type: 'INFO'
      });
    }

    res.status(201).json({
      message: 'Execution pipeline initialized.',
      executionId: proof._id,
      status: proof.status
    });
  } catch (error) {
    console.error('Error triggering execution:', error);
    res.status(500).json({ message: 'Server error during execution trigger' });
  }
};

// @desc    Submit proof to "contract"
// @route   POST /api/ops/proofs/submit
// @access  Private
export const submitProof = async (req: AuthRequest, res: Response) => {
  const { opId } = req.body;

  if (!req.user?.address) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Global Protocol Halt Check
  const settings = await SystemSetting.findOne();
  if (settings?.protocolHalt) {
    return res.status(403).json({ message: 'PROTOCOL_HALTED: Attestation and finality is currently frozen.' });
  }

  try {
    const proof = await Proof.findById(opId);
    if (!proof) {
      return res.status(404).json({ message: 'Operation not found' });
    }

    // Mandatory Action Signature Verification
    const { signature, message, nonce } = req.body;
    if (!signature || !message || !nonce) {
      return res.status(400).json({ message: 'Cryptographic authorization required to submit proof.' });
    }

    const verification = await verifyActionIntent(req.user.address, message, signature, nonce, 'SUBMIT_PROOF');
    if (!verification.success) {
      return res.status(403).json({ message: verification.message });
    }

    if (proof.submitter !== req.user.address) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    try {
      const { DNAProofSDK } = require('@dnaproof/sdk');
      const sdk = new DNAProofSDK({
        ethereum: {
          rpcUrl: process.env.DNA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
          registryAddress: process.env.DNA_REGISTRY_ADDRESS || "0x28f1C0A9fcd198D50Be49821585D60a6081BeCd6",
          accessControlAddress: process.env.DNA_ACCESS_CONTROL_ADDRESS || "0x96FC568bC13eb9F4EAbB47190525158De9FCc99A",
          auditLogsAddress: process.env.DNA_AUDIT_LOGS_ADDRESS || "0x0B67f4148c9b6Fdb0F8D691fEC5a86246F543A5e"
        },
        ipfs: {
          gatewayUrl: "https://gateway.pinata.cloud/ipfs",
          authHeader: `Bearer ${process.env.DNA_PINATA_JWT || ''}`
        }
      });
      await sdk.init();
      
      const isVerified = await sdk.verifyDocument(proof.proofData);
      if (!isVerified) {
        return res.status(400).json({ message: 'DNAProof Verification Failed: Document hash is invalid or not registered.' });
      }
      console.log(`[Zypherion] DNAProof Oracle Verification Success for Hash: ${proof.proofData}`);
    } catch (dnaError: any) {
      console.error('[Zypherion] DNAProof Verification Error:', dnaError);
      return res.status(500).json({ message: 'DNAProof Oracle Error: ' + dnaError.message });
    }

    // Mock contract interaction
    proof.status = 'verified';
    proof.txHash = '0x' + Math.random().toString(16).padEnd(64, '0').substring(2, 66);
    
    await proof.save();
    res.json(proof);
  } catch (error) {
    console.error('Error submitting proof:', error);
    res.status(500).json({ message: 'Server error while submitting proof' });
  }
};

// @desc    Get specific proof status
// @route   GET /api/ops/proof/:id
// @access  Private
export const getProofStatus = async (req: AuthRequest, res: Response) => {
  try {
    const proof = await Proof.findById(req.params.id).populate('ruleId', 'name');
    if (!proof) {
      return res.status(404).json({ message: 'Proof not found' });
    }
    res.json(proof);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching proof status' });
  }
};
