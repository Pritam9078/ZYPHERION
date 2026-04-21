import React from 'react';
import { motion } from 'framer-motion';

const NetworkMap = () => {
  return (
    <div className="relative w-full h-[300px] glass border-white/5 rounded-[2.5rem] overflow-hidden flex items-center justify-around px-12">
      <div className="absolute inset-0 bg-blue-500/5 opacity-20 blueprint-bg" />
      
      {/* Ethereum Node */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="relative z-10 flex flex-col items-center gap-4"
      >
        <div className="w-16 h-16 bg-slate-800 rounded-2xl border border-white/10 flex items-center justify-center text-blue-400 group hover:border-blue-500 transition-colors">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.37 4.35zm.056-17.97L4.633 11.71l7.367 4.35 7.37-4.35L12 0z"/>
          </svg>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ethereum_L1</span>
      </motion.div>

      {/* Verification Path */}
      <div className="flex-1 h-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 relative">
        <motion.div 
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-20 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
        />
      </div>

      {/* Zypherion Core */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative">
           <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-20px] border border-blue-500/20 rounded-full border-dashed"
           />
           <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-[0_0_50px_rgba(37,99,235,0.4)] border border-blue-400/50 relative z-10">
              <span className="font-black text-2xl tracking-tighter">Z_</span>
           </div>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 bg-blue-500/10 px-4 py-1 rounded-full">Protocol_Core</span>
      </div>

      {/* Verification Path */}
      <div className="flex-1 h-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 relative">
        <motion.div 
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-20 h-full bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-50"
        />
      </div>

      {/* Stellar Node */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        className="relative z-10 flex flex-col items-center gap-4"
      >
        <div className="w-16 h-16 bg-slate-800 rounded-2xl border border-white/10 flex items-center justify-center text-white">
           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
           </svg>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Stellar_Finality</span>
      </motion.div>
    </div>
  );
};

export default NetworkMap;
