import { Request, Response } from 'express';
import Proof from '../models/Proof';
import LogicRule from '../models/LogicRule';

/**
 * Multi-Signature Governance Controller (Phase 3)
 */
export const approveProof = async (req: any, res: Response) => {
  const { proofId, signature } = req.body;
  const address = req.user.address;

  try {
    const proof = await Proof.findById(proofId).populate('ruleId');
    if (!proof) return res.status(404).json({ message: 'Proof not found' });

    const rule = proof.ruleId as any;
    if (!rule.isMultiSig) return res.status(400).json({ message: 'Rule is not Multi-Sig' });

    // Verify if caller is an authorized approver
    if (!rule.approvers.includes(address)) {
      return res.status(403).json({ message: 'Not an authorized approver' });
    }

    // Check if already signed
    const existing = proof.signatures.find(s => s.signer === address);
    if (existing) return res.status(400).json({ message: 'Already signed' });

    // Add signature
    proof.signatures.push({
      signer: address,
      signature: signature,
      timestamp: new Date()
    });

    // Check if quorum reached
    if (proof.signatures.length >= rule.requiredApprovals) {
      proof.status = 'verified';
      console.log(`[Zypherion] Multi-Sig Quorum Reached for Proof: ${proof._id}`);
    } else {
      proof.status = 'pending_approval';
    }

    await proof.save();
    res.json({ message: 'Signature registered', proof });

  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getPendingGovernance = async (req: any, res: Response) => {
  const address = req.user.address;

  try {
    // Find active multi-sig rules where the user is an approver
    const myRules = await LogicRule.find({ 
      isMultiSig: true, 
      approvers: address 
    });
    
    const ruleIds = myRules.map(r => r._id);

    // Find pending proofs for these rules
    const pendingProofs = await Proof.find({
      ruleId: { $in: ruleIds },
      status: { $in: ['pending', 'pending_approval'] },
      'signatures.signer': { $ne: address } // Only those I haven't signed yet
    }).populate('ruleId');

    res.json({ pending: pendingProofs });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
