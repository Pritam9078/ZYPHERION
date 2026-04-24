import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import AuthGuard from '../components/AuthGuard';
import Navbar from '../components/Navbar';
import { useSound } from '../hooks/useSound';
import ProfileCard from '../components/ProfileCard';
import NetworkMap from '../components/NetworkMap';

export default function GuestDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('network');
  const { playHover, playClick } = useSound();

  const stats = [
    { label: 'Total Value Locked', value: '$1.42B', sub: '+12.5%', color: 'emerald' },
    { label: 'Network TPS', value: '42,500', sub: 'STABLE', color: 'blue' },
    { label: 'Active Nodes', value: '1,242', sub: '+14 New', color: 'purple' },
    { label: 'Verified Proofs', value: '8.4M', sub: 'LIVE', color: 'orange' }
  ];

  const networkEvents = [
    { time: '12:42:01', event: 'Block #14,242,019 Confirmed', type: 'success' },
    { time: '12:41:58', event: 'New Validator Node Joined (Seoul, KR)', type: 'info' },
    { time: '12:41:52', event: 'SLA Verification Cycle Complete', type: 'success' },
    { time: '12:41:45', event: 'Cross-chain Sync: Ethereum -> Zypherion', type: 'info' }
  ];

  return (
    <AuthGuard allowedAccountTypes={['Guest', 'Developer', 'NodeOperator', 'DAOAdmin']}>
      <div className="min-h-screen bg-white dark:bg-zypher-bg selection:bg-blue-500/30 text-slate-900 dark:text-white transition-colors duration-300">
        <Head>
          <title>Protocol Observer | Zypherion</title>
        </Head>

        <Navbar />

        <main className="relative z-10 container py-8">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-8">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-500 rounded-lg text-[9px] font-bold uppercase tracking-wider border border-blue-500/20">OBSERVER_UPLINK_ESTABLISHED</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Public Protocol Access</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tighter uppercase mb-4 italic">Protocol Observer_</h1>
            <p className="text-slate-500 font-medium tracking-tight max-w-2xl text-lg italic">
              You are currently in <span className="text-slate-900 dark:text-white font-bold">Observer Mode</span>. View real-time protocol health, network statistics, and global verification telemetry.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((s, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[2.5rem] glass border-slate-200 dark:border-white/5 bg-gradient-to-br from-slate-50 dark:from-white/[0.02] to-transparent"
              >
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-4">{s.label}</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tighter">{s.value}</div>
                <div className={`text-[9px] font-bold text-${s.color}-600 dark:text-${s.color}-400 uppercase tracking-wider`}>{s.sub}</div>
              </motion.div>
            ))}
          </div>

          <section className="p-1 rounded-[2.5rem] glass border-slate-200 dark:border-white/5 overflow-hidden bg-slate-50 dark:bg-black/20 mb-8">
             <div className="p-6 md:p-8 border-b border-slate-200 dark:border-white/5 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter italic">Global Protocol Telemetry_</h3>
                <div className="flex gap-2">
                   <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                   <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">LIVE_DATA_FEED</span>
                </div>
             </div>
             <div className="h-[500px]">
                <NetworkMap />
             </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section className="p-6 md:p-10 rounded-[2.5rem] glass border-slate-200 dark:border-white/5 relative overflow-hidden bg-blue-600/[0.02]">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter mb-4 italic">Want to build on Zypherion?</h3>
                  <p className="text-slate-500 mb-10 max-w-xl font-medium">Get access to high-performance telemetry, SLA-backed RPC endpoints, and cross-chain verification tools by upgrading to a Developer account.</p>
                  
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onMouseEnter={playHover}
                      onClick={() => { playClick(); router.push('/'); }}
                      className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-bold uppercase tracking-wider hover:scale-105 transition-transform"
                      title="Go back to the home page and connect with a Developer role"
                    >
                      Become a Developer_
                    </button>
                    <button 
                      onClick={() => router.push('/docs')}
                      className="px-8 py-4 glass border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 rounded-2xl text-[10px] font-bold uppercase tracking-wider hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      Read Documentation
                    </button>
                  </div>
                </div>
                
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                  <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 to-transparent blur-3xl" />
                </div>
              </section>

              <section className="p-10 rounded-[3.5rem] glass border-slate-200 dark:border-white/5">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter italic">Live Network Feed_</h3>
                  <div className="flex gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">STREAM_ACTIVE</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {networkEvents.map((event, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-6 p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 group hover:border-blue-500/30 transition-all"
                    >
                      <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-blue-500 transition-colors">{event.time}</span>
                      <div className="w-1 h-1 bg-slate-300 dark:bg-white/20 rounded-full" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight flex-1">{event.event}</span>
                      <span className={`text-[8px] font-bold uppercase tracking-wider ${event.type === 'success' ? 'text-emerald-500' : 'text-blue-500'}`}>
                        {event.type}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-8">
              <ProfileCard />
              <section className="p-10 rounded-[3.5rem] glass border-slate-200 dark:border-white/5 bg-gradient-to-b from-slate-50/50 dark:from-white/[0.02] to-transparent">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-8 italic">Node Distribution</h3>
                <div className="space-y-6">
                   {[
                     { region: 'North America', count: '452', percent: 35 },
                     { region: 'Europe', count: '382', percent: 30 },
                     { region: 'Asia Pacific', count: '298', percent: 24 },
                     { region: 'Rest of World', count: '110', percent: 11 },
                   ].map((r, i) => (
                     <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase">
                           <span className="text-slate-600 dark:text-slate-400">{r.region}</span>
                           <span className="text-slate-900 dark:text-white">{r.count}</span>
                        </div>
                        <div className="h-1 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${r.percent}%` }}
                             transition={{ duration: 1, delay: i * 0.1 }}
                             className="h-full bg-blue-600"
                           />
                        </div>
                     </div>
                   ))}
                </div>
              </section>

              <div className="p-10 rounded-[3.5rem] bg-slate-900 dark:bg-white text-white dark:text-black shadow-2xl relative overflow-hidden group">
                 <div className="relative z-10">
                    <h3 className="text-lg font-bold uppercase tracking-tighter mb-4 italic">Run a Node_</h3>
                    <p className="text-[11px] opacity-60 mb-8 font-medium leading-relaxed">Secure the network and earn ZYP rewards by hosting a Verifier Node. Requires 10k XLM stake.</p>
                    <button className="w-full py-4 bg-white dark:bg-black text-black dark:text-white rounded-2xl text-[9px] font-bold uppercase tracking-wider hover:scale-[1.02] transition-transform">
                       View Requirements
                    </button>
                 </div>
                 <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/20 blur-3xl group-hover:bg-blue-500/40 transition-colors" />
              </div>
            </aside>
          </div>
        </main>

        <footer className="container mx-auto px-6 py-20 mt-20 border-t border-slate-200 dark:border-white/5">
           <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Zypherion Protocol v4.2.0-Alpha</div>
              <div className="flex gap-8">
                 {['Twitter', 'Discord', 'Github', 'Docs'].map(item => (
                   <a key={item} href="#" className="text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white uppercase tracking-wider transition-colors">{item}</a>
                 ))}
              </div>
           </div>
        </footer>
      </div>
    </AuthGuard>
  );
}
