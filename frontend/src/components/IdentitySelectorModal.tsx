import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IdentitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (role: string) => void;
}

const IdentitySelectorModal = ({ isOpen, onClose, onSelect }: IdentitySelectorModalProps) => {
  const [selectedRole, setSelectedRole] = useState('Developer');

  const roles = [
    { id: 'Developer', label: 'Developer', desc: 'Build and integrate' },
    { id: 'DAOAdmin', label: 'DAO Administrator', desc: 'Protocol governance' },
    { id: 'NodeOperator', label: 'Verifier Node Operator', desc: 'Network security' },
    { id: 'Guest', label: 'Guest', desc: 'Explore the protocol' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md glass border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 relative shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="mb-8">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2 uppercase">Select Identity_</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Choose your role to initialize the correct telemetry and SLA profiles.</p>
            </div>
            
            <div className="space-y-3 mb-8">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`w-full p-4 rounded-2xl border text-left flex justify-between items-center transition-all ${
                    selectedRole === role.id 
                      ? 'bg-blue-500/10 border-blue-500/50 text-slate-900 dark:text-white ring-1 ring-blue-500/20' 
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  <div>
                    <span className="font-bold text-sm block">{role.label}</span>
                    <span className="text-[10px] opacity-60 font-medium">{role.desc}</span>
                  </div>
                  {selectedRole === role.id && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                    />
                  )}
                </button>
              ))}
            </div>

            <button 
              onClick={() => onSelect(selectedRole)}
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            >
              Sign Request_
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default IdentitySelectorModal;
