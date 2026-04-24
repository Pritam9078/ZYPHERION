import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import SocketService from '../services/socket';
import Navbar from '../components/Navbar';
import AuthGuard from '../components/AuthGuard';
import ProfileCard from '../components/ProfileCard';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'network' | 'history'>('overview');
  
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
    <AuthGuard allowedAccountTypes={['Guest']}>
      <div className="min-h-screen bg-white dark:bg-zypher-bg text-slate-900 dark:text-slate-200 transition-colors duration-300">

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
               {['overview', 'network', 'history'].map((tab) => (
                  <button
                     key={tab}
                     onMouseEnter={playHover}
                     onClick={() => { playClick(); setActiveTab(tab as any); }}
                     className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
                  >
                     {tab}
                  </button>
               ))}
               <button
                  onClick={() => router.push('/developer')}
                  className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-dashed border-slate-300 dark:border-white/10 hover:border-blue-500/50 hover:text-blue-500 transition-all"
               >
                  Upgrade to Developer_
               </button>
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
                  
                  {/* Developer Upgrade Teaser */}
                  <div className="p-10 rounded-[3rem] bg-gradient-to-br from-indigo-600/10 via-blue-600/5 to-transparent border-2 border-blue-500/20 relative overflow-hidden group">

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="max-w-xl">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                          <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em]">Developer Access_</span>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">Unlock the Sovereign Infrastructure Engine_</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                          As a Guest, you are observing the global state in real-time. Upgrade to a <span className="text-blue-600 dark:text-blue-400 font-bold">Developer Account</span> to deploy custom ZK-logic, automate cross-chain executions, and integrate the DNAProof Oracle into your own DApps.
                        </p>
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Logic Architect</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">API Key Generation</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Gas Abstraction</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => router.push('/developer')}
                        className="px-10 py-5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-blue-600/40 hover:bg-blue-500 hover:scale-105 transition-all group"
                      >
                        Initialize Upgrade
                        <svg className="w-4 h-4 inline-block ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </button>
                    </div>
                  </div>

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
                  <button onClick={() => router.push('/developer')} className="w-full py-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[9px] font-black uppercase text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all text-left px-6">View Documentation</button>
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
