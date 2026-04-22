import React from 'react';
import { motion } from 'framer-motion';

const Preloader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-zypher-bg z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <div className="w-24 h-24 mb-8 relative">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 bg-blue-500 rounded-full blur-2xl"
          />
          <div className="relative z-10 w-full h-full rounded-2xl flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Zypherion Loading" className="w-full h-full object-contain" />
          </div>
        </div>
        
        <motion.h1 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-2xl font-bold tracking-[0.3em] text-white"
        >
          ZYPHERION
        </motion.h1>
        
        <div className="mt-4 w-12 h-[2px] bg-blue-500/20 rounded-full overflow-hidden">
          <motion.div 
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-full bg-blue-500"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Preloader;
