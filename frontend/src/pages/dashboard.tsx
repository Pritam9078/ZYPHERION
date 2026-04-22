import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import SocketService from '../services/socket';
import Navbar from '../components/Navbar';
import AuthGuard from '../components/AuthGuard';
import PayloadModal from '../components/PayloadModal';
import NetworkMap from '../components/NetworkMap';
import AIAssistant from '../components/AIAssistant';
import { useWallet } from '../hooks/useWallet';
import { 
  fetchRules, 
  createRule, 
  fetchOperations, 
  requestProof, 
  submitProof,
  fetchSystemSettings,
  fetchUserProfile,
  LogicRule,
  Operation,
  API_BASE
} from '../services/api';
import { signActionRequest } from '../services/signing';

// Simple Sparkline Component
const Sparkline = ({ color = '#3b82f6' }) => (
  <svg width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none" className="opacity-50">
    <path
      d="M0 35 Q 10 15, 20 25 T 40 10 T 60 30 T 80 5 T 100 20"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default function Dashboard() {
  const router = useRouter();
  const { wallet } = useWallet();
  const socketRef = useRef<Socket | null>(null);
  
  const [token, setToken] = useState<string | null>(null);
  const [rules, setRules] = useState<LogicRule[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'builder' | 'automation' | 'history'>('overview');
  
  // Real-time Logs State
  const [liveLogs, setLiveLogs] = useState<{t: string, m: string, c: string}[]>([]);
  const [systemStats, setSystemStats] = useState({ connections: 0, load: 'LOW' });
  const [systemPaused, setSystemPaused] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Designer State
  const [formState, setFormState] = useState({ 
    name: '', 
    description: '', 
    conditionType: 'Storage value',
    logic: '', 
    targetChain: 'Ethereum (Simulated)',
    targetContract: '',
    targetPayload: '',
    useGasAbstraction: false,
    autoExecute: false
  });

  // Simulator State
  const [mockState, setMockState] = useState('{\n  "balance": 150,\n  "status": "verified"\n}');
  const [simResult, setSimResult] = useState<{status: 'pass' | 'fail' | 'error', msg: string} | null>(null);

  // Inspector State
  const [inspector, setInspector] = useState<{isOpen: boolean, title: string, data: any}>({
    isOpen: false,
    title: '',
    data: null
  });

  const [submitting, setSubmitting] = useState(false);
  const [notifications, setNotifications] = useState<{id: number, text: string, type: 'success' | 'error'}[]>([]);

  useEffect(() => {
    const storedToken = localStorage.getItem('zypher_token');
    if (!storedToken) {
      router.push('/');
      return;
    }
    setToken(storedToken);

    // Initialize Socket.io via Singleton
    const socket = SocketService.getSocket();
    socketRef.current = socket;

    const onConnect = () => {
      console.log('[Dashboard] Telemetry stream synchronized.');
      if (wallet.address) socket.emit('join_protocol', wallet.address);
    };

    const onExecutionUpdate = (data: any) => {
      addNotification(data.message, data.type.toLowerCase() === 'success' ? 'success' : 'error');
      addLiveLog(`AUTORUN: ${data.message}`, 'text-blue-400');
      loadData();
    };

    const onSystemStats = (data: any) => {
      setSystemStats({ connections: data.activeConnections, load: data.loadIndex });
    };

    socket.on('connect', onConnect);
    socket.on('execution_update', onExecutionUpdate);
    socket.on('system_stats', onSystemStats);

    // Only emit join if already connected
    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('execution_update', onExecutionUpdate);
      socket.off('system_stats', onSystemStats);
    };
  }, [router, wallet.address]);

  useEffect(() => {
    if (token) loadData();

    const loadSettings = async () => {
      if (!token) return;
      try {
        const settings = await fetchSystemSettings(token);
        setSystemPaused(settings.protocolHalt);
        if (settings.protocolHalt) {
          addLiveLog('ALRT: System currently in OVERRIDE mode. Operations frozen.', 'text-red-500');
        }
      } catch (err) {
        console.error('Failed to sync system status');
      }
    };
    loadSettings();
  }, [token]);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [rulesData, opsData, userData] = await Promise.all([
        fetchRules(token),
        fetchOperations(token),
        fetchUserProfile(token)
      ]);
      setRules(rulesData);
      setOperations(opsData);
      setUser(userData);
    } catch (err: any) {
      addNotification('Failed to sync protocol data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addNotification = (text: string, type: 'success' | 'error') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, text, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
  };

  const addLiveLog = (m: string, c: string = 'text-slate-400') => {
    const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLiveLogs(prev => [{ t, m, c }, ...prev].slice(0, 50));
  };

  const handleRunSimulation = () => {
    try {
      const state = JSON.parse(mockState);
      const fn = new Function('state', `
        const { ${Object.keys(state).join(', ')} } = state;
        return (${formState.logic || 'true'});
      `);
      const result = fn(state);
      setSimResult({
        status: result ? 'pass' : 'fail',
        msg: result ? 'Logic predicate satisfied.' : 'Logic predicate failed.'
      });
      addLiveLog(`SIM: Logic evaluation returned ${result}`, 'text-indigo-400');
    } catch (err: any) {
      setSimResult({ status: 'error', msg: err.message });
      addLiveLog(`SIM_ERR: ${err.message}`, 'text-red-400');
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !wallet.address) return;
    setSubmitting(true);
    try {
      addNotification('Please authorize deployment in your wallet...', 'success');
      const auth = await signActionRequest(wallet.address, 'CREATE_RULE', `RuleName: ${formState.name}\nChain: ${formState.targetChain}`);
      
      await createRule(token, {
        name: formState.name,
        description: formState.description,
        conditions: { 
          condition: formState.logic, 
          type: formState.conditionType 
        },
        targetChain: formState.targetChain,
        targetContract: formState.targetContract,
        targetPayload: formState.targetPayload,
        useGasAbstraction: formState.useGasAbstraction,
        automationConfig: {
          autoExecute: formState.autoExecute,
          retryDelay: 60,
          maxRetries: 3
        },
        status: 'active',
        ...auth
      });
      setFormState({ 
        name: '', description: '', conditionType: 'Storage value', 
        logic: '', targetChain: 'Ethereum (Simulated)', 
        targetContract: '', targetPayload: '', useGasAbstraction: false,
        autoExecute: false 
      });
      setActiveTab('overview');
      addNotification('Infrastructure Rule deployed successfully.', 'success');
      addLiveLog(`DEPLOY: New rule ${formState.name} committed to Stellar.`, 'text-emerald-400');
      loadData();
    } catch (err: any) {
      addNotification('Deployment failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestProof = async (ruleId: string) => {
    if (!token || !wallet.address) return;
    try {
      addNotification('Authorize proof request in wallet...', 'success');
      const auth = await signActionRequest(wallet.address, 'REQUEST_PROOF', `RuleID: ${ruleId}`);
      await requestProof(token, ruleId, auth);
      addNotification('Proof generation initiated.', 'success');
      addLiveLog(`PROOF_REQ: Rule_${ruleId.slice(-6)} processing...`, 'text-blue-400');
      loadData();
    } catch (err) {
      addNotification('Proof generation failed.', 'error');
    }
  };

  const handleSubmitProof = async (opId: string) => {
    if (!token || !wallet.address) return;
    try {
      addNotification('Authorize attestation in wallet...', 'success');
      const auth = await signActionRequest(wallet.address, 'SUBMIT_PROOF', `OpID: ${opId}`);
      await submitProof(token, opId, auth);
      addNotification('Attestation successful.', 'success');
      addLiveLog(`ATTEST: Op_${opId.slice(-6)} verified on Stellar.`, 'text-emerald-400');
      loadData();
    } catch (err) {
      addNotification('Attestation failed.', 'error');
    }
  };

  const openInspector = (title: string, data: any) => {
    setInspector({ isOpen: true, title, data });
  };

  const stats = [
    { label: 'Active Rules', value: rules.length, color: '#3b82f6' },
    { label: 'Gas Balance', value: `${user?.gasBalance || 0} credits`, color: '#f59e0b' },
    { label: 'Total Attestations', value: operations.filter(o => o.status === 'verified').length, color: '#10b981' },
    { label: 'Network Load', value: '14.2%', color: '#8b5cf6' },
  ];

  if (loading && !rules.length) return (
     <div className="min-h-screen bg-zypher-bg flex flex-col items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full mb-6" 
        />
        <div className="text-[10px] font-black text-blue-400/60 uppercase tracking-[0.4em] animate-pulse">Syncing Telemetry...</div>
     </div>
  );

  return (
    <AuthGuard>
      <div className="min-h-screen bg-zypher-bg text-slate-200">
      <div className="fixed inset-0 blueprint-bg opacity-20 pointer-events-none" />
      <Navbar />

      <PayloadModal 
        isOpen={inspector.isOpen}
        onClose={() => setInspector({ ...inspector, isOpen: false })}
        title={inspector.title}
        data={inspector.data}
      />

      {/* Persistent Trace Notifications */}
      <div className="fixed bottom-8 right-8 z-50 space-y-4 max-w-sm w-full font-mono">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-4 rounded-xl border-2 glass backdrop-blur-xl flex items-center gap-3 ${n.type === 'error' ? 'border-red-500/30 text-red-400' : 'border-blue-500/30 text-blue-400'}`}
            >
              <div className={`w-2 h-2 rounded-full ${n.type === 'error' ? 'bg-red-500' : 'bg-blue-500'} animate-pulse`} />
              <span className="text-[11px] font-black tracking-tighter uppercase">{n.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <main className="relative z-10 container mx-auto px-6 py-12">
        
        {/* Emergency Protocol Banner */}
        <AnimatePresence>
          {systemPaused && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-12 overflow-hidden"
            >
              <div className="p-8 rounded-[2.5rem] bg-red-600/10 border-2 border-red-600/30 flex flex-col md:flex-row items-center justify-between gap-6 relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-transparent animate-pulse" />
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-16 h-16 bg-red-600/20 rounded-[1.5rem] flex items-center justify-center text-red-500 border border-red-600/20">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Emergency Protocol Override Active_</h4>
                    <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mt-1 opacity-80">Infrastructure write-operations are cryptographically halted by Overseer.</p>
                  </div>
                </div>
                <div className="px-8 py-3 bg-red-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-red-600/30 relative z-10">
                  SYSTEM_LOCKED
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Modular Suite Navigation */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-500/20">SYSTEM_INFRA_V2</span>
              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${wallet.tier === 'Pro' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : wallet.tier === 'Basic' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                {wallet.tier || 'Free'} TIER
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Node ID: {wallet.address ? wallet.address.slice(0, 16) : 'GUEST'}</span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter mb-4">Protocol Hub_</h2>
            <div className="flex gap-1.5 overflow-x-auto pb-2">
              {['overview', 'builder', 'automation', 'history'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 scale-105' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-8 bg-white/5 px-8 py-4 rounded-[2rem] border border-white/5">
             <div className="text-center">
                <div className="text-[9px] font-black text-slate-500 uppercase mb-1">Connections</div>
                <div className="text-white font-bold">{systemStats.connections}</div>
             </div>
             <div className="w-[1px] h-8 bg-white/10" />
             <div className="text-center">
                <div className="text-[9px] font-black text-slate-500 uppercase mb-1">System Load</div>
                <div className={`font-bold ${systemStats.load === 'LOW' ? 'text-emerald-400' : 'text-amber-400'}`}>{systemStats.load}</div>
             </div>
             <div className="w-[1px] h-8 bg-white/10 hidden md:block" />
             <button 
                onClick={() => router.push('/billing')}
                className="hidden md:block px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors border border-white/10"
             >
                Manage Billing
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Main Workspace Area */}
          <div className="lg:col-span-3 space-y-12">
            
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                  <NetworkMap />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stats.map((stat, i) => (
                      <div key={i} className="p-8 rounded-[2.5rem] glass border-white/5 relative overflow-hidden group">
                         <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">{stat.label}</h3>
                         <div className="text-4xl font-bold text-white tracking-tighter mb-4">{stat.value}</div>
                         <Sparkline color={stat.color} />
                      </div>
                    ))}
                  </div>

                  <section className="rounded-[2.5rem] glass border-white/5 overflow-hidden">
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                      <h3 className="text-xl font-bold text-white px-2 uppercase tracking-tighter">Registered Infrastructure Rules</h3>
                    </div>
                    {rules.length === 0 ? (
                      <div className="p-20 text-center text-slate-600 italic uppercase font-black tracking-widest opacity-30">No active logic registries</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <tbody>
                            {rules.map((rule) => (
                              <tr key={rule._id} className="border-b border-white/5 group hover:bg-blue-600/[0.01] transition-colors">
                                <td className="p-8">
                                  <div className="text-lg font-bold text-white flex items-center gap-4">
                                    <span className="uppercase tracking-tighter group-hover:text-blue-400 transition-colors">{rule.name}</span>
                                    {rule.automationConfig?.autoExecute && (
                                       <span className="text-[8px] px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-black">AUTO_ENABLE</span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black opacity-50">v{rule.version || 1.1} // ID_{rule._id.slice(-6)}</div>
                                </td>
                                <td className="p-8 text-right space-x-3">
                                  <button onClick={() => openInspector('Logic Payload', rule)} className="px-4 py-2 bg-white/5 text-slate-500 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors">Inspect</button>
                                  <button 
                                    onClick={() => handleRequestProof(rule._id)} 
                                    disabled={systemPaused}
                                    className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl transition-all ${systemPaused ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50' : 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-500 scale-95 hover:scale-100'}`}
                                  >
                                    {systemPaused ? 'SYSTEM_HALTED' : 'Trigger Proof'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
                </motion.div>
              )}

              {activeTab === 'builder' && (
                <motion.section 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-12"
                >
                   <form onSubmit={handleCreateRule} className="p-10 rounded-[3rem] glass-blue border-blue-500/10">
                      <div className="flex justify-between items-center mb-10">
                        <div>
                          <h3 className="text-3xl font-black text-white tracking-tighter">Logic Architect_</h3>
                          <p className="text-blue-400/60 text-xs font-bold uppercase tracking-widest mt-1">Design trustless multi-chain predicates</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-2">Infrastructure Identifier</label>
                           <input 
                            type="text" 
                            value={formState.name}
                            onChange={e => setFormState({...formState, name: e.target.value})}
                            placeholder="e.g. LIQUIDITY_GATEKEEPER"
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-blue-500 outline-none"
                           />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-2">Target Protocol Source</label>
                           <select 
                            value={formState.targetChain}
                            onChange={e => setFormState({...formState, targetChain: e.target.value})}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-blue-500 outline-none"
                           >
                             <option>Ethereum (L1_Safe)</option>
                             <option>Base (Coinbase_L2)</option>
                             <option>Arbitrum (One)</option>
                             <option>Stellar (Mainnet)</option>
                           </select>
                        </div>
                      </div>

                      {/* Phase 1: Cross-Chain Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-2 text-indigo-400">Target Contract Address</label>
                           <input 
                              type="text"
                              value={formState.targetContract}
                              onChange={e => setFormState({...formState, targetContract: e.target.value})}
                              placeholder="0x71C... or Stellar_Address"
                              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-indigo-500 outline-none"
                           />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-2 text-indigo-400">Execution Payload (Hex)</label>
                           <input 
                              type="text"
                              value={formState.targetPayload}
                              onChange={e => setFormState({...formState, targetPayload: e.target.value})}
                              placeholder="0xa9059cbb..."
                              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-indigo-500 outline-none"
                           />
                        </div>
                      </div>

                      <div className="p-8 bg-indigo-500/5 rounded-3xl border border-indigo-500/20 flex items-center justify-between mb-12">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
                               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <div>
                               <div className="text-sm font-bold text-white uppercase tracking-tighter">Gas Abstraction Service</div>
                               <div className="text-[9px] text-slate-500 font-bold uppercase mt-1">Pay destination gas with your ZYP credits</div>
                            </div>
                         </div>
                         <button 
                          type="button"
                          onClick={() => setFormState({...formState, useGasAbstraction: !formState.useGasAbstraction})}
                          className={`w-12 h-6 rounded-full transition-all relative ${formState.useGasAbstraction ? 'bg-indigo-600' : 'bg-slate-700'}`}
                         >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formState.useGasAbstraction ? 'left-7' : 'left-1'}`} />
                         </button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                         <div className="lg:col-span-3 space-y-6">
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-2">Smart Predicate (JS_Core)</label>
                               <textarea 
                                  value={formState.logic}
                                  onChange={e => setFormState({...formState, logic: e.target.value})}
                                  placeholder="return (msg.sender_balance > 1000);"
                                  rows={8}
                                  className="w-full bg-black/60 border border-white/10 rounded-[2rem] px-8 py-6 text-blue-400 font-mono text-sm focus:border-blue-500 outline-none shadow-inner"
                               />
                            </div>
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-between">
                               <div>
                                  <div className="text-[10px] font-black text-white uppercase tracking-widest">Autonomous Execution</div>
                                  <div className="text-[9px] text-slate-500 font-bold uppercase mt-1">Retry and attest via background worker if satisfied</div>
                               </div>
                               <button 
                                type="button"
                                onClick={() => setFormState({...formState, autoExecute: !formState.autoExecute})}
                                className={`w-12 h-6 rounded-full transition-all relative ${formState.autoExecute ? 'bg-blue-600' : 'bg-slate-700'}`}
                               >
                                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formState.autoExecute ? 'left-7' : 'left-1'}`} />
                               </button>
                            </div>
                         </div>

                         <div className="lg:col-span-2 space-y-8">
                            <AIAssistant logic={formState.logic} />
                            
                            <div className="space-y-4">
                               <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Quick Templates</div>
                               <div className="grid grid-cols-1 gap-2">
                                  {[
                                    { label: 'Balance Threshold', code: 'return (balance > 100);' },
                                    { label: 'Token Holding', code: 'return (tokens.zyph > 500);' },
                                    { label: 'DAO Pass Check', code: 'return (votes.passed === true);' }
                                  ].map((t, i) => (
                                    <button 
                                      key={i} 
                                      type="button" 
                                      onClick={() => setFormState({...formState, logic: t.code})}
                                      className="p-4 text-left glass border-white/5 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:text-white hover:border-blue-500/40 transition-all"
                                    >
                                      {t.label}
                                    </button>
                                  ))}
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="mt-12 flex justify-end gap-4 border-t border-white/5 pt-8">
                         <button 
                            type="button"
                            onClick={handleRunSimulation}
                            className="px-10 py-4 bg-indigo-600/20 text-indigo-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all shadow-xl shadow-indigo-600/10"
                         >
                           Simulate State
                         </button>
                         <button 
                            type="submit" 
                            disabled={submitting || systemPaused}
                            className={`px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl ${submitting || systemPaused ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-white text-slate-950 hover:bg-blue-600 hover:text-white shadow-white/5'}`}
                         >
                           {systemPaused ? 'PROTOCOL_HALTED' : (submitting ? 'Committing...' : 'Deploy to Protocol')}
                         </button>
                      </div>
                   </form>

                   {simResult && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className={`p-10 rounded-[2.5rem] glass border-2 flex items-center justify-between ${simResult.status === 'pass' ? 'border-emerald-500/30' : 'border-red-500/30'}`}
                      >
                         <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${simResult.status === 'pass' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  {simResult.status === 'pass' ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />}
                               </svg>
                            </div>
                            <div>
                               <h4 className="text-xl font-bold uppercase tracking-tighter">Simulation Feedback_</h4>
                               <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${simResult.status === 'pass' ? 'text-emerald-400' : 'text-red-400'}`}>{simResult.msg}</p>
                            </div>
                         </div>
                         <div className="text-[9px] font-mono text-slate-500 bg-black/40 px-6 py-3 rounded-2xl border border-white/5 max-w-sm">
                            {mockState.replace(/\s+/g, ' ')}
                         </div>
                      </motion.div>
                   )}
                </motion.section>
              )}

              {activeTab === 'automation' && (
                <motion.section 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="p-16 rounded-[4rem] glass-blue border-white/5 text-center"
                >
                   <div className="w-24 h-24 bg-blue-600/10 rounded-[2.5rem] flex items-center justify-center text-blue-400 mx-auto mb-10 border border-blue-500/20">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                   </div>
                   <h3 className="text-4xl font-black text-white tracking-tighter mb-4">Autonomous Verifier_</h3>
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-12 opacity-60">System-wide automation for recurring logic attestations</p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                      <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 text-left group hover:border-blue-500/30 transition-all">
                         <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-4">API Webhooks</div>
                         <div className="text-xl font-bold text-white mb-2">REST_TRIGGER</div>
                         <p className="text-[10px] text-slate-500 font-medium">Trigger verification via external systems using your secure API keys.</p>
                      </div>
                      <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 text-left group hover:border-blue-500/30 transition-all">
                         <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-4">Scheduled Batch</div>
                         <div className="text-xl font-bold text-white mb-2">B_RUN_60s</div>
                         <p className="text-[10px] text-slate-500 font-medium">Background workers check your rules every 60 seconds automatically.</p>
                      </div>
                   </div>
                </motion.section>
              )}
              
              {activeTab === 'history' && (
                <motion.section 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="rounded-[2.5rem] glass border-white/5 overflow-hidden"
                >
                   <div className="p-8 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Execution Archive</h3>
                    <button className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest px-4 transition-colors">Export Logs (JSON)</button>
                  </div>
                  <div className="overflow-x-auto text-[11px] font-bold">
                    {operations.length === 0 ? (
                       <div className="p-20 text-center opacity-30 italic uppercase font-black tracking-widest">No archival data found</div>
                    ) : (
                      <table className="w-full text-left">
                        <tbody>
                          {operations.map((op) => (
                            <tr key={op._id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                              <td className="p-8">
                                <div className="text-sm font-bold text-white uppercase group-hover:text-blue-400">{(op.ruleId as any)?.name || 'Op_' + op._id.slice(-6)}</div>
                                <div className="text-[9px] text-slate-500 mt-1 uppercase font-black opacity-60">TX_HASH: CDTF..{op._id.slice(-12)}</div>
                              </td>
                              <td className="p-8">
                                 <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase flex items-center gap-2 ${op.status === 'verified' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700/10 text-slate-500'}`}>
                                    <div className="w-1 h-1 rounded-full bg-current" />
                                    {op.status}
                                 </div>
                              </td>
                              <td className="p-8 text-right font-mono text-[10px] text-slate-600">
                                {new Date(op.createdAt).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>

          {/* Infrastructure Sidebar ( telemetry ) */}
          <aside className="space-y-12">
            
            {/* Real-time Telemetry Stream */}
            <section className="rounded-[2.5rem] glass border-white/5 overflow-hidden flex flex-col h-[500px]">
               <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live telemetry</h3>
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
               </div>
               <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-black/20 font-mono text-[10px]" style={{ scrollbarWidth: 'none' }}>
                  {liveLogs.length === 0 && <div className="text-slate-700 italic text-[9px] opacity-40">Awaiting protocol events...</div>}
                  {liveLogs.map((log, i) => (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="flex gap-4">
                       <span className="opacity-30 flex-shrink-0">{log.t}</span>
                       <span className={`${log.c} font-bold leading-relaxed`}>{log.m}</span>
                    </motion.div>
                  ))}
               </div>
               <div className="p-4 bg-white/5 border-t border-white/5 text-center">
                  <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Protocol Buffer: 100% Sync</div>
               </div>
            </section>

            <section className="p-10 rounded-[3rem] glass border-white/5 bg-gradient-to-br from-blue-600/5 to-transparent">
               <div className="w-16 h-16 bg-blue-600/10 rounded-3xl flex items-center justify-center text-blue-400 mb-8 border border-blue-500/20">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
               </div>
               <h3 className="text-xl font-bold text-white mb-2">Protocol Health</h3>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6 opacity-60">Verified On-Chain Via Stellar</p>
               <div className="space-y-3">
                  <div className="flex justify-between text-[9px] font-black uppercase text-slate-500 mb-1"><span>Availability</span><span>100%</span></div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                     <div className="w-full h-full bg-blue-500" />
                  </div>
               </div>
            </section>

          </aside>
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}
