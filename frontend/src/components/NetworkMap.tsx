import React from 'react';
import { motion } from 'framer-motion';

const NetworkMap = () => {
  return (
    <div className="relative w-full h-[550px] glass border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col items-center justify-between pt-12 pb-8 px-4 md:px-12">
      {/* Background cleaned - Grid removed */}
      
      {/* Top Row: Target Chains */}
      <div className="flex justify-between w-full relative z-10 px-4 md:px-24">
         {[
           { name: 'Ethereum', icon: 'Ξ', color: 'text-blue-400' },
           { name: 'Arbitrum', icon: 'A', color: 'text-indigo-400' },
           { name: 'Base', icon: 'B', color: 'text-blue-500' }
         ].map((chain, i) => (
           <motion.div 
             key={i}
             animate={{ y: [0, -5, 0] }}
             transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
             className="flex flex-col items-center gap-3"
           >
              <div className="w-14 h-14 glass-premium border-white/10 rounded-2xl flex items-center justify-center text-xl font-bold group-hover:border-blue-500/50 transition-all shadow-2xl">
                 <span className={chain.color}>{chain.icon}</span>
              </div>
              <span className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">{chain.name}</span>
           </motion.div>
         ))}
      </div>

      {/* Center: Zypherion Core & Interchain Bridges */}
      <div className="relative flex items-center justify-center w-full flex-1">
         
         {/* Interchain Dispatch Lines */}
         <div className="absolute inset-0 flex justify-around items-center opacity-30">
            <svg className="w-full h-full" viewBox="0 0 800 300">
               <motion.path 
                 d="M 150 20 L 400 150 M 400 20 L 400 150 M 650 20 L 400 150" 
                 stroke="url(#grad1)" 
                 strokeWidth="1.5" 
                 fill="none" 
                 initial={{ pathLength: 0 }}
                 animate={{ pathLength: 1 }}
                 transition={{ duration: 2.5, repeat: Infinity }}
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
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-40px] border border-blue-500/10 rounded-full border-dashed"
               />
               <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="w-32 h-32 bg-blue-600 rounded-[3rem] flex items-center justify-center text-white shadow-[0_0_100px_rgba(37,99,235,0.25)] border border-blue-400/50 relative z-10"
               >
                  <div className="flex flex-col items-center">
                     <span className="font-bold text-4xl tracking-tighter">Z_</span>
                     <div className="flex gap-1.5 mt-2">
                        <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" />
                        <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse delay-75" />
                        <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse delay-150" />
                     </div>
                  </div>
               </motion.div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-blue-400 bg-blue-500/5 px-8 py-2 rounded-full border border-blue-500/10 shadow-2xl backdrop-blur-md">INTERCHAIN_V2_ORCHESTRATOR</span>
         </div>
      </div>

      {/* Bottom: Stellar Finality Layer */}
      <div className="relative z-10 flex flex-col items-center gap-4">
         <div className="h-8 md:h-12 w-[1px] bg-gradient-to-b from-blue-500/30 to-transparent" />
         <motion.div 
           animate={{ y: [0, 5, 0] }}
           transition={{ duration: 4, repeat: Infinity }}
           className="w-20 h-20 glass-premium border-white/10 rounded-3xl flex items-center justify-center text-white shadow-2xl"
         >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
         </motion.div>
         <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-4">Stellar_Finality_Ledger</span>
         
         {/* Live Verification Pings */}
         <div className="absolute top-8 right-8">
            <div className="flex items-center gap-3 text-[9px] font-bold text-emerald-500 uppercase tracking-[0.2em] bg-emerald-500/5 px-4 py-2 rounded-xl border border-emerald-500/10 backdrop-blur-md">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
               SECURED_ON_CHAIN
            </div>
         </div>
      </div>
    </div>
  );
};

export default NetworkMap;
