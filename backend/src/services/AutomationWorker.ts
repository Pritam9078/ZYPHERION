import cron from 'node-cron';
import Proof from '../models/Proof';
import LogicRule from '../models/LogicRule';
import SystemSetting from '../models/SystemSetting';
import User from '../models/User';
import BatchProof from '../models/BatchProof';

export const initAutomationWorker = (io: any) => {
  console.log('[Zypherion] Initializing Automation Worker...');

  // Run every minute
  cron.schedule('* * * * *', async () => {
    console.log('[Zypherion] Running Automation Health Check...');
    
    try {
      // 0. Check Protocol Halt Status
      const settings = await SystemSetting.findOne();
      if (settings?.protocolHalt) {
        console.log('[Zypherion] Protocol is HALTED. Skipping automation cycle.');
        return;
      }

      // 1. Find pending proofs that need auto-execution if enabled
      const pendingOps = await Proof.find({ status: 'pending' }).populate('ruleId');
      
      for (const op of pendingOps) {
        const rule = op.ruleId as any;
        
        // Simulate auto-execution if enabled in rule logic (future property)
        if (rule && rule.automationConfig?.autoExecute) {
          console.log(`[Zypherion] Auto-executing Proof: ${op._id}`);
          
          // PHASE 1: Gas Abstraction Check
          if (rule.useGasAbstraction) {
            const user = await User.findOne({ address: rule.creator });
            const estimatedGas = 2.5; // Mock estimate
            
            if (!user || user.gasBalance < estimatedGas) {
              console.log(`[Zypherion] Insufficient gas balance for ${rule.creator}`);
              io.to(rule.creator).emit('execution_update', {
                type: 'ERROR',
                message: `Insufficient Gas Credits for ${rule.name}`,
                opId: op._id
              });
              continue;
            }
            
            user.gasBalance -= estimatedGas;
            await user.save();
            console.log(`[Zypherion] Deducted ${estimatedGas} gas credits from ${rule.creator}`);
          }

          // Simulate verification delay
          op.status = 'verified';
          await op.save();
          
          const isCrossChain = !!rule.targetChain;
          const msg = isCrossChain 
            ? `Interchain execution triggered on ${rule.targetChain} for ${rule.name}`
            : `Auto-execution successful for ${rule.name}`;

          // Emit real-time update to user
          io.to(rule.creator).emit('execution_update', {
            type: 'SUCCESS',
            message: msg,
            opId: op._id,
            isCrossChain,
            targetChain: rule.targetChain
          });

          if (isCrossChain) {
            console.log(`[Zypherion] CROSS-CHAIN DISPATCH: Sending payload to ${rule.targetChain}`);
          }
        }
      }

      // 2. Broadcast system health to admins
      io.emit('system_stats', {
        timestamp: new Date(),
        activeConnections: io.engine.clientsCount,
        loadIndex: 'LOW'
      });
      
      // PHASE 2: Scheduled & Recurring Logic (Chronos Engine)
      const now = new Date();
      const scheduledRules = await LogicRule.find({
        status: 'active',
        scheduledAt: { $lte: now }
      });

      for (const rule of scheduledRules) {
        console.log(`[Zypherion] Triggering Scheduled Rule: ${rule.name}`);
        
        // PHASE 2: Verifiable External Data Fetching
        let dataVerified = true;
        if (rule.dataSourceUrl) {
          try {
            console.log(`[Zypherion] Fetching external data from: ${rule.dataSourceUrl}`);
            const response = await fetch(rule.dataSourceUrl);
            if (!response.ok) throw new Error(`HTTP_${response.status}`);
            
            const data = await response.json();
            
            if (rule.dataSourcePath) {
              const jp = require('jsonpath');
              const extracted = jp.query(data, rule.dataSourcePath);
              if (!extracted || extracted.length === 0) {
                 throw new Error(`JSONPath '${rule.dataSourcePath}' returned no results.`);
              }
              console.log(`[Zypherion] Data Oracle Extracted Value:`, extracted[0]);
              // In production, cryptographically sign this extracted value here
            }

            console.log(`[Zypherion] External data verified for ${rule.name}`);
          } catch (dataErr) {
            console.error(`[Zypherion] Data fetch failed for ${rule.name}:`, dataErr);
            dataVerified = false;
            io.to(rule.creator).emit('execution_update', {
              type: 'ERROR',
              message: `Data Feed Failure: ${rule.name} skipped.`,
            });
          }
        }

        if (!dataVerified) continue;

        // 1. Create a new operation (Proof) for this scheduled rule
        const op = new Proof({
          creator: rule.creator,
          ruleId: rule._id,
          status: 'pending',
          metadata: { trigger: 'schedule', scheduledAt: rule.scheduledAt }
        });
        await op.save();

        // 2. Handle Recurrence
        if (rule.recurrenceInterval && rule.recurrenceInterval > 0) {
          rule.scheduledAt = new Date(now.getTime() + rule.recurrenceInterval * 1000);
        } else {
          // One-time execution: clear schedule but keep rule active
          rule.scheduledAt = undefined;
        }
        await rule.save();

        io.to(rule.creator).emit('execution_update', {
          type: 'INFO',
          message: `Scheduled execution started for ${rule.name}`,
          opId: op._id
        });
      }

      // PHASE 3: Proof Batching Engine (Aggregation)
      const verifiedProofs = await Proof.find({ status: 'verified', txHash: { $exists: false } });
      if (verifiedProofs.length >= 3) { // Minimum batch size for aggregation
        console.log(`[Zypherion] Initializing Batch Aggregation for ${verifiedProofs.length} proofs...`);
        
        // Mock Aggregation Logic (Recursive SNARK Simulation)
        const batchData = `AGGREGATED_PROOF_V3_${Date.now()}`;
        const proofIds = verifiedProofs.map(p => p._id);
        
        const batch = new BatchProof({
          proofIds,
          aggregatedProofData: batchData,
          status: 'submitted',
          txHash: `B_TX_${Math.random().toString(36).substring(7).toUpperCase()}`,
          targetChain: 'Interchain_Aggregator'
        });
        
        await batch.save();

        // Update individual proofs with the batch transaction hash
        await Proof.updateMany(
          { _id: { $in: proofIds } },
          { txHash: batch.txHash }
        );

        console.log(`[Zypherion] Batch Aggregation Successful: ${batch.txHash}`);
        io.emit('system_stats', {
          timestamp: new Date(),
          lastBatchHash: batch.txHash,
          batchSize: proofIds.length
        });
      }

    } catch (err) {
      console.error('[Zypherion] Automation Worker Error:', err);
    }
  });
};
