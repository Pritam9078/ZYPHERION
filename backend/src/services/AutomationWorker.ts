import cron from 'node-cron';
import Proof from '../models/Proof';
import LogicRule from '../models/LogicRule';
import SystemSetting from '../models/SystemSetting';
import User from '../models/User';

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

    } catch (err) {
      console.error('[Zypherion] Automation Worker Error:', err);
    }
  });
};
