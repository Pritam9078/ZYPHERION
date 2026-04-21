import cron from 'node-cron';
import Proof from '../models/Proof';
import LogicRule from '../models/LogicRule';

export const initAutomationWorker = (io: any) => {
  console.log('[Zypherion] Initializing Automation Worker...');

  // Run every minute
  cron.schedule('* * * * *', async () => {
    console.log('[Zypherion] Running Automation Health Check...');
    
    try {
      // 1. Find pending proofs that need auto-execution if enabled
      const pendingOps = await Proof.find({ status: 'pending' }).populate('ruleId');
      
      for (const op of pendingOps) {
        const rule = op.ruleId as any;
        
        // Simulate auto-execution if enabled in rule logic (future property)
        if (rule.automationConfig?.autoExecute) {
          console.log(`[Zypherion] Auto-executing Proof: ${op._id}`);
          
          // Simulate verification delay
          op.status = 'verified';
          await op.save();
          
          // Emit real-time update to user
          io.to(rule.creator).emit('execution_update', {
            type: 'SUCCESS',
            message: `Auto-execution successful for ${rule.name}`,
            opId: op._id
          });
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
