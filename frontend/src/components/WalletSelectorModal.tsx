import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
const FREIGHTER_ID = 'freighter';
const ALBEDO_ID = 'albedo';
const XBULL_ID = 'xbull';
const HANA_ID = 'hana';

interface WalletSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (walletType: string) => void;
}

const WALLETS = [
  {
    id: FREIGHTER_ID,
    name: 'Freighter',
    icon: (
      <svg viewBox="0 0 40 40" className="w-8 h-8">
        <path fill="currentColor" d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20 20-8.954 20-20S31.046 0 20 0zm0 36c-8.837 0-16-7.163-16-16S11.163 4 20 4s16 7.163 16 16-7.163 16-16 16z" opacity=".2"/>
        <path fill="currentColor" d="M26 12H14c-1.105 0-2 .895-2 2v12c0 1.105.895 2 2 2h12c1.105 0 2-.895 2-2V14c0-1.105-.895-2-2-2zm-1 12H15v-8h10v8z"/>
      </svg>
    ),
    description: 'Standard Stellar wallet extension'
  },
  {
    id: ALBEDO_ID,
    name: 'Albedo',
    icon: (
      <svg viewBox="0 0 40 40" className="w-8 h-8">
        <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2" />
        <path fill="currentColor" d="M20 10l-8 12h16l-8-12z" />
      </svg>
    ),
    description: 'Web-based secure signer'
  },
  {
    id: XBULL_ID,
    name: 'xBull',
    icon: (
      <svg viewBox="0 0 40 40" className="w-8 h-8">
        <path fill="currentColor" d="M10 10h20v5H10zM10 20h20v5H10zM10 30h20v5H10z" />
        <path fill="currentColor" d="M15 5h10v30H15z" opacity=".3" />
      </svg>
    ),
    description: 'Cross-platform multi-chain wallet'
  },
  {
    id: HANA_ID,
    name: 'Hana',
    icon: (
      <svg viewBox="0 0 40 40" className="w-8 h-8">
        <path fill="currentColor" d="M20 5l15 25H5L20 5z" />
        <circle cx="20" cy="22" r="5" fill="white" />
      </svg>
    ),
    description: 'Modern multi-chain experience'
  }
];

export default function WalletSelectorModal({ isOpen, onClose, onSelect }: WalletSelectorModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-xl glass border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden max-h-[95vh] flex flex-col"
          >
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full -ml-32 -mb-32" />

            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative z-10 overflow-y-auto pr-1 scrollbar-hide">
              <div className="mb-6 text-center">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-[9px] font-bold text-blue-400 uppercase tracking-wider mb-3"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Security Protocol_04
                </motion.div>
                <h2 className="text-2xl font-bold text-white tracking-tighter mb-2">Select Uplink Provider_</h2>
                <p className="text-slate-400 text-[11px] max-w-xs mx-auto font-medium">Choose a supported Stellar wallet to establish your secure identity on the Zypherion network.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {WALLETS.map((wallet, idx) => (
                  <motion.button
                    key={wallet.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => onSelect(wallet.id)}
                    className="flex flex-col items-start p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group text-left relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all">
                      {wallet.icon}
                    </div>
                    
                    <h3 className="text-base font-bold text-white mb-0.5 group-hover:text-blue-400 transition-colors">{wallet.name}</h3>
                    <p className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors leading-tight">{wallet.description}</p>
                    
                    <div className="mt-3 flex items-center gap-2 text-[8px] font-bold uppercase tracking-wider text-blue-500 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                      Initialize Link
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7" />
                      </svg>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                  Encrypted via Curve25519_
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
