import React from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../hooks/useWallet';

const ProfileCard = () => {
  const { wallet } = useWallet();

  const getRoleBadge = (role: string) => {
    const roles: Record<string, { label: string; color: string }> = {
      DAOAdmin: { label: 'DAO Administrator', color: 'purple' },
      Developer: { label: 'Logic Architect', color: 'blue' },
      NodeOperator: { label: 'Verifier Node', color: 'emerald' },
      Guest: { label: 'Protocol Observer', color: 'slate' },
    };
    return roles[role] || { label: 'Unknown Role', color: 'slate' };
  };

  const badge = getRoleBadge(wallet.accountType || 'Guest');

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-8 rounded-[3rem] glass border-slate-200 dark:border-white/5 bg-gradient-to-br from-slate-50 dark:from-white/[0.02] to-transparent relative overflow-hidden group"
    >
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20">
            {wallet.address?.slice(0, 2).toUpperCase() || 'ZY'}
          </div>
          <div>
            <div className={`text-[10px] font-bold uppercase text-${badge.color}-600 dark:text-${badge.color}-400 tracking-wider mb-1`}>
              {badge.label}
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
              {wallet.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : 'Disconnected'}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Network</span>
            <span className="text-[10px] font-bold text-slate-900 dark:text-white uppercase">Stellar Testnet</span>
          </div>
          <div className="flex justify-between items-center px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
             <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Status</span>
             <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase">Synchronized</span>
             </span>
          </div>
        </div>
      </div>
      
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />
    </motion.div>
  );
};

export default ProfileCard;
