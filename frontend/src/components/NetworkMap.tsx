import React from 'react';
import { motion } from 'framer-motion';

const NetworkMap = () => {
  return (
    <div className="relative w-full h-[400px] glass border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col items-center justify-center px-12">
      <div className="absolute inset-0 bg-blue-500/5 opacity-20 blueprint-bg" />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
      
      {/* Top Row: Target Chains */}
      <div className="flex justify-between w-full mb-12 relative z-10 px-20">
         {[
           { name: 'Ethereum', icon: 'Ξ', color: 'text-blue-400' },
           { name: 'Arbitrum', icon: 'A', color: 'text-indigo-400' },
           { name: 'Base', icon: 'B', color: 'text-blue-500' }
         ].map((chain, i) => (
           <motion.div 
             key={i}
             animate={{ y: [0, -5, 0] }}
             transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
             className="flex flex-col items-center gap-2"
           >
              <div className="w-12 h-12 glass border-white/10 rounded-xl flex items-center justify-center text-lg font-black group-hover:border-blue-500/50 transition-colors">
                 <span className={chain.color}>{chain.icon}</span>
              </div>
              <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">{chain.name}</span>
           </motion.div>
         ))}
      </div>

      {/* Center: Zypherion Core & Interchain Bridges */}
      <div className="relative flex items-center justify-center w-full">
         
         {/* Interchain Dispatch Lines */}
         <div className="absolute inset-0 flex justify-around items-center opacity-30">
            <svg className="w-full h-full" viewBox="0 0 800 200">
               <motion.path 
                 d="M 100 0 L 400 100 M 400 0 L 400 100 M 700 0 L 400 100" 
                 stroke="url(#grad1)" 
                 strokeWidth="1" 
                 fill="none" 
                 initial={{ pathLength: 0 }}
                 animate={{ pathLength: 1 }}
                 transition={{ duration: 2, repeat: Infinity }}
               />
               <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                     <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0 }} />
                     <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                  </linearGradient>
               </defs>
            </svg>
         </div>

         {/* Zypherion Core */}
         <div className="relative z-20 flex flex-col items-center gap-6">
            <div className="relative">
               <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-30px] border border-blue-500/20 rounded-full border-dashed"
               />
               <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-28 h-28 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-[0_0_80px_rgba(37,99,235,0.3)] border border-blue-400/50 relative z-10"
               >
                  <div className="flex flex-col items-center">
                     <span className="font-black text-3xl tracking-tighter">Z_</span>
                     <div className="flex gap-1 mt-1">
                        <div className="w-1 h-1 bg-white/50 rounded-full animate-pulse" />
                        <div className="w-1 h-1 bg-white/50 rounded-full animate-pulse delay-75" />
                        <div className="w-1 h-1 bg-white/50 rounded-full animate-pulse delay-150" />
                     </div>
                  </div>
               </motion.div>
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-400 bg-blue-500/10 px-6 py-1.5 rounded-full border border-blue-500/20 shadow-lg shadow-blue-500/10">INTERCHAIN_V2_ORCHESTRATOR</span>
         </div>
      </div>

      {/* Bottom: Stellar Finality Layer */}
      <div className="mt-12 relative z-10 flex flex-col items-center gap-3">
         <div className="h-10 w-[1px] bg-gradient-to-b from-blue-500/50 to-transparent mb-2" />
         <motion.div 
           animate={{ y: [0, 5, 0] }}
           transition={{ duration: 4, repeat: Infinity }}
           className="w-16 h-16 glass border-white/10 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/20"
         >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
         </motion.div>
         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Stellar_Finality_Ledger</span>
         
         {/* Live Verification Pings */}
         <div className="absolute top-1/2 left-full ml-12 whitespace-nowrap">
            <div className="flex items-center gap-2 text-[8px] font-black text-emerald-500 uppercase tracking-widest">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
               SECURED_ON_CHAIN
            </div>
         </div>
      </div>
    </div>
  );
};

export default NetworkMap;
