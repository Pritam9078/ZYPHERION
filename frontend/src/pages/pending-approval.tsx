import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useWalletContext } from '../context/WalletContext';
import { useSound } from '../hooks/useSound';

export default function PendingApproval() {
  const { wallet, connect } = useWalletContext();
  const { playHover, playClick } = useSound();
  const [isChecking, setIsChecking] = useState(false);

  const handleRefresh = async () => {
    setIsChecking(true);
    try {
      await connect(); // This re-authenticates and redirects if approved
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-zypher-bg text-slate-200">
      <div className="fixed inset-0 blueprint-bg opacity-20 pointer-events-none" />
      <Navbar />
      
      <main className="flex items-center justify-center min-h-[85vh] px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-16 text-center max-w-xl glass-blue border-white/5 rounded-[3.5rem] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
          
          <div className="w-24 h-24 mx-auto mb-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.1)]">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.div>
          </div>

          <h2 className="text-4xl font-black text-white tracking-tighter mb-6 uppercase">Awaiting Authorization_</h2>
          
          <p className="text-slate-400 mb-10 leading-relaxed text-sm font-medium">
            Your application for a <span className="text-amber-400 font-black tracking-widest uppercase">{wallet.accountType}</span> account is currently in the high-priority review queue. 
            Administrator consensus is required to activate protocol-wide signing capabilities.
          </p>

          <div className="space-y-6">
            <button 
              onClick={() => { playClick(); handleRefresh(); }}
              onMouseEnter={playHover}
              disabled={isChecking}
              className={`w-full py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${isChecking ? 'bg-white/5 text-slate-500 border-white/5 cursor-not-allowed' : 'bg-white text-black hover:bg-slate-200 border-white shadow-xl shadow-white/10'}`}
            >
              {isChecking ? 'Querying State...' : 'Check Status Now'}
            </button>

            <div className="flex items-center justify-center gap-4 py-4 px-8 bg-black/40 rounded-2xl border border-white/5">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Status: Review_In_Progress</span>
            </div>
          </div>

          <p className="mt-12 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            Zypherion Protocol Governance v2.4.1
          </p>
        </motion.div>
      </main>
    </div>
  );
}
