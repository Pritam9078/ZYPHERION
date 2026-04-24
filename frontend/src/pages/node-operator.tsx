import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import AuthGuard from '../components/AuthGuard';
import { useWallet } from '../hooks/useWallet';
import { useSound } from '../hooks/useSound';

export default function NodeOperatorDashboard() {
  const { wallet } = useWallet();
  const { playHover, playClick } = useSound();
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(prev => prev + 1);
      const newLog = {
        t: new Date().toLocaleTimeString(),
        m: `VERIFIER_NODE_${Math.floor(Math.random() * 5)}: Attestation verified for Block ${Math.floor(Math.random() * 1000000)}`,
        c: Math.random() > 0.1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
      };
      setTelemetry(prev => [newLog, ...prev].slice(0, 50));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: 'Network Latency', value: '42ms', sub: 'Low', color: 'emerald' },
    { label: 'Uptime Score', value: '99.98%', sub: 'Optimal', color: 'blue' },
    { label: 'Proof Throughput', value: '1.2 /s', sub: 'Nominal', color: 'indigo' },
    { label: 'Node Tier', value: 'L2_Sovereign', sub: 'High Priority', color: 'purple' },
  ];

  return (
    <AuthGuard allowedAccountTypes={['NodeOperator']}>
      <div className="min-h-screen bg-white dark:bg-zypher-bg text-slate-900 dark:text-slate-200 transition-colors duration-300">

        <Navbar />

        <main className="relative z-10 container mx-auto px-6 py-12">
          <header className="mb-16 border-b border-slate-200 dark:border-white/5 pb-12 flex flex-col md:flex-row justify-between items-end gap-8">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">NODE_TELEMETRY_LIVE</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Validator Mesh V4.2</span>
              </div>
              <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-4">Node Monitor_</h1>
              <p className="text-slate-500 font-medium tracking-tight">Real-time status of your Zypherion verification engine.</p>
            </div>

            <div className="flex items-center gap-8 bg-slate-50 dark:bg-white/5 px-8 py-5 rounded-[2.5rem] border border-slate-200 dark:border-white/5">
               <div className="text-center font-mono">
                  <div className="text-[9px] font-black text-slate-500 uppercase mb-1">Session Uptime</div>
                  <div className="text-slate-900 dark:text-white font-bold">{Math.floor(uptime / 60)}m {uptime % 60}s</div>
               </div>
               <div className="w-[1px] h-10 bg-slate-200 dark:bg-white/10" />
               <div className="text-center font-mono">
                  <div className="text-[9px] font-black text-slate-500 uppercase mb-1">Local Latency</div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold">STABLE_12ms</div>
               </div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {stats.map((s, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[2.5rem] glass border-slate-200 dark:border-white/5 group hover:border-slate-300 dark:hover:border-white/10 transition-all bg-gradient-to-br from-slate-50 dark:from-white/[0.02] to-transparent"
              >
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">{s.label}</div>
                <div className="text-3xl font-black text-slate-900 dark:text-white mb-2">{s.value}</div>
                <div className={`text-[9px] font-bold text-${s.color}-600 dark:text-${s.color}-400 uppercase tracking-widest`}>{s.sub}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <section className="p-10 rounded-[3.5rem] glass border-slate-200 dark:border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                  <div className="flex gap-2">
                    {[1,2,3,4,5,6].map(i => (
                      <motion.div 
                        key={i}
                        animate={{ height: [10, 25, 10] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        className="w-1 bg-blue-500/40 rounded-full"
                      />
                    ))}
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                  Verification Engine Health
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </h3>
                
                <div className="space-y-8">
                  <div className="grid grid-cols-3 gap-8">
                    <div>
                      <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">CPU LOAD</div>
                      <div className="text-xl font-bold text-slate-900 dark:text-white uppercase">14.2%</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">MEM USAGE</div>
                      <div className="text-xl font-bold text-slate-900 dark:text-white uppercase">2.4 GB</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">IOPS</div>
                      <div className="text-xl font-bold text-slate-900 dark:text-white uppercase">850/s</div>
                    </div>
                  </div>
                  
                  <div className="h-40 w-full bg-slate-100 dark:bg-black/20 rounded-[2rem] border border-slate-200 dark:border-white/5 flex items-end p-8 gap-2">
                    {Array.from({length: 40}).map((_, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-blue-500/20 rounded-t-sm group relative"
                        style={{ height: `${Math.random() * 80 + 20}%` }}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-[8px] font-black rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                          LOAD: {Math.floor(Math.random() * 100)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-10 rounded-[3rem] glass border-slate-200 dark:border-white/5">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Staking Information</h4>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white">ACTIVE_STAKE</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight">10,000 XLM</span>
                  </div>
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white">REWARDS_EPOCH</span>
                    <span className="text-lg font-black text-blue-600 dark:text-blue-400 tracking-tight">142.5 ZYP</span>
                  </div>
                  <button 
                    onMouseEnter={playHover}
                    onClick={() => playClick()}
                    className="w-full py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200 dark:border-white/5"
                  >
                    Manage Stake_
                  </button>
                </div>
                
                <div className="p-10 rounded-[3rem] glass border-emerald-500/10 bg-emerald-500/[0.02]">
                   <h4 className="text-[10px] font-black text-emerald-600 dark:text-emerald-500/60 uppercase tracking-widest mb-6">Node Actions</h4>
                   <div className="space-y-3">
                      <button className="w-full py-4 glass border-slate-200 dark:border-white/5 text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all text-left px-6">Restart Service</button>
                      <button className="w-full py-4 glass border-slate-200 dark:border-white/5 text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all text-left px-6">Sync Global State</button>
                      <button className="w-full py-4 glass border-red-500/20 text-[9px] font-black uppercase text-red-600 dark:text-red-500/60 hover:text-red-600 dark:hover:text-red-500 transition-all text-left px-6">Emergency Stop</button>
                   </div>
                </div>
              </div>
            </div>

            <aside className="space-y-8">
              <section className="rounded-[3rem] glass border-slate-200 dark:border-white/5 overflow-hidden flex flex-col h-[700px]">
                <div className="p-8 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01]">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Node Internal Logs</h3>
                </div>
                <div className="flex-1 p-8 space-y-6 overflow-y-auto bg-slate-100/50 dark:bg-black/20 font-mono text-[9px]" style={{ scrollbarWidth: 'none' }}>
                  {telemetry.map((log, i) => (
                    <div key={i} className="flex gap-4 items-start border-l-2 border-slate-200 dark:border-white/5 pl-4 ml-1">
                      <span className="opacity-30 flex-shrink-0 font-bold">{log.t}</span>
                      <span className={`${log.c} font-bold leading-relaxed break-all`}>{log.m}</span>
                    </div>
                  ))}
                  {telemetry.length === 0 && (
                    <div className="text-slate-500 italic uppercase font-black opacity-30 text-center py-20">Initializing Log Stream...</div>
                  )}
                </div>
                <div className="p-6 bg-emerald-600/5 text-center mt-auto border-t border-slate-200 dark:border-white/5 font-mono text-[8px] font-black text-emerald-600 dark:text-emerald-500 tracking-widest">
                  SECURE_LOG_ENCRYPTED: ACTIVE
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
