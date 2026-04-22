import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Preloader from '../components/Preloader';
import Navbar from '../components/Navbar';
import { useWallet } from '../hooks/useWallet';
import Link from 'next/link';

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Developer');
  const { wallet, connect } = useWallet();

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500);
  }, []);

  const handleConnect = () => {
    setIsRoleModalOpen(false);
    connect(selectedRole);
  };

  if (loading) return <Preloader />;

  return (
    <div className="min-h-screen bg-zypher-bg text-slate-200 selection:bg-blue-500/30 overflow-hidden">
      {/* Blueprint & Grid Background */}
      <div className="fixed inset-0 blueprint-bg opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.05),transparent)] pointer-events-none" />
      
      {/* Ambient Visual Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />

      <Navbar />
      
      <main className="relative z-10 container mx-auto px-6 pt-24 pb-32 flex flex-col items-center">
        
        {/* Superior Status Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-4 px-5 py-2 rounded-2xl border border-blue-500/20 bg-blue-500/5 backdrop-blur-md"
        >
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
          <span className="text-[10px] font-black text-blue-400 tracking-[0.25em] uppercase">Status: Protocol_Nominal_Alpha</span>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl mb-20"
        >
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-[0.9]">
            Infrastructure <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">Sovereignty_</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Define, verify, and automate cross-chain logic with cryptographic certainty. Zypherion removes middlemen from state attestation.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {wallet.address ? (
               <Link 
                href={wallet.role === 'admin' ? '/admin' : '/dashboard'}
                className="px-12 py-5 bg-white text-slate-950 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/10 hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1"
               >
                 Launch Sovereign Command
               </Link>
            ) : (
              <button 
                onClick={() => setIsRoleModalOpen(true)}
                className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 hover:bg-blue-500 transition-all transform hover:-translate-y-1 active:scale-95"
              >
                Establish Secure Uplink_
              </button>
            )}
            
            <button className="px-12 py-5 glass text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white/5 transition-all border border-white/10">
              Technical Documentation
            </button>
          </div>
        </motion.div>

        {/* Architecture Visualizer Placeholder */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-6xl mb-32 p-1 bg-gradient-to-br from-blue-500/20 via-transparent to-indigo-500/20 rounded-[3rem]"
        >
          <div className="bg-zypher-bg/80 backdrop-blur-3xl rounded-[2.9rem] p-12 border border-white/5 overflow-hidden relative">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
                {[
                  { label: 'Latency', val: '1.2s', desc: 'Average verification finality' },
                  { label: 'Throughput', val: '14k+', desc: 'Events processed per hour' },
                  { label: 'Security', val: 'ECC', desc: 'Curve25519 Native Ops' },
                  { label: 'Network', val: 'Sync', desc: 'Stellar-Ethereum Realtime' }
                ].map((s, i) => (
                  <div key={i} className="text-center md:text-left">
                     <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{s.label}</div>
                     <div className="text-4xl font-bold text-white mb-2">{s.val}</div>
                     <div className="text-[10px] text-slate-400 font-medium">{s.desc}</div>
                  </div>
                ))}
             </div>
             
             {/* Subtle Pulse Animation in background */}
             <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 10, repeat: Infinity }}
                  className="w-[600px] h-[600px] border border-blue-500 rounded-full"
                />
             </div>
          </div>
        </motion.div>

        {/* Value Proposition */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {[
            { 
              title: 'Proof Isolation', 
              desc: 'Execute simulation in isolated sandboxes before on-chain commitment.',
              icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
            },
            { 
              title: 'Autonomous Flow', 
              desc: 'Background workers ensure your logic is verified and finalized 24/7.',
              icon: 'M13 10V3L4 14h7v7l9-11h-7z'
            },
            { 
              title: 'Unified Audit', 
              desc: 'Every state attestation is indexed and uniquely traceable on-chain.',
              icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'
            }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + (i * 0.1) }}
              className="p-10 rounded-[2.5rem] glass hover:border-blue-500/30 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:bg-blue-600 group-hover:border-transparent transition-all">
                <svg className="w-6 h-6 text-blue-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon} />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-tighter">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium opacity-80">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Pricing & Tiers Section */}
        <div className="w-full max-w-6xl mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white tracking-tighter mb-4">Enterprise-Grade Tiers_</h2>
            <p className="text-slate-400">Scale your cross-chain automation with our deposit-based SaaS models.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { tier: 'Free', price: '$0', desc: 'Testnet gas & basic UI', proofs: '1,000 proofs/mo', color: 'slate' },
              { tier: 'Basic', price: '$20', desc: '1x API key, email support', proofs: '10,000 proofs/mo', color: 'blue' },
              { tier: 'Pro', price: '$80', desc: '5x keys, AI ZKML tools', proofs: '50,000 proofs/mo', color: 'indigo' },
              { tier: 'Enterprise', price: 'Custom', desc: '24/7 SLA & Dedicated Nodes', proofs: 'Unlimited', color: 'emerald' },
            ].map((plan, idx) => (
              <div key={idx} className="glass p-8 rounded-[2rem] border border-white/5 hover:border-white/20 transition-all flex flex-col">
                <div className={`text-[10px] font-black uppercase tracking-widest text-${plan.color}-400 mb-2`}>{plan.tier} Plan</div>
                <div className="text-4xl font-black text-white mb-4">{plan.price}<span className="text-sm text-slate-500 font-medium">/mo</span></div>
                <div className="text-sm text-slate-400 font-medium mb-8 flex-1">{plan.desc}</div>
                <div className="p-4 bg-black/30 rounded-xl mb-8">
                  <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Quota</div>
                  <div className="text-sm font-bold text-white">{plan.proofs}</div>
                </div>
                <button 
                  onClick={() => setIsRoleModalOpen(true)}
                  className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${idx === 2 ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}
                >
                  {idx === 3 ? 'Contact Sales' : 'Deploy Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Role Selection Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass border border-white/10 rounded-[2.5rem] p-8 relative"
          >
            <button 
              onClick={() => setIsRoleModalOpen(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-2xl font-black text-white tracking-tighter mb-2">Select Identity_</h3>
            <p className="text-sm text-slate-400 mb-8">Choose your role to initialize the correct telemetry and SLA profiles.</p>
            
            <div className="space-y-3 mb-8">
              {['Developer', 'DAOAdmin', 'NodeOperator', 'Guest'].map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full p-4 rounded-2xl border text-left flex justify-between items-center transition-all ${selectedRole === role ? 'bg-blue-500/10 border-blue-500/50 text-white' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
                >
                  <span className="font-bold text-sm">{role === 'DAOAdmin' ? 'DAO Administrator' : role === 'NodeOperator' ? 'Verifier Node Operator' : role}</span>
                  {selectedRole === role && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                </button>
              ))}
            </div>

            <button 
              onClick={handleConnect}
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all"
            >
              Sign Request
            </button>
          </motion.div>
        </div>
      )}

      <footer className="border-t border-white/[0.05] p-16 text-center">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
          <p>&copy; 2026 Zypherion Protocol_</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-blue-400 transition-colors">Twitter</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Stellar_Explorer</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Security_Audits</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
