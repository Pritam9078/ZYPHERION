import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Preloader from '../components/Preloader';
import Navbar from '../components/Navbar';
import { useWallet } from '../hooks/useWallet';
import Link from 'next/link';

import ThreeDBackground from '../components/ThreeDBackground';

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const { wallet, connect } = useWallet();

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500);
  }, []);



  if (loading) return <Preloader />;

  return (
    <div className="min-h-screen bg-white dark:bg-zypher-bg text-slate-900 dark:text-slate-200 selection:bg-blue-500/30 overflow-x-hidden transition-colors duration-300">

      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.05),transparent)] pointer-events-none" />
      
      {/* 3D Background Layer */}
      <ThreeDBackground />
      
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
          <span className="text-[10px] font-bold text-blue-500 dark:text-blue-400 tracking-[0.1em] uppercase">Status: Protocol_Nominal_Alpha</span>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1]">
            Define logic<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-500 dark:to-indigo-400"> →</span> verify<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-500 dark:to-indigo-400"> →</span><br />
            execute <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-500 dark:to-indigo-400">automatically.</span>
          </h1>

          {/* Brief plain-language description */}
          <div className="mb-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 opacity-80">
            <span>✦ No oracles needed</span>
            <span>✦ Cross-chain automation</span>
            <span>✦ ZK-verified execution</span>
            <span>✦ Runs on Stellar testnet</span>
          </div>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-12 max-w-xl mx-auto leading-relaxed font-medium">
            Zypherion lets you write a simple rule, prove it on-chain, and trigger actions automatically — no middlemen, no oracles, no manual steps.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {wallet.address ? (
                <Link 
                 href={
                   wallet.role === 'admin' ? '/admin' : 
                   wallet.accountType === 'NodeOperator' ? '/node-operator' : 
                   '/dashboard'
                 }
                 className="px-12 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-bold text-[11px] uppercase tracking-wider shadow-2xl shadow-blue-500/10 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white dark:hover:text-white transition-all transform hover:-translate-y-1"
                >
                  Launch Sovereign Command
                </Link>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <button 
                  onClick={() => connect()}
                  className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-bold text-[11px] uppercase tracking-wider shadow-2xl shadow-blue-600/20 hover:bg-blue-500 transition-all transform hover:-translate-y-1 active:scale-95"
                >
                  Get Started — Create First Rule
                </button>
                <a href="https://laboratory.stellar.org/#account-creator?network=test" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:text-blue-400 font-bold uppercase tracking-wider transition-colors">
                  Get Free Test XLM (Friendbot) &rarr;
                </a>
              </div>
            )}
            
            <Link href="/docs" className="px-12 py-5 glass text-slate-900 dark:text-white rounded-2xl font-bold text-[11px] uppercase tracking-wider hover:bg-black/5 dark:hover:bg-white/5 transition-all border border-slate-200 dark:border-white/10 text-center flex items-center justify-center">
              Technical Documentation
            </Link>
          </div>

          {/* 3-Step Onboarding Stepper */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0">
            {[
              { icon: '🔑', step: '01', label: 'Connect Wallet' },
              { icon: '⚙️', step: '02', label: 'Create Rule' },
              { icon: '🚀', step: '03', label: 'Run Automation' },
            ].map((s, i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center gap-2 px-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl">{s.icon}</div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{s.step}</div>
                  <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{s.label}</div>
                  {i === 0 && (
                    <a 
                      href="https://laboratory.stellar.org/#account-creator?network=testnet" 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[8px] font-bold uppercase text-blue-500 hover:underline mt-1"
                    >
                      Get Test XLM &rarr;
                    </a>
                  )}
                </div>
                {i < 2 && <div className="hidden sm:block w-12 h-px bg-blue-500/20" />}
              </div>
            ))}
          </div>

          {/* Skip Intro */}
          <div className="mt-8 text-center">
            <Link
              href={wallet.address ? '/dashboard' : '#features'}
              className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold uppercase tracking-wider transition-colors underline-offset-4 hover:underline"
            >
              Skip intro — explore protocol ↓
            </Link>
          </div>

        </motion.div>

        {/* Architecture Visualizer Placeholder */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-6xl mb-32 p-1 bg-gradient-to-br from-blue-500/20 via-transparent to-indigo-500/20 rounded-[3rem]"
        >
          <div className="bg-white/80 dark:bg-zypher-bg/80 backdrop-blur-3xl rounded-[2.9rem] p-12 border border-slate-200 dark:border-white/5 overflow-hidden relative">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
                {[
                  { label: 'Latency', val: '1.2s', desc: 'Average verification finality' },
                  { label: 'Throughput', val: '14k+', desc: 'Events processed per hour' },
                  { label: 'Security', val: 'ECC', desc: 'Curve25519 Native Ops' },
                  { label: 'Network', val: 'Sync', desc: 'Stellar-Ethereum Realtime' }
                ].map((s, i) => (
                  <div key={i} className="text-center md:text-left">
                     <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">{s.label}</div>
                     <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{s.val}</div>
                     <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{s.desc}</div>
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
              <div className="w-14 h-14 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-slate-200 dark:border-white/10 group-hover:bg-blue-600 group-hover:border-transparent transition-all">
                <svg className="w-6 h-6 text-blue-500 dark:text-blue-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon} />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white uppercase tracking-tight">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium opacity-80">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Protocol Initiation Sequence - HOW IT WORKS */}
        <div className="w-full max-w-6xl mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-4 uppercase">Protocol_Initiation_Sequence_</h2>
            <p className="text-slate-600 dark:text-slate-400">Follow these steps to establish your sovereign automation footprint.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: '01', title: 'Identity Link', desc: 'Connect your Stellar wallet and choose your protocol role.' },
              { step: '02', title: 'Logic Definition', desc: 'Define cross-chain rules and predicates via the Architect.' },
              { step: '03', title: 'ZK Validation', desc: 'Generate zero-knowledge proofs for trustless rule verification.' },
              { step: '04', title: 'Execution', desc: 'Logic is finalized on-chain with millisecond precision.' }
            ].map((s, idx) => (
              <div key={idx} className="relative p-8 glass rounded-3xl border border-slate-200 dark:border-white/5 group hover:border-blue-500/50 transition-all">
                <div className="text-4xl font-bold text-slate-200 dark:text-white/10 mb-4 group-hover:text-blue-500/20 transition-colors">{s.step}</div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{s.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed font-medium">{s.desc}</p>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                    <svg className="w-8 h-8 text-slate-200 dark:text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Core Services Deep Dive */}
        <div className="w-full max-w-6xl mt-32 p-12 bg-slate-50 dark:bg-white/5 rounded-[3rem] border border-slate-200 dark:border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full" />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-8 uppercase">Sovereign_Services_</h2>
              <div className="space-y-8">
                <div>
                  <h4 className="text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-[0.1em] mb-2">Service_01</h4>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">ZK Prover Engine</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Zypherion utilizes <strong>snarkjs</strong> and <strong>circom</strong> to generate Groth16 proofs. This ensures that your off-chain logic execution is verifiably correct before it ever touches the Stellar network.</p>
                </div>
                <div>
                  <h4 className="text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-[0.1em] mb-2">Service_02</h4>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Chronos Automation</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">A decentralized cron-job layer that triggers based on block-time, specific events, or oracle price-feeds. Your logic runs autonomously, 24/7, without manual intervention.</p>
                </div>
              </div>
            </div>
            <div className="space-y-8 pt-20">
              <div>
                <h4 className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-[0.1em] mb-2">Service_03</h4>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Gas Abstraction</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Stop juggling multiple native tokens. Zypherion abstracts gas costs through a unified deposit system, allowing you to pay for automation in stable credits.</p>
              </div>
              <div className="p-8 bg-gradient-to-br from-blue-600/20 to-indigo-600/10 rounded-3xl border border-blue-500/30 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 blur-[60px] rounded-full group-hover:bg-blue-500/20 transition-all" />
                
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight uppercase">Ready to Integrate?_</h3>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 mb-6 font-medium leading-relaxed">Embed sovereign automation into your dApp with just 3 lines of code.</p>
                
                {/* Code Snippet Visual */}
                <div className="bg-black/90 dark:bg-black/40 rounded-2xl p-5 mb-8 border border-white/5 font-mono text-[10px] relative">
                  <div className="flex gap-1.5 mb-3">
                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                    <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-blue-400"><span className="text-purple-400">import</span> {'{ Zypherion }'} <span className="text-purple-400">from</span> <span className="text-emerald-400">'@zypherion/sdk'</span>;</p>
                    <p className="text-slate-300"><span className="text-purple-400">const</span> client = <span className="text-purple-400">new</span> <span className="text-blue-400">Zypherion</span>(<span className="text-emerald-400">'ZYPH-TEST-9F8A'</span>);</p>
                    <p className="text-slate-300"><span className="text-purple-400">await</span> client.<span className="text-blue-400">execute</span>(<span className="text-emerald-400">'LIQUIDATE_RULE'</span>, payload);</p>
                  </div>
                </div>

                <Link href="/docs/sdk" className="block w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white dark:hover:text-white transition-all shadow-xl shadow-blue-500/10 text-center">
                  View SDK Documentation_
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Identity & RBAC Explorer */}
        <div className="w-full max-w-6xl mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-4 uppercase">Role_Based_Architecture_</h2>
            <p className="text-slate-600 dark:text-slate-400">Specialized interfaces designed for specific protocol participants.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-10 glass rounded-[2.5rem] border border-slate-200 dark:border-white/5">
              <div className="text-blue-600 dark:text-blue-500 font-bold text-6xl mb-6 opacity-20">DEV</div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Developer Portal</h3>
              <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400 mb-8">
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> API Key Generation & Management</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Webhook Integration Suite</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Local Sandbox & Simulation Tools</li>
              </ul>
            </div>
            <div className="p-10 glass rounded-[2.5rem] border border-slate-200 dark:border-white/5">
              <div className="text-indigo-600 dark:text-indigo-500 font-bold text-6xl mb-6 opacity-20">NODE</div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Node Operator Hub</h3>
              <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400 mb-8">
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /> Real-time Network Telemetry</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /> Verifier Node Health Monitoring</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /> Staking & Performance Metrics</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Pricing & Tiers Section */}
        <div className="w-full max-w-6xl mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">Enterprise-Grade Tiers_</h2>
            <p className="text-slate-600 dark:text-slate-400">Scale your cross-chain automation with our deposit-based SaaS models.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { tier: 'Free', price: '$0', desc: 'Testnet gas & basic UI', proofs: '1,000 proofs/mo', color: 'slate' },
              { tier: 'Basic', price: '$20', desc: '1x API key, email support', proofs: '10,000 proofs/mo', color: 'blue' },
              { tier: 'Pro', price: '$80', desc: '5x keys, AI ZKML tools', proofs: '50,000 proofs/mo', color: 'indigo' },
              { tier: 'Enterprise', price: 'Custom', desc: '24/7 SLA & Dedicated Nodes', proofs: 'Unlimited', color: 'emerald' },
            ].map((plan, idx) => (
              <div key={idx} className="glass p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all flex flex-col">
                <div className={`text-[10px] font-bold uppercase tracking-wider text-${plan.color}-600 dark:text-${plan.color}-400 mb-2`}>{plan.tier} Plan</div>
                <div className="text-4xl font-bold text-slate-900 dark:text-white mb-4">{plan.price}<span className="text-sm text-slate-500 font-medium">/mo</span></div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-8 flex-1">{plan.desc}</div>
                <div className="p-4 bg-slate-100 dark:bg-black/30 rounded-xl mb-8 border border-slate-200 dark:border-transparent">
                  <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-1">Quota</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{plan.proofs}</div>
                </div>
                <button 
                  onClick={() => connect()}
                  className={`w-full py-4 rounded-xl text-[10px] font-bold uppercase tracking-[0.1em] transition-all ${idx === 2 ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300'}`}
                >
                  {idx === 3 ? 'Contact Sales' : 'Deploy Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>



      <footer className="border-t border-slate-200 dark:border-white/[0.05] p-16 text-center">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
          <p>&copy; 2026 Zypherion Protocol_</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Twitter</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Stellar_Explorer</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Security_Audits</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
