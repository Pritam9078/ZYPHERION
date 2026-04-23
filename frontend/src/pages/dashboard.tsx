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
import { useSound } from '../hooks/useSound';
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
  const { playHover, playClick, playSuccess, playError, playExecution } = useSound();
  const socketRef = useRef<Socket | null>(null);
  
  const [token, setToken] = useState<string | null>(null);
  const [rules, setRules] = useState<LogicRule[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'builder' | 'automation' | 'history' | 'governance'>('overview');
  
  // Real-time Logs State
  const [liveLogs, setLiveLogs] = useState<{t: string, m: string, c: string}[]>([]);
  const [systemStats, setSystemStats] = useState({ connections: 0, load: 'LOW' });
  const [systemPaused, setSystemPaused] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [pendingGov, setPendingGov] = useState<any[]>([]);
  const [isVerifyingDID, setIsVerifyingDID] = useState(false);

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
    autoExecute: false,
    triggerType: 'state', // state, time, event
    scheduledAt: '',
    recurrenceInterval: 0,
    dataSourceUrl: '',
    dataSourcePath: '',
    triggerEventSignature: '',
    triggerContractAddress: '',
    // Phase 3 Fields
    isMultiSig: false,
    requiredApprovals: 2,
    approvers: '' // Comma separated addresses
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
      const isSuccess = data.type.toLowerCase() === 'success';
      addNotification(data.message, isSuccess ? 'success' : 'error');
      if (isSuccess) playSuccess(); else playError();
      addLiveLog(`AUTORUN: ${data.message}`, 'text-blue-500 dark:text-blue-400');
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
    if (token && wallet.status === 'connected') {
      loadData();
    }

    const loadSettings = async () => {
      if (!token || wallet.status !== 'connected') return;
      try {
        const settings = await fetchSystemSettings(token);
        setSystemPaused(settings.protocolHalt);
        if (settings.protocolHalt) {
          addLiveLog('ALRT: System currently in OVERRIDE mode. Operations frozen.', 'text-red-600 dark:text-red-500');
        }
      } catch (err) {
        console.error('Failed to sync system status');
      }
    };
    loadSettings();
  }, [token, wallet.status]);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [rulesData, opsData, userData, govRes] = await Promise.all([
        fetchRules(token),
        fetchOperations(token),
        fetchUserProfile(token),
        fetch(`${API_BASE}/api/governance/pending`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      setRules(rulesData);
      setOperations(opsData);
      setUser(userData);
      if (govRes.ok) {
        const govData = await govRes.json();
        setPendingGov(govData.pending);
      }
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

  const addLiveLog = (m: string, c: string = 'text-slate-500 dark:text-slate-400') => {
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
      if (result) playSuccess(); else playError();
      addLiveLog(`SIM: Logic evaluation returned ${result}`, 'text-indigo-600 dark:text-indigo-400');
    } catch (err: any) {
      setSimResult({ status: 'error', msg: err.message });
      playError();
      addLiveLog(`SIM_ERR: ${err.message}`, 'text-red-600 dark:text-red-400');
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
        scheduledAt: formState.scheduledAt || undefined,
        recurrenceInterval: formState.recurrenceInterval,
        dataSourceUrl: formState.dataSourceUrl,
        dataSourcePath: formState.dataSourcePath,
        triggerEventSignature: formState.triggerEventSignature,
        triggerContractAddress: formState.triggerContractAddress,
        isMultiSig: formState.isMultiSig,
        requiredApprovals: formState.requiredApprovals,
        approvers: formState.approvers.split(',').map(a => a.trim()).filter(a => a),
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
        autoExecute: false, triggerType: 'state', scheduledAt: '',
        recurrenceInterval: 0, dataSourceUrl: '', dataSourcePath: '',
        triggerEventSignature: '', triggerContractAddress: '',
        isMultiSig: false, requiredApprovals: 2, approvers: ''
      });
      setActiveTab('overview');
      addNotification('Infrastructure Rule deployed successfully.', 'success');
      playExecution();
      addLiveLog(`DEPLOY: New rule ${formState.name} committed to Stellar.`, 'text-emerald-600 dark:text-emerald-400');
      loadData();
    } catch (err: any) {
      addNotification('Deployment failed.', 'error');
      playError();
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
      addLiveLog(`PROOF_REQ: Rule_${ruleId.slice(-6)} processing...`, 'text-blue-600 dark:text-blue-400');
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
      addLiveLog(`ATTEST: Op_${opId.slice(-6)} verified on Stellar.`, 'text-emerald-600 dark:text-emerald-400');
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
     <div className="min-h-screen bg-white dark:bg-zypher-bg flex flex-col items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full mb-6" 
        />
        <div className="text-[10px] font-black text-blue-600 dark:text-blue-400/60 uppercase tracking-[0.4em] animate-pulse">Syncing Telemetry...</div>
     </div>
  );

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white dark:bg-zypher-bg text-slate-900 dark:text-slate-200 transition-colors duration-300">
      <div className="fixed inset-0 blueprint-bg opacity-[0.03] dark:opacity-20 pointer-events-none" />
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
              className={`p-4 rounded-xl border-2 glass backdrop-blur-xl flex items-center gap-3 ${n.type === 'error' ? 'border-red-500/30 text-red-600 dark:text-red-400' : 'border-blue-500/30 text-blue-600 dark:text-blue-400'}`}
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
                  <div className="w-16 h-16 bg-red-600/20 rounded-[1.5rem] flex items-center justify-center text-red-600 dark:text-red-500 border border-red-600/20">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Emergency Protocol Override Active_</h4>
                    <p className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase tracking-widest mt-1 opacity-80">Infrastructure write-operations are cryptographically halted by Overseer.</p>
                  </div>
                </div>
                <div className="px-8 py-3 bg-red-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-red-600/30 relative z-10">
                  SYSTEM_LOCKED
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
         <header className="mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-8 rounded-[3rem] backdrop-blur-3xl shadow-2xl">
               <div className="flex items-center gap-8">
                  <div className="space-y-1">
                     <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-500/20">SYSTEM_INFRA_V2</span>
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${wallet.tier === 'Pro' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' : wallet.tier === 'Basic' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'}`}>
                          {wallet.tier || 'Free'} TIER
                        </span>
                     </div>
                     <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mt-4">Protocol Hub_</h1>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] ml-1">Node ID: {wallet.address ? wallet.address.slice(0, 16) : 'GUEST'}</p>
                  </div>
               </div>

               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3 bg-slate-100 dark:bg-black/40 px-6 py-4 rounded-3xl border border-slate-200 dark:border-white/5">
                     <div className="text-center px-4 border-r border-slate-200 dark:border-white/10">
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Connections</div>
                        <div className="text-xl font-bold text-slate-900 dark:text-white">{systemStats.connections}</div>
                     </div>
                     <div className="text-center px-4">
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">System Load</div>
                        <div className={`text-xl font-bold ${systemStats.load === 'LOW' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>{systemStats.load}</div>
                     </div>
                  </div>
                  <button 
                     onMouseEnter={playHover}
                     onClick={() => { playClick(); router.push('/billing'); }}
                     className="px-8 py-4 bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-300 dark:border-white/10 hover:scale-105 active:scale-95"
                  >
                     Manage Billing
                  </button>
               </div>
            </div>

            <nav className="flex gap-4 mt-8 bg-slate-50 dark:bg-white/[0.01] p-2 rounded-2xl border border-slate-200 dark:border-white/[0.02] w-fit">
               {['overview', 'builder', 'automation', 'history', 'governance'].map((tab) => (
                  <button
                     key={tab}
                     onMouseEnter={playHover}
                     onClick={() => { playClick(); setActiveTab(tab as any); }}
                     className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
                  >
                     {tab}
                  </button>
               ))}
            </nav>
         </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Main Workspace Area */}
          <div className="lg:col-span-3 space-y-12">
            
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div 
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                  {/* Global Network Visualization */}
                  <NetworkMap />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stats.map((stat, i) => (
                      <div key={i} className="p-10 rounded-[3rem] glass border-slate-200 dark:border-white/[0.03] relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
                         <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                         <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            {stat.label}
                         </h3>
                         <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">{stat.value}</div>
                         <div className="h-10 mt-6">
                            <Sparkline color={stat.color} />
                         </div>
                      </div>
                    ))}
                  </div>

                  <section className="rounded-[2.5rem] glass border-slate-200 dark:border-white/5 overflow-hidden">
                    <div className="p-8 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/[0.01]">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white px-2 uppercase tracking-tighter">Registered Infrastructure Rules</h3>
                    </div>
                    {rules.length === 0 ? (
                      <div className="p-20 text-center text-slate-400 dark:text-slate-600 italic uppercase font-black tracking-widest opacity-30">No active logic registries</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <tbody>
                            {rules.map((rule) => (
                              <tr key={rule._id} className="border-b border-slate-200 dark:border-white/5 group hover:bg-blue-600/[0.01] transition-colors">
                                <td className="p-8">
                                  <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-4">
                                    <span className="uppercase tracking-tighter group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{rule.name}</span>
                                    {rule.automationConfig?.autoExecute && (
                                       <span className="text-[8px] px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded font-black">AUTO_ENABLE</span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black opacity-50">v{rule.version || 1.1} // ID_{rule._id.slice(-6)}</div>
                                </td>
                                <td className="p-8 text-right space-x-3">
                                  <button onClick={() => openInspector('Logic Payload', rule)} className="px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors">Inspect</button>
                                  <button 
                                    onClick={() => handleRequestProof(rule._id)} 
                                    disabled={systemPaused}
                                    className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl transition-all ${systemPaused ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-600 cursor-not-allowed opacity-50' : 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-500 scale-95 hover:scale-100'}`}
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
                  key="builder"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-12"
                >
                   <form onSubmit={handleCreateRule} className="p-10 rounded-[3rem] bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/10">
                      <div className="flex justify-between items-center mb-10">
                        <div>
                          <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Logic Architect_</h3>
                          <p className="text-blue-600 dark:text-blue-400/60 text-xs font-bold uppercase tracking-widest mt-1">Design trustless multi-chain predicates</p>
                        </div>
                        <div className="flex bg-slate-200 dark:bg-black/40 p-1.5 rounded-2xl border border-slate-300 dark:border-white/5">
                           {['state', 'time', 'event'].map((type) => (
                             <button
                               key={type}
                               type="button"
                               onClick={() => setFormState({...formState, triggerType: type})}
                               className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${formState.triggerType === type ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                             >
                               {type}_BASED
                             </button>
                           ))}
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
                            className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                           />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-2">Target Protocol Source</label>
                           <select 
                            value={formState.targetChain}
                            onChange={e => setFormState({...formState, targetChain: e.target.value})}
                            className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                           >
                             <option value="Ethereum (Simulated)">Ethereum (Simulated)</option>
                             <option value="Base (L2)">Base (L2)</option>
                             <option value="Arbitrum (One)">Arbitrum (One)</option>
                             <option value="Stellar (Mainnet)">Stellar (Mainnet)</option>
                           </select>
                        </div>
                      </div>

                      {/* Phase 2: Dynamic Trigger Parameters */}
                      <AnimatePresence mode="wait">
                        {formState.triggerType === 'time' && (
                          <motion.div 
                            key="time"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
                          >
                             <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-500 tracking-widest px-2">Scheduled Execution (UTC)</label>
                                <input 
                                   type="datetime-local"
                                   value={formState.scheduledAt}
                                   onChange={e => setFormState({...formState, scheduledAt: e.target.value})}
                                   className="w-full bg-white dark:bg-black/40 border border-amber-500/20 rounded-2xl px-6 py-4 text-slate-900 dark:text-white focus:border-amber-500 outline-none"
                                />
                             </div>
                             <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-500 tracking-widest px-2">Recurrence (Seconds)</label>
                                <input 
                                   type="number"
                                   value={formState.recurrenceInterval}
                                   onChange={e => setFormState({...formState, recurrenceInterval: parseInt(e.target.value)})}
                                   placeholder="0 for one-time"
                                   className="w-full bg-white dark:bg-black/40 border border-amber-500/20 rounded-2xl px-6 py-4 text-slate-900 dark:text-white focus:border-amber-500 outline-none"
                                />
                             </div>
                          </motion.div>
                        )}

                        {formState.triggerType === 'event' && (
                          <motion.div 
                            key="event"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
                          >
                             <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-500 tracking-widest px-2">Contract Address</label>
                                <input 
                                   type="text"
                                   value={formState.triggerContractAddress}
                                   onChange={e => setFormState({...formState, triggerContractAddress: e.target.value})}
                                   placeholder="0x..."
                                   className="w-full bg-white dark:bg-black/40 border border-emerald-500/20 rounded-2xl px-6 py-4 text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                                />
                             </div>
                             <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-500 tracking-widest px-2">Event Signature (Topic0)</label>
                                <input 
                                   type="text"
                                   value={formState.triggerEventSignature}
                                   onChange={e => setFormState({...formState, triggerEventSignature: e.target.value})}
                                   placeholder="Transfer(address,address,uint256)"
                                   className="w-full bg-white dark:bg-black/40 border border-emerald-500/20 rounded-2xl px-6 py-4 text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                                />
                             </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Phase 3: Enterprise Governance (Multi-Sig) */}
                      <div className="mb-12 p-8 rounded-3xl bg-indigo-500/[0.03] border border-indigo-500/10">
                        <div className="flex items-center justify-between mb-8">
                           <div>
                              <h4 className="text-slate-900 dark:text-white font-bold text-lg">Enterprise Governance_</h4>
                              <p className="text-[9px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest mt-1">Require cryptographic quorum for execution</p>
                           </div>
                           <button 
                             type="button"
                             onClick={() => setFormState({...formState, isMultiSig: !formState.isMultiSig})}
                             className={`w-14 h-8 rounded-full relative transition-all ${formState.isMultiSig ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-800'}`}
                           >
                             <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-all ${formState.isMultiSig ? 'right-1' : 'left-1'}`} />
                           </button>
                        </div>

                        <AnimatePresence>
                          {formState.isMultiSig && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="grid grid-cols-1 md:grid-cols-2 gap-8"
                            >
                               <div className="space-y-3">
                                  <label className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest px-2">Approval Threshold (Quorum)</label>
                                  <input 
                                     type="number"
                                     value={formState.requiredApprovals}
                                     onChange={e => setFormState({...formState, requiredApprovals: parseInt(e.target.value)})}
                                     className="w-full bg-white dark:bg-black/40 border border-indigo-500/20 rounded-2xl px-6 py-4 text-slate-900 dark:text-white focus:border-indigo-500 outline-none"
                                  />
                               </div>
                               <div className="space-y-3">
                                  <label className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest px-2">Authorized Approvers (CSV)</label>
                                  <input 
                                     type="text"
                                     value={formState.approvers}
                                     onChange={e => setFormState({...formState, approvers: e.target.value})}
                                     placeholder="0x..., 0x..."
                                     className="w-full bg-white dark:bg-black/40 border border-indigo-500/20 rounded-2xl px-6 py-4 text-slate-900 dark:text-white focus:border-indigo-500 outline-none text-xs"
                                  />
                               </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Phase 1: Cross-Chain Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-2 text-indigo-600 dark:text-indigo-400">Target Contract Address</label>
                           <input 
                              type="text"
                              value={formState.targetContract}
                              onChange={e => setFormState({...formState, targetContract: e.target.value})}
                              placeholder="0x71C... or Stellar_Address"
                              className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-slate-900 dark:text-white focus:border-indigo-500 outline-none"
                           />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-2 text-indigo-600 dark:text-indigo-400">Execution Payload (Hex)</label>
                           <input 
                              type="text"
                              value={formState.targetPayload}
                              onChange={e => setFormState({...formState, targetPayload: e.target.value})}
                              placeholder="0xa9059cbb..."
                              className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-slate-900 dark:text-white focus:border-indigo-500 outline-none"
                           />
                        </div>
                      </div>

                      <div className="p-8 bg-indigo-500/5 rounded-3xl border border-indigo-500/20 flex items-center justify-between mb-12">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <div>
                               <div className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tighter">Gas Abstraction Service</div>
                               <div className="text-[9px] text-slate-500 font-bold uppercase mt-1">Pay destination gas with your ZYP credits</div>
                            </div>
                         </div>
                         <button 
                          type="button"
                          onClick={() => setFormState({...formState, useGasAbstraction: !formState.useGasAbstraction})}
                          className={`w-12 h-6 rounded-full transition-all relative ${formState.useGasAbstraction ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
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
                                  className="w-full bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-[2rem] px-8 py-6 text-blue-600 dark:text-blue-400 font-mono text-sm focus:border-blue-500 outline-none shadow-inner"
                               />
                            </div>
                            <div className="p-6 bg-slate-100 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 flex items-center justify-between">
                               <div>
                                  <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Autonomous Execution</div>
                                  <div className="text-[9px] text-slate-500 font-bold uppercase mt-1">Retry and attest via background worker if satisfied</div>
                               </div>
                               <button 
                                type="button"
                                onClick={() => setFormState({...formState, autoExecute: !formState.autoExecute})}
                                className={`w-12 h-6 rounded-full transition-all relative ${formState.autoExecute ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
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
                                      className="p-4 text-left glass border-slate-200 dark:border-white/5 rounded-xl text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-blue-500/40 transition-all"
                                    >
                                      {t.label}
                                    </button>
                                  ))}
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="mt-12 flex justify-end gap-4 border-t border-slate-200 dark:border-white/5 pt-8">
                         <button 
                            type="button"
                            onClick={handleRunSimulation}
                            className="px-10 py-4 bg-indigo-600/10 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all shadow-xl shadow-indigo-600/10"
                         >
                           Simulate State
                         </button>
                         <button 
                            type="submit" 
                            disabled={submitting || systemPaused}
                            className={`px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl ${submitting || systemPaused ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-600 cursor-not-allowed' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-blue-600 hover:text-white shadow-white/5'}`}
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
                               <div className={`text-xl font-black uppercase tracking-tighter ${simResult.status === 'pass' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>Simulation Result_</div>
                               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{simResult.msg}</p>
                            </div>
                         </div>
                         <button onClick={() => setSimResult(null)} className="text-[10px] font-black text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest transition-colors">Dismiss</button>
                      </motion.div>
                   )}
                </motion.section>
              )}

              {activeTab === 'automation' && (
                <motion.section 
                  key="automation"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                   <div className="p-12 rounded-[3rem] glass border-slate-200 dark:border-white/5">
                      <div className="flex items-center gap-6 mb-12">
                         <div className="w-16 h-16 bg-blue-600/10 rounded-[1.8rem] flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         </div>
                         <div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Automation Scheduler_</h3>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Manage background workers and recurrent jobs</p>
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="p-8 bg-slate-50 dark:bg-black/40 rounded-[2.5rem] border border-slate-200 dark:border-white/5">
                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Worker Status</div>
                            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">RUNNING_0x42</div>
                            <p className="text-[10px] text-slate-500 font-medium">Listening for cross-chain state events and block timestamps.</p>
                         </div>
                         <div className="p-8 bg-slate-50 dark:bg-black/40 rounded-[2.5rem] border border-slate-200 dark:border-white/5">
                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Job Density</div>
                            <div className="text-xl font-bold text-slate-900 dark:text-white mb-2">12 Active Tasks</div>
                            <p className="text-[10px] text-slate-500 font-medium">8 Recurrent, 4 Event-based triggers currently indexed.</p>
                         </div>
                      </div>
                   </div>
                </motion.section>
              )}

              {activeTab === 'governance' && (
                <motion.section 
                  key="governance"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                   <div className="p-12 rounded-[3rem] glass border-slate-200 dark:border-white/5">
                      <div className="flex items-center gap-6 mb-12">
                         <div className="w-16 h-16 bg-indigo-600/10 rounded-[1.8rem] flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                         </div>
                         <div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Enterprise Governance_</h3>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Manage rule approvals and protocol quorum</p>
                         </div>
                      </div>

                      <div className="space-y-4">
                         {pendingGov.length === 0 ? (
                            <div className="p-20 text-center glass border-slate-200 dark:border-white/5 rounded-[2rem] opacity-30 italic font-black uppercase tracking-widest text-[10px]">No pending quorum requests</div>
                         ) : pendingGov.map(gov => (
                            <div key={gov._id} className="p-8 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-3xl flex justify-between items-center group hover:bg-indigo-500/[0.03] transition-all">
                               <div>
                                  <div className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tighter">{gov.ruleName}</div>
                                  <div className="flex gap-4 mt-1">
                                     <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Approvals: {gov.currentApprovals} / {gov.requiredApprovals}</span>
                                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">OpID: {gov._id.slice(-8)}</span>
                                  </div>
                               </div>
                               <button 
                                 className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all"
                               >
                                  Sign Approval
                               </button>
                            </div>
                         ))}
                      </div>
                   </div>
                </motion.section>
              )}

              {activeTab === 'history' && (
                <motion.div 
                  key="history"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-[2.5rem] glass border-slate-200 dark:border-white/5 overflow-hidden"
                >
                  <div className="p-8 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01]">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white px-2 uppercase tracking-tighter">Attestation Records</h3>
                  </div>
                  {operations.length === 0 ? (
                    <div className="p-20 text-center text-slate-400 dark:text-slate-600 italic uppercase font-black tracking-widest opacity-30">No execution history indexed</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <tbody>
                          {operations.map((op) => (
                            <tr key={op._id} className="border-b border-slate-200 dark:border-white/5 group hover:bg-emerald-500/[0.01] transition-colors">
                              <td className="p-8">
                                <div className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                  <span className="uppercase tracking-tighter">{(op.ruleId as any)?.name || 'Op_' + op._id.slice(-6)}</span>
                                  <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${op.status === 'verified' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400'}`}>{op.status}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 mt-1 uppercase font-mono opacity-50">TX: {op.txHash || 'NULL_COMMIT'}</div>
                              </td>
                              <td className="p-8 text-right space-x-3">
                                {op.status === 'pending' && (
                                  <button onClick={() => handleSubmitProof(op._id)} className="px-8 py-3 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:scale-105 transition-all">Submit to Stellar</button>
                                )}
                                <button onClick={() => openInspector('Operation Trace', op)} className="px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors">Trace</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar / Logs */}
          <aside className="space-y-12">
            
            <section className="rounded-[3rem] glass border-slate-200 dark:border-white/5 overflow-hidden flex flex-col h-[500px]">
              <div className="p-8 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01]">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Protocol telemetry</h3>
              </div>
              <div className="flex-1 p-8 space-y-6 overflow-y-auto bg-slate-100/50 dark:bg-black/20 font-mono text-[10px]" style={{ scrollbarWidth: 'none' }}>
                {liveLogs.length === 0 ? (
                   <div className="opacity-20 italic text-slate-500">Awaiting stream...</div>
                ) : liveLogs.map((log, i) => (
                  <div key={i} className="flex gap-4 items-start border-l-2 border-slate-200 dark:border-white/5 pl-4 ml-1">
                    <span className="opacity-30 flex-shrink-0 font-bold">{log.t}</span>
                    <span className={`${log.c} font-bold leading-relaxed`}>{log.m}</span>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-blue-600/5 text-center mt-auto border-t border-slate-200 dark:border-white/5 font-mono text-[9px] font-black text-blue-600 dark:text-blue-400 tracking-widest">
                REALTIME_FEED: ACTIVE
              </div>
            </section>

            <div className="p-8 rounded-[3rem] glass border-slate-200 dark:border-white/5 bg-gradient-to-br from-blue-600/5 to-transparent relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Quick Actions</h4>
               <div className="space-y-3">
                  <button onClick={() => setActiveTab('builder')} className="w-full py-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[9px] font-black uppercase text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all text-left px-6">New Infrastructure Rule</button>
                  <button onClick={() => router.push('/billing')} className="w-full py-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[9px] font-black uppercase text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all text-left px-6">Top up Gas Credits</button>
               </div>
            </div>

          </aside>
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}
