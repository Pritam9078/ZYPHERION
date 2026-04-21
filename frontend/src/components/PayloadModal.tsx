import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PayloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: any;
}

const PayloadModal: React.FC<PayloadModalProps> = ({ isOpen, onClose, title, data }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl glass-blue border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto bg-black/40 font-mono text-xs leading-relaxed">
               <pre className="text-blue-400 whitespace-pre-wrap">
                 {JSON.stringify(data, null, 2)}
               </pre>
            </div>

            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end">
               <button 
                onClick={onClose}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-colors"
               >
                 Close Inspector
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PayloadModal;
