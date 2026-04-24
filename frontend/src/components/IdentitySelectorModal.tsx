import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IdentitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (role: string) => void;
}

const IdentitySelectorModal = ({ isOpen, onClose, onSelect }: IdentitySelectorModalProps) => {
  const [selectedRole, setSelectedRole] = useState('Developer');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-lg glass-premium glass-glow border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 relative shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
          >
            {/* Decorative background for the modal */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full -ml-32 -mb-32" />

            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors z-20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="mb-6 relative z-10 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-[9px] font-bold text-blue-400 uppercase tracking-wider mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Identity_Protocol_Secure
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tighter mb-2 uppercase">Select Identity_</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto">Choose your specialized role to initialize the correct protocol telemetry.</p>
            </div>
            
            <div className="space-y-2 mb-6 relative z-10 overflow-y-auto pr-1 scrollbar-hide">
              {[
                { id: 'Developer', label: 'Developer', desc: 'Build logic & integrate SDKs', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4', color: 'blue' },
                { id: 'DAOAdmin', label: 'DAO Administrator', desc: 'Manage governance & overrides', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: 'red' },
                { id: 'NodeOperator', label: 'Verifier Node Operator', desc: 'Maintain network health & rewards', icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'emerald' },
                { id: 'Guest', label: 'Guest', desc: 'Observe protocol in real-time', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z', color: 'slate' }
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`w-full p-4 rounded-2xl border text-left flex justify-between items-center transition-all ${
                    selectedRole === role.id 
                      ? 'bg-blue-600/10 border-blue-500/50 text-slate-900 dark:text-white ring-1 ring-blue-500/20' 
                      : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                      selectedRole === role.id ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500'
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={role.icon} />
                      </svg>
                    </div>
                    <div>
                      <span className="font-bold text-xs block uppercase tracking-tight">{role.label}</span>
                      <span className="text-[9px] opacity-60 font-medium tracking-wider uppercase">{role.desc}</span>
                    </div>
                  </div>
                  {selectedRole === role.id && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.6)]" 
                    />
                  )}
                </button>
              ))}
            </div>

            <button 
              onClick={() => onSelect(selectedRole)}
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-2xl active:scale-[0.97] border border-transparent dark:border-white/20"
            >
              Initialize_Uplink
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default IdentitySelectorModal;
