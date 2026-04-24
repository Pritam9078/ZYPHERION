import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import SocketService from '../services/socket';
import Navbar from '../components/Navbar';
import AuthGuard from '../components/AuthGuard';
import PayloadModal from '../components/PayloadModal';
import AIAssistant from '../components/AIAssistant';
import { useWallet } from '../hooks/useWallet';
import { useSound } from '../hooks/useSound';
import { 
  fetchRules, 
  createRule, 
  fetchOperations, 
  requestProof, 
  submitProof,
  fetchUserProfile,
  regenerateApiKey,
  LogicRule,
  Operation,
  API_BASE
} from '../services/api';
import { signActionRequest } from '../services/signing';

export default function DeveloperDashboard() {
  const router = useRouter();
  const { wallet } = useWallet();
  const { playHover, playClick, playSuccess, playError, playExecution } = useSound();
  const socketRef = useRef<Socket | null>(null);
  
  const [token, setToken] = useState<string | null>(null);
  const [rules, setRules] = useState<LogicRule[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'builder' | 'api' | 'webhooks'>('overview');
  
  const [apiKey, setApiKey] = useState('ZYPH-TEST-XXXX-XXXX-XXXX');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhooks, setWebhooks] = useState([
    { id: '1', url: 'https://myapp.com/api/zypherion-webhook', events: ['EXECUTION_COMPLETED'] }
  ]);

  // Builder State
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
    triggerType: 'state',
    scheduledAt: '',
    recurrenceInterval: 0,
    dataSourceUrl: '',
    dataSourcePath: '',
    triggerEventSignature: '',
    triggerContractAddress: '',
    isMultiSig: false,
    requiredApprovals: 2,
    approvers: ''
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

    const socket = SocketService.getSocket();
    socketRef.current = socket;

    const onConnect = () => {
      if (wallet.address) socket.emit('join_protocol', wallet.address);
    };

    const onExecutionUpdate = (data: any) => {
      const isSuccess = data.type.toLowerCase() === 'success';
      addNotification(data.message, isSuccess ? 'success' : 'error');
      if (isSuccess) playSuccess(); else playError();
      loadData();
    };

    socket.on('connect', onConnect);
    socket.on('execution_update', onExecutionUpdate);

    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('execution_update', onExecutionUpdate);
    };
  }, [router, wallet.address]);

  useEffect(() => {
    if (token && wallet.status === 'connected') {
      loadData();
      loadProfile();
    }
  }, [token, wallet.status]);

  const loadProfile = async () => {
    if (!token) return;
    try {
      const user = await fetchUserProfile(token);
      if (user.apiKey) setApiKey(user.apiKey);
    } catch (err) {
      console.error('[Developer] Failed to load profile:', err);
    }
  };

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [rulesData, opsData] = await Promise.all([
        fetchRules(token),
        fetchOperations(token)
      ]);
      setRules(rulesData);
      setOperations(opsData);
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

  const handleRegenerate = async () => {
    if (!token) return;
    setSubmitting(true);
    try {
      const data = await regenerateApiKey(token);
      setApiKey(data.apiKey);
      addNotification('API Key regenerated.', 'success');
    } catch (err) {
      addNotification('Regeneration failed.', 'error');
    } finally {
      setSubmitting(false);
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
        ...formState,
        conditions: { condition: formState.logic, type: formState.conditionType },
        approvers: formState.approvers.split(',').map(a => a.trim()).filter(a => a),
        status: 'active',
        ...auth
      });
      setFormState({ ...formState, name: '', logic: '' });
      setActiveTab('overview');
      addNotification('Rule deployed successfully.', 'success');
      playExecution();
      loadData();
    } catch (err: any) {
      addNotification('Deployment failed.', 'error');
      playError();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthGuard allowedAccountTypes={['Developer']}>
      <div className="min-h-screen bg-white dark:bg-zypher-bg text-slate-900 dark:text-slate-200 transition-colors duration-300">

        <Navbar />

        {/* Trace Notifications */}
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
          <header className="mb-12">
             <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-8 rounded-[3rem] backdrop-blur-3xl shadow-2xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                   <div className="space-y-1">
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-500/20">DEV_ENVIRONMENT_ALPHA</span>
                      <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mt-4">Developer Portal_</h1>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] ml-1">Secure SDK & Logic Architect</p>
                   </div>
                   <div className="flex gap-4">
                      {['overview', 'builder', 'api', 'webhooks'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab as any)}
                          className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
                        >
                          {tab}
                        </button>
                      ))}
                   </div>
                </div>
             </div>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="p-8 rounded-[2.5rem] glass border-slate-200 dark:border-white/5">
                      <h3 className="text-[10px] font-black uppercase text-slate-500 mb-4">API Health</h3>
                      <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">Operational</div>
                   </div>
                   <div className="p-8 rounded-[2.5rem] glass border-slate-200 dark:border-white/5">
                      <h3 className="text-[10px] font-black uppercase text-slate-500 mb-4">Total Rules</h3>
                      <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{rules.length}</div>
                   </div>
                   <div className="p-8 rounded-[2.5rem] glass border-slate-200 dark:border-white/5">
                      <h3 className="text-[10px] font-black uppercase text-slate-500 mb-4">Active Keys</h3>
                      <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">1</div>
                   </div>
                </div>

                <section className="rounded-[2.5rem] glass border-slate-200 dark:border-white/5 overflow-hidden">
                  <div className="p-8 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/[0.01]">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter">My Infrastructure Rules</h3>
                  </div>
                  {rules.length === 0 ? (
                    <div className="p-20 text-center text-slate-400 dark:text-slate-600 italic uppercase font-black tracking-widest opacity-30">No active logic registries</div>
                  ) : (
                    <table className="w-full text-left">
                      <tbody>
                        {rules.map((rule) => (
                          <tr key={rule._id} className="border-b border-slate-200 dark:border-white/5 group hover:bg-blue-600/[0.01] transition-colors">
                            <td className="p-8">
                              <div className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tighter">{rule.name}</div>
                              <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black opacity-50">v{rule.version || 1.1} // ID_{rule._id.slice(-6)}</div>
                            </td>
                            <td className="p-8 text-right">
                              <button 
                                onClick={() => handleRequestProof(rule._id)} 
                                className="px-8 py-3 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all"
                              >
                                Trigger Proof
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </section>
              </motion.div>
            )}

            {activeTab === 'builder' && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
                <form onSubmit={handleCreateRule} className="p-10 rounded-[3.5rem] bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/10 shadow-2xl">
                  <div className="mb-10">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Logic Architect_</h3>
                    <p className="text-blue-600 dark:text-blue-400/60 text-[10px] font-black uppercase tracking-widest mt-2">Design trustless multi-chain predicates</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-2">Identifier</label>
                       <input 
                        type="text" 
                        value={formState.name}
                        onChange={e => setFormState({...formState, name: e.target.value})}
                        className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-slate-900 dark:text-white outline-none"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-2">Target Source</label>
                       <select 
                        value={formState.targetChain}
                        onChange={e => setFormState({...formState, targetChain: e.target.value})}
                        className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-slate-900 dark:text-white outline-none"
                       >
                         <option value="Ethereum (Simulated)">Ethereum (Simulated)</option>
                         <option value="Base (L2)">Base (L2)</option>
                         <option value="Stellar (Mainnet)">Stellar (Mainnet)</option>
                       </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                     <div className="lg:col-span-3 space-y-6">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-2">Smart Predicate (JS_Core)</label>
                        <textarea 
                          value={formState.logic}
                          onChange={e => setFormState({...formState, logic: e.target.value})}
                          rows={10}
                          className="w-full bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-[2rem] px-8 py-6 text-blue-600 dark:text-blue-400 font-mono text-sm outline-none shadow-inner"
                        />
                     </div>
                     <div className="lg:col-span-2">
                        <AIAssistant logic={formState.logic} />
                     </div>
                  </div>

                  <div className="mt-12 flex justify-end gap-4 border-t border-slate-200 dark:border-white/5 pt-8">
                     <button type="submit" disabled={submitting} className="px-12 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all shadow-2xl">
                       {submitting ? 'Committing...' : 'Deploy Infrastructure Rule'}
                     </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'api' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 p-8 rounded-[2.5rem] glass border-slate-200 dark:border-white/5">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6">API Credentials</h3>
                  <div className="bg-slate-100 dark:bg-black/30 p-6 rounded-2xl border border-slate-200 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Sandbox Key</div>
                      <div className="font-mono text-emerald-600 dark:text-emerald-400 tracking-wider text-sm">{apiKey}</div>
                    </div>
                    <button onClick={handleRegenerate} disabled={submitting} className="px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-transparent rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                      Regenerate
                    </button>
                  </div>
                </div>
                <div className="p-8 rounded-[2.5rem] glass border-slate-200 dark:border-white/5">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6">Resources</h3>
                  <div className="space-y-4">
                    <a href="http://localhost:5001/api-docs" target="_blank" rel="noreferrer" className="block p-4 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/5">
                      <div className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Swagger UI</div>
                      <div className="text-xs text-slate-500">Interactive API documentation</div>
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </AuthGuard>
  );
}
