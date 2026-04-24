import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Socket } from 'socket.io-client';
import SocketService from '../services/socket';
import Navbar from '../components/Navbar';
import Preloader from '../components/Preloader';
import AuthGuard from '../components/AuthGuard';
import PayloadModal from '../components/PayloadModal';
import ProfileCard from '../components/ProfileCard';
import { API_BASE, fetchSystemSettings, toggleProtocolHalt } from '../services/api';
import { signActionRequest } from '../services/signing';
import { useWallet } from '../hooks/useWallet';
import { useSound } from '../hooks/useSound';

interface UserData {
  _id: string;
  address: string;
  role: string;
  status: 'active' | 'banned';
  accountType?: string;
  kycStatus?: string;
  approved?: boolean;
  createdAt: string;
}

interface Stats {
  users: number;
  rules: number;
  proofs: number;
  successRate: string;
}

const Sparkline = ({ color = '#3b82f6' }) => (
  <svg width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none" className="opacity-40">
    <path
      d="M0 35 Q 15 5, 30 20 T 60 10 T 100 15"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default function AdminDashboard() {
  const router = useRouter();
  const { wallet } = useWallet();
  const { playHover, playClick, playSuccess, playError, playExecution, playEmergency } = useSound();
  const socketRef = useRef<Socket | null>(null);
  
  const [token, setToken] = useState<string | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [ops, setOps] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'security' | 'entities' | 'governance' | 'cluster' | 'treasury'>('security');
  
  const [telemetry, setTelemetry] = useState<{t: string, m: string, c: string}[]>([]);
  const [systemHealth, setSystemHealth] = useState({ connections: 0, load: 'LOW' });

  const [inspector, setInspector] = useState<{isOpen: boolean, title: string, data: any}>({
    isOpen: false,
    title: '',
    data: null
  });

  const [systemPaused, setSystemPaused] = useState(false);
  const [halting, setHalting] = useState(false);

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
      socket.emit('join_protocol', 'ADMIN_ZONE');
    };

    const onSystemStats = (data: any) => {
      setSystemHealth({ connections: data.activeConnections, load: data.loadIndex });
    };

    socket.on('connect', onConnect);
    socket.on('system_stats', onSystemStats);
    
    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('system_stats', onSystemStats);
    };
  }, [router]);

  useEffect(() => {
    const loadAdminData = async () => {
      if (!token) return;
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [usersRes, statsRes, rulesRes, opsRes, depositsRes] = await Promise.all([
          fetch(`${API_BASE}/api/admin/users`, { headers }),
          fetch(`${API_BASE}/api/admin/stats`, { headers }),
          fetch(`${API_BASE}/api/admin/rules`, { headers }),
          fetch(`${API_BASE}/api/admin/proofs`, { headers }),
          fetch(`${API_BASE}/api/admin/deposits`, { headers })
        ]);

        if (!usersRes.ok || !statsRes.ok) throw new Error('Elevated permissions required.');

        setUsers(await usersRes.json());
        setStats(await statsRes.json());
        setRules(await rulesRes.json().catch(() => []));
        setOps(await opsRes.json().catch(() => []));
        setDeposits(await depositsRes.json().catch(() => []));
      } catch (err: any) {
        console.error(err);
        setTimeout(() => { router.push('/dashboard'); }, 2000);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();

    const loadSettings = async () => {
      if (!token) return;
      try {
        const settings = await fetchSystemSettings(token);
        setSystemPaused(settings.protocolHalt);
      } catch (err) {
        console.error('Failed to sync system status');
      }
    };
    loadSettings();

    if (router.query.tab) {
      setActiveTab(router.query.tab as any);
    }
  }, [token, router.query.tab]);

  const addTelemetryLog = (m: string, c: string = 'text-slate-500 dark:text-slate-400') => {
    const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTelemetry(prev => [{ t, m, c }, ...prev].slice(0, 50));
  };

  const handleUpdateUserStatus = async (userId: string, currentStatus: string) => {
    if (!token || !wallet.address) return;
    const newStatus = currentStatus === 'active' ? 'banned' : 'active';
    try {
      const auth = await signActionRequest(wallet.address, 'UPDATE_USER_STATUS', `UserID: ${userId}\nNewStatus: ${newStatus}`);
      
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus, ...auth })
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, status: newStatus as any } : u));
        addTelemetryLog(`GOV: Entity_${userId.slice(-6)} state changed to ${newStatus}`, 'text-amber-600 dark:text-amber-400');
        playExecution();
      } else {
        playError();
      }
    } catch (err) {
      playError();
    }
  };


  const handleApproveDeposit = async (depositId: string) => {
    if (!token || !wallet.address) return;
    try {
      const auth = await signActionRequest(wallet.address, 'APPROVE_DEPOSIT', `DepositID: ${depositId}`);
      
      const res = await fetch(`${API_BASE}/api/admin/deposits/${depositId}/approve`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...auth })
      });
      if (res.ok) {
        setDeposits(prev => prev.map(d => d._id === depositId ? { ...d, status: 'confirmed' } : d));
        addTelemetryLog(`TREASURY: Deposit_${depositId.slice(-6)} verified and escrow funded.`, 'text-blue-600 dark:text-blue-400');
        playSuccess();
      } else {
        playError();
      }
    } catch (err) {
      playError();
    }
  };

  const handleToggleProtocolHalt = async () => {
    if (!token || !wallet.address || halting) return;
    const newState = !systemPaused;
    const statusMsg = newState ? 'CRITICAL_PROTOCOL_HALT' : 'RESUME_PROTOCOL_STATE';
    
    if (newState && !confirm('WARNING: This will freeze all protocol operations immediately. Proceed with signature?')) return;

    if (newState) playEmergency();

    setHalting(true);
    try {
      addTelemetryLog(`GOV: Preparing ${statusMsg}...`, 'text-blue-600 dark:text-blue-400');
      const auth = await signActionRequest(wallet.address, 'TOGGLE_PROTOCOL_HALT', `Status: ${statusMsg}`);
      
      const res = await toggleProtocolHalt(token, newState, auth);
      setSystemPaused(res.protocolHalt);
      addTelemetryLog(`GOV: Protocol state updated to ${newState ? 'HALTED' : 'OPERATIONAL'}`, newState ? 'text-red-600 dark:text-red-500' : 'text-emerald-600 dark:text-emerald-400');
      if (!newState) playExecution();
    } catch (err: any) {
      addTelemetryLog(`ERR: Protocol override failed - ${err.message}`, 'text-red-600');
      playError();
    } finally {
      setHalting(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, currentRole: string) => {
    if (!token || !wallet.address) return;
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const auth = await signActionRequest(wallet.address, 'UPDATE_USER_ROLE', `UserID: ${userId}\nNewRole: ${newRole}`);
      
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole, ...auth })
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole as any } : u));
        addTelemetryLog(`SEC: Entity_${userId.slice(-6)} role updated to ${newRole}`, 'text-blue-600 dark:text-blue-400');
        playExecution();
      } else {
        playError();
      }
    } catch (err) {
      playError();
    }
  };

  const handleApproveUser = async (userId: string) => {
    if (!token || !wallet.address) return;
    try {
      addTelemetryLog(`SEC: Initiating KYC verification for Entity_${userId.slice(-6)}...`, 'text-blue-600 dark:text-blue-400');
      const auth = await signActionRequest(wallet.address, 'APPROVE_USER', `UserID: ${userId}\nAction: VERIFY_KYC`);
      
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/approve`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...auth })
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, approved: true, kycStatus: 'verified' } : u));
        addTelemetryLog(`SEC: Entity_${userId.slice(-6)} approved and identity verified on-chain.`, 'text-emerald-600 dark:text-emerald-400');
        playSuccess();
      } else {
        playError();
      }
    } catch (err) {
      playError();
    }
  };

  const handlePurgeRule = async (ruleId: string) => {
    if (!token || !wallet.address || !confirm('Permanently decommission this logic registry?')) return;
    try {
      const auth = await signActionRequest(wallet.address, 'DELETE_RULE', `RuleID: ${ruleId}`);
      
      const res = await fetch(`${API_BASE}/api/admin/rules/${ruleId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...auth })
      });
      if (res.ok) {
        setRules(prev => prev.filter(r => r._id !== ruleId));
        addTelemetryLog(`SEC: Registry_${ruleId.slice(-6)} purged from protocol.`, 'text-red-600 dark:text-red-400');
        playExecution();
      } else {
        playError();
      }
    } catch (err) {
       playError();
    }
  };

  const openInspector = (title: string, data: any) => {
    setInspector({ isOpen: true, title, data });
  };

  if (loading) return <Preloader />;

  return (
    <AuthGuard requireAdmin allowedAccountTypes={['DAOAdmin']}>
      <div className="min-h-screen bg-white dark:bg-zypher-bg text-slate-900 dark:text-slate-200 transition-colors duration-300 overflow-x-hidden">
        <Navbar />

        <PayloadModal 
          isOpen={inspector.isOpen}
          onClose={() => setInspector({ ...inspector, isOpen: false })}
          title={inspector.title}
          data={inspector.data}
        />
        
        <main className="relative z-10 container py-8">
          
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-8 border-b border-slate-200 dark:border-white/5 pb-8">
             <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-500 rounded-lg text-[9px] font-bold uppercase tracking-wider border border-red-500/20">ADMIN_OVERRIDE_ACTIVE</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Protocol Sovereignty Enabled</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tighter mb-4">Sovereign Command_</h2>
              <div className="flex gap-1.5 overflow-x-auto pb-2">
                {['security', 'entities', 'governance', 'cluster', 'treasury'].map((tab) => (
                  <button
                    key={tab}
                    onMouseEnter={playHover}
                    onClick={() => { playClick(); setActiveTab(tab as any); }}
                    className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-red-600 text-white shadow-xl shadow-red-600/20 scale-105' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-8 bg-slate-50 dark:bg-white/5 px-8 py-4 rounded-[2rem] border border-slate-200 dark:border-white/5">
               <div className="text-center font-mono">
                  <div className="text-[9px] font-bold text-slate-500 uppercase mb-1">Health Index</div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold">OPTIMAL_1.0</div>
               </div>
               <div className="w-[1px] h-8 bg-slate-200 dark:bg-white/10" />
               <div className="text-center font-mono">
                  <div className="text-[9px] font-bold text-slate-500 uppercase mb-1">Verification Load</div>
                  <div className="text-slate-900 dark:text-white font-bold">{stats?.proofs} OPS_BATCH</div>
               </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-sm">
            <div className="lg:col-span-2 space-y-12">
              <AnimatePresence mode="wait">
                {activeTab === 'security' && (
                  <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                          { label: 'Network Wallets', value: stats?.users || 0, color: '#3b82f6' },
                          { label: 'Global Registries', value: stats?.rules || 0, color: '#8b5cf6' },
                          { label: 'Active Verifications', value: stats?.proofs || 0, color: '#ec4899' },
                          { label: 'Protocol Finality', value: stats?.successRate || '0%', color: '#10b981' },
                        ].map((stat, i) => (
                          <div key={i} className="p-6 rounded-[2rem] glass border-slate-200 dark:border-white/[0.05] relative overflow-hidden group bg-slate-50 dark:bg-white/5">
                             <h3 className="text-[8px] font-bold tracking-[0.1em] text-slate-500 mb-2 uppercase">{stat.label}</h3>
                             <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tighter mb-2">{stat.value}</div>
                             <Sparkline color={stat.color} />
                          </div>
                        ))}
                     </div>
                      <div className="p-8 rounded-[2.5rem] bg-red-50 dark:bg-black/40 border border-red-100 dark:border-white/10 glass">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="w-3 h-3 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)] animate-pulse" />
                           <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter italic">Emergency Protocol Override</h3>
                        </div>
                        
                        <div className="p-6 bg-white dark:bg-black/40 rounded-[2rem] border border-slate-200 dark:border-white/5 flex items-center justify-between">
                           <div>
                              <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs mb-1">PROOFS_VERIFICATION_HALT</div>
                              <p className="text-[10px] text-slate-500 font-medium max-w-sm">Universal kill-switch to immediately freeze all on-chain cryptographic state attestations.</p>
                           </div>
                           <button onClick={handleToggleProtocolHalt} disabled={halting} className={`w-20 h-9 rounded-full transition-all relative ${halting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'} ${systemPaused ? 'bg-red-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                              <div className={`absolute top-1 left-1 w-7 h-7 bg-white rounded-full transition-all shadow-md transform ${systemPaused ? 'translate-x-11 shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'translate-x-0'}`} />
                           </button>
                        </div>
                      </div>
                  </motion.div>
                )}

                {activeTab === 'entities' && (
                  <motion.section key="entities" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="rounded-[3rem] glass border-slate-200 dark:border-white/5 overflow-hidden">
                    <div className="p-8 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] flex justify-between items-center px-10">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white px-2 tracking-tighter uppercase italic">Wallet Ecosystem_</h3>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-white/5 px-4 py-1.5 rounded-full">{users.length} ATTESTERS</span>
                    </div>
                    <div className="overflow-x-auto text-[11px] font-bold">
                      <table className="w-full text-left">
                        <tbody>
                          {users.map(u => (
                            <tr key={u._id} className="border-b border-slate-200 dark:border-white/5 group hover:bg-red-500/[0.02] transition-colors">
                              <td className="p-10">
                                <div className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-4">
                                  <div className={`w-2.5 h-2.5 rounded-full ${u.status === 'banned' ? 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]' : !u.approved ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse' : 'bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.5)]'}`} />
                                  <span className="font-mono tracking-tight">{u.address.slice(0, 32)}...</span>
                                </div>
                                <div className="text-[9px] text-slate-500 mt-2 uppercase tracking-[0.2em] font-bold opacity-50 flex gap-4">
                                  <span>ROLE: {u.role}</span>
                                  <span>STATUS: {u.status}</span>
                                  <span className={u.approved ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-500'}>KYC: {u.kycStatus || 'unverified'}</span>
                                </div>
                              </td>
                              <td className="p-10 text-right space-x-3">
                                 {!u.approved && (
                                   <button 
                                     onClick={() => handleApproveUser(u._id)} 
                                     className="px-5 py-3 rounded-2xl text-[9px] font-bold uppercase tracking-wider bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all shadow-[0_0_15px_rgba(37,99,235,0.1)]"
                                   >
                                     VERIFY_KYC
                                   </button>
                                 )}
                                 <button onClick={() => handleUpdateUserRole(u._id, u.role)} className={`px-5 py-3 rounded-2xl text-[9px] font-bold uppercase tracking-wider transition-all ${u.role === 'admin' ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/5 hover:border-indigo-500/30'}`}>
                                   {u.role === 'admin' ? 'REVOKE_ADMIN' : 'MAKE_ADMIN'}
                                 </button>
                                 <button onClick={() => handleUpdateUserStatus(u._id, u.status)} className={`px-8 py-3 rounded-2xl text-[9px] font-bold uppercase tracking-wider transition-all ${u.status === 'banned' ? 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-red-600/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-600 hover:text-white'}`}>
                                   {u.status === 'banned' ? 'REVOKE_BAN' : 'RESTRICT_ID'}
                                 </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.section>
                )}

                {activeTab === 'governance' && (
                  <motion.div key="governance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                    <section className="rounded-[3rem] glass border-slate-200 dark:border-white/5 overflow-hidden">
                      <div className="p-8 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] px-10">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white px-2 tracking-tighter uppercase italic">Logic Repositories</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <tbody>
                            {rules.map(r => (
                              <tr key={r._id} className="border-b border-slate-200 dark:border-white/5 group hover:bg-blue-600/[0.02] transition-colors">
                                <td className="p-10">
                                   <div className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                                      {r.name}
                                      <span className="text-[8px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded uppercase tracking-tighter opacity-50">{r.status}</span>
                                   </div>
                                </td>
                                <td className="p-10 text-right space-x-3">
                                   <button onClick={() => openInspector('Rule Detailed View', r)} className="px-5 py-2.5 bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all">Audit</button>
                                   <button onClick={() => handlePurgeRule(r._id)} className="px-5 py-2.5 bg-red-600/10 text-red-600 dark:text-red-500 hover:bg-red-600 hover:text-white rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all">Purge</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  </motion.div>
                )}

                {activeTab === 'treasury' && (
                  <motion.section key="treasury" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-[3rem] glass border-slate-200 dark:border-white/5 overflow-hidden">
                    <div className="p-8 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] px-10">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white px-2 tracking-tighter uppercase italic">Protocol Treasury_</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <tbody>
                          {deposits.map(d => (
                            <tr key={d._id} className="border-b border-slate-200 dark:border-white/5 group hover:bg-blue-600/[0.02] transition-colors">
                              <td className="p-10">
                                 <div className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                                    {d.depositAmount} {d.currency}
                                    <span className={`text-[8px] font-bold px-2 py-0.5 border rounded uppercase tracking-tighter ${d.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'}`}>{d.status}</span>
                                 </div>
                                 <div className="text-[8px] text-slate-500 dark:text-slate-600 mt-1 uppercase font-mono">TX: {d.txHash}</div>
                              </td>
                              <td className="p-10 text-right">
                                 {d.status === 'pending' && (
                                   <button onClick={() => handleApproveDeposit(d._id)} className="px-5 py-2.5 bg-blue-600/10 text-blue-600 dark:text-blue-500 hover:bg-blue-600 hover:text-white rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all">Approve & Fund</button>
                                 )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.section>
                )}

                {activeTab === 'cluster' && (
                  <motion.section key="cluster" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-[3rem] glass border-slate-200 dark:border-white/5 overflow-hidden">
                    <div className="p-8 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] px-10">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white px-2 tracking-tighter uppercase italic">Cryptographic Operations_</h3>
                    </div>
                    <div className="overflow-x-auto text-[11px] font-bold">
                      <table className="w-full text-left">
                        <tbody>
                          {ops.map(op => (
                            <tr key={op._id} className="border-b border-slate-200 dark:border-white/5 group hover:bg-blue-600/[0.01] transition-colors">
                              <td className="p-10">
                                <div className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-4">
                                  <div className={`w-2 h-2 rounded-full ${op.status === 'verified' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : op.status === 'failed' ? 'bg-red-600' : 'bg-blue-500 animate-pulse'}`} />
                                  <span className="font-mono tracking-tight uppercase tracking-wider">OP_{op._id.slice(-8)}</span>
                                </div>
                                <div className="text-[9px] text-slate-500 mt-2 uppercase tracking-[0.2em] font-bold opacity-50 flex gap-4">
                                  <span>RULE: {op.ruleId?.name || 'GENERIC_INFRA'}</span>
                                  <span>STATUS: {op.status}</span>
                                  {op.txHash && <span className="text-blue-600 dark:text-blue-400">TX: {op.txHash.slice(0, 16)}...</span>}
                                </div>
                              </td>
                              <td className="p-10 text-right">
                                <button onClick={() => openInspector('Operation Trace', op)} className="px-5 py-2.5 bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all">Inspect Proof</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>
            </div>

            <aside className="space-y-12">
              <ProfileCard />
              
              <section className="rounded-[3rem] glass border-slate-200 dark:border-white/5 overflow-hidden flex flex-col h-[600px] shadow-2xl">
                <div className="p-8 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01]">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Protocol Audit logs</h3>
                </div>
                <div className="flex-1 p-8 space-y-8 overflow-y-auto bg-slate-100/50 dark:bg-black/20 font-mono text-[9px]" style={{ scrollbarWidth: 'none' }}>
                  {telemetry.map((log, i) => (
                    <div key={i} className="flex gap-4 items-start border-l-2 border-slate-200 dark:border-white/5 pl-4 ml-1">
                      <span className="opacity-30 flex-shrink-0 font-bold">{log.t}</span>
                      <span className={`${log.c} font-bold leading-relaxed break-all`}>{log.m}</span>
                    </div>
                  ))}
                  {telemetry.length === 0 && <div className="opacity-20 italic text-slate-500">Awaiting stream...</div>}
                </div>
                <div className="p-6 bg-red-600/5 text-center mt-auto border-t border-slate-200 dark:border-white/5 font-mono text-[8px] font-bold text-red-600 dark:text-red-500 tracking-wider">
                  IMMUTABLE_LOG_STREAM: ENABLED
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
