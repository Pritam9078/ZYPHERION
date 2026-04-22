import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import SocketService from '../services/socket';
import Navbar from '../components/Navbar';
import AuthGuard from '../components/AuthGuard';
import PayloadModal from '../components/PayloadModal';
import { API_BASE } from '../services/api';
import { signActionRequest } from '../services/signing';
import { useWallet } from '../hooks/useWallet';
import { fetchSystemSettings, toggleProtocolHalt } from '../services/api';

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

// Simple Sparkline Component
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
  const socketRef = useRef<Socket | null>(null);
  
  const [token, setToken] = useState<string | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [ops, setOps] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'security' | 'entities' | 'governance' | 'cluster' | 'treasury'>('security');
  
  // Real-time Systems Telemetry
  const [telemetry, setTelemetry] = useState<{t: string, m: string, c: string}[]>([]);
  const [systemHealth, setSystemHealth] = useState({ connections: 0, load: 'LOW' });

  // Inspector State
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

    // Initialize Socket.io via Singleton
    const socket = SocketService.getSocket();
    socketRef.current = socket;

    const onConnect = () => {
      console.log('[Overseer] Real-time uplink secured.');
      socket.emit('join_protocol', 'ADMIN_ZONE');
    };

    const onSystemStats = (data: any) => {
      setSystemHealth({ connections: data.activeConnections, load: data.loadIndex });
    };

    socket.on('connect', onConnect);
    socket.on('system_stats', onSystemStats);
    
    // Only emit join if already connected
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
        setTimeout(() => { window.location.href = '/dashboard'; }, 2000);
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
  }, [token, router]);

  const addTelemetryLog = (m: string, c: string = 'text-slate-400') => {
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
        addTelemetryLog(`GOV: Entity_${userId.slice(-6)} state changed to ${newStatus}`, 'text-amber-400');
      }
    } catch (err) {
      console.error('Action denied');
    }
  };

  const handleApproveUser = async (userId: string) => {
    if (!token || !wallet.address) return;
    try {
      const auth = await signActionRequest(wallet.address, 'APPROVE_USER', `UserID: ${userId}`);
      
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
        addTelemetryLog(`GOV: Entity_${userId.slice(-6)} KYC verified and access approved.`, 'text-blue-400');
      }
    } catch (err) {
      console.error('Approval denied');
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
        addTelemetryLog(`TREASURY: Deposit_${depositId.slice(-6)} verified and escrow funded.`, 'text-blue-400');
      }
    } catch (err) {
      console.error('Deposit approval denied');
    }
  };

  const handleToggleProtocolHalt = async () => {
    if (!token || !wallet.address || halting) return;
    const newState = !systemPaused;
    const statusMsg = newState ? 'CRITICAL_PROTOCOL_HALT' : 'RESUME_PROTOCOL_STATE';
    
    if (newState && !confirm('WARNING: This will freeze all protocol operations immediately. Proceed with signature?')) return;

    setHalting(true);
    try {
      addTelemetryLog(`GOV: Preparing ${statusMsg}...`, 'text-blue-400');
      const auth = await signActionRequest(wallet.address, 'TOGGLE_PROTOCOL_HALT', `Status: ${statusMsg}`);
      
      const res = await toggleProtocolHalt(token, newState, auth);
      setSystemPaused(res.protocolHalt);
      addTelemetryLog(`GOV: Protocol state updated to ${newState ? 'HALTED' : 'OPERATIONAL'}`, newState ? 'text-red-500' : 'text-emerald-400');
    } catch (err: any) {
      addTelemetryLog(`ERR: Protocol override failed - ${err.message}`, 'text-red-600');
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
        addTelemetryLog(`SEC: Entity_${userId.slice(-6)} role updated to ${newRole}`, 'text-blue-400');
      }
    } catch (err) {
      console.error('Role update denied');
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
        addTelemetryLog(`SEC: Registry_${ruleId.slice(-6)} purged from protocol.`, 'text-red-400');
      }
    } catch (err) {
       console.error('Purge failed');
    }
  };

  const openInspector = (title: string, data: any) => {
    setInspector({ isOpen: true, title, data });
  };

  if (loading) return (
    <div className="min-h-screen bg-zypher-bg flex flex-col items-center justify-center space-y-6">
      <motion.div 
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-16 h-16 border-4 border-blue-500/10 border-t-blue-500 rounded-full" 
      />
      <div className="text-[10px] font-black text-blue-400/60 uppercase tracking-[0.5em] animate-pulse">Syncing Overseer_Core V2</div>
    </div>
  );

  return (
    <AuthGuard requireAdmin>
      <div className="min-h-screen bg-zypher-bg text-slate-200">
      <div className="fixed inset-0 blueprint-bg opacity-20 pointer-events-none" />
      <Navbar />

      <PayloadModal 
        isOpen={inspector.isOpen}
        onClose={() => setInspector({ ...inspector, isOpen: false })}
        title={inspector.title}
        data={inspector.data}
      />
      
      <main className="relative z-10 container mx-auto px-6 py-12">
        
        {/* Overseer Command Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 border-b border-white/5 pb-8">
           <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-red-500/20">ADMIN_OVERRIDE_ACTIVE</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Protocol Sovereignty Enabled</span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter mb-4">Sovereign Command_</h2>
            <div className="flex gap-1.5 overflow-x-auto pb-2">
              {['security', 'entities', 'governance', 'cluster', 'treasury'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-red-600 text-white shadow-xl shadow-red-600/20 scale-105' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-8 bg-white/5 px-8 py-4 rounded-[2rem] border border-white/5">
             <div className="text-center font-mono">
                <div className="text-[9px] font-black text-slate-500 uppercase mb-1">Health Index</div>
                <div className="text-emerald-400 font-bold">OPTIMAL_1.0</div>
             </div>
             <div className="w-[1px] h-8 bg-white/10" />
             <div className="text-center font-mono">
                <div className="text-[9px] font-black text-slate-500 uppercase mb-1">Verification Load</div>
                <div className="text-white font-bold">{stats?.proofs} OPS_BATCH</div>
             </div>
          </div>
        </header>

        {/* Global metrics removed from top level */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-sm">
          
          <div className="lg:col-span-2 space-y-12">
            
            <AnimatePresence mode="wait">
              {activeTab === 'security' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                   {/* Integrated Metrics for Security Overview */}
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                      {[
                        { label: 'Network Wallets', value: stats?.users || 0, color: '#3b82f6' },
                        { label: 'Global Registries', value: stats?.rules || 0, color: '#8b5cf6' },
                        { label: 'Active Verifications', value: stats?.proofs || 0, color: '#ec4899' },
                        { label: 'Protocol Finality', value: stats?.successRate || '0%', color: '#10b981' },
                      ].map((stat, i) => (
                        <div key={i} className="p-6 rounded-[2rem] glass border-white/[0.05] relative overflow-hidden group bg-white/5">
                           <h3 className="text-[8px] font-black tracking-[0.1em] text-slate-500 mb-2 uppercase">{stat.label}</h3>
                           <div className="text-2xl font-bold text-white tracking-tighter mb-2">{stat.value}</div>
                           <Sparkline color={stat.color} />
                        </div>
                      ))}
                   </div>
                   <div className="p-12 rounded-[3.5rem] glass-blue border-red-500/10">
                      <div className="flex items-center gap-4 mb-8">
                         <div className="w-4 h-4 rounded-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse" />
                         <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Emergency Protocol Override</h3>
                      </div>
                      
                      <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 flex items-center justify-between">
                         <div>
                            <div className="font-black text-white uppercase tracking-widest text-xs mb-2">PROOFS_VERIFICATION_HALT</div>
                            <p className="text-[10px] text-slate-500 font-medium max-w-sm">Universal kill-switch to immediately freeze all on-chain cryptographic state attestations.</p>
                         </div>
                         <button 
                          onClick={handleToggleProtocolHalt}
                          disabled={halting}
                          className={`w-24 h-10 rounded-full transition-all relative ${halting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'} ${systemPaused ? 'bg-red-600' : 'bg-slate-700'}`}
                         >
                            <div className={`absolute top-1.5 left-1.5 w-7 h-7 bg-white rounded-full transition-all transform ${systemPaused ? 'translate-x-14 shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'translate-x-0'}`} />
                         </button>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-8 rounded-[2.5rem] glass border-white/5 bg-gradient-to-br from-red-600/5 to-transparent">
                         <h4 className="text-[10px] font-black text-red-500/60 uppercase tracking-widest mb-6">Threat Mitigation</h4>
                         <div className="space-y-4">
                            <button className="w-full py-4 glass border-white/5 text-[9px] font-black uppercase text-slate-400 hover:text-white transition-all text-left px-6">Flush Operation Queue</button>
                            <button className="w-full py-4 glass border-white/5 text-[9px] font-black uppercase text-slate-400 hover:text-white transition-all text-left px-6">Reject External API Requests</button>
                         </div>
                      </div>
                      <div className="p-8 rounded-[2.5rem] glass border-white/5 text-center flex flex-col items-center justify-center">
                         <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                         </div>
                         <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Security Score</div>
                         <div className="text-xl font-bold text-emerald-400 tracking-tighter uppercase">STABLE_SEC_01</div>
                      </div>
                   </div>
                </motion.div>
              )}

              {activeTab === 'entities' && (
                <motion.section 
                  initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                  className="rounded-[3rem] glass border-white/5 overflow-hidden"
                >
                  <div className="p-8 border-b border-white/5 bg-white/[0.02] flex justify-between items-center px-10">
                    <h3 className="text-xl font-black text-white px-2 tracking-tighter uppercase">Wallet Ecosystem_</h3>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full">{users.length} ATTESTERS</span>
                  </div>
                  <div className="overflow-x-auto text-[11px] font-bold">
                    <table className="w-full text-left">
                      <tbody>
                        {users.map(u => (
                          <tr key={u._id} className="border-b border-white/5 group hover:bg-red-500/[0.02] transition-colors">
                            <td className="p-10">
                              <div className="text-md font-bold text-white flex items-center gap-4">
                                <div className={`w-2.5 h-2.5 rounded-full ${u.status === 'banned' ? 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.5)]'}`} />
                                <span className="font-mono tracking-tight">{u.address.slice(0, 32)}...</span>
                              </div>
                              <div className="text-[9px] text-slate-500 mt-2 uppercase tracking-[0.2em] font-black opacity-50 flex gap-4">
                                <span>ROLE: {u.role}</span>
                                <span>STATUS: {u.status}</span>
                                <span className={u.approved ? 'text-blue-400' : 'text-amber-500'}>
                                  KYC: {u.kycStatus || 'unverified'}
                                </span>
                              </div>
                            </td>
                             <td className="p-10 text-right space-x-3">
                               <button 
                                onClick={() => handleUpdateUserRole(u._id, u.role)}
                                className={`px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${u.role === 'admin' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'bg-white/5 text-slate-400 border border-white/5 hover:border-indigo-500/30'}`}
                               >
                                 {u.role === 'admin' ? 'REVOKE_ADMIN' : 'MAKE_ADMIN'}
                               </button>
                               <button 
                                onClick={() => handleUpdateUserStatus(u._id, u.status)}
                                className={`px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${u.status === 'banned' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-600/10 text-red-400 border border-red-500/20 hover:bg-red-600 hover:text-white'}`}
                               >
                                 {u.status === 'banned' ? 'REVOKE_BAN' : 'RESTRICT_ID'}
                               </button>
                               {!u.approved && u.accountType !== 'Guest' && (
                                 <button 
                                  onClick={() => handleApproveUser(u._id)}
                                  className="px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600 hover:text-white"
                                 >
                                   APPROVE_ACCESS
                                 </button>
                               )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.section>
              )}

              {activeTab === 'governance' && (
                <motion.section 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="rounded-[3rem] glass border-white/5 overflow-hidden"
                >
                   <div className="p-8 border-b border-white/5 bg-white/[0.02] px-10">
                    <h3 className="text-xl font-black text-white px-2 tracking-tighter uppercase">Protocol-Wide Logic Repositories</h3>
                  </div>
                   <div className="overflow-x-auto text-[11px] font-bold">
                    <table className="w-full text-left">
                      <tbody>
                        {rules.map(r => (
                          <tr key={r._id} className="border-b border-white/5 group hover:bg-blue-600/[0.02] transition-colors">
                            <td className="p-10">
                               <div className="text-lg font-bold text-white uppercase tracking-tighter flex items-center gap-3">
                                  {r.name}
                                  <span className="text-[8px] font-black px-2 py-0.5 bg-white/5 border border-white/10 rounded uppercase tracking-tighter opacity-50">{r.status}</span>
                               </div>
                               <div className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest font-black opacity-50">Origin: {r.creator?.address?.slice(0, 16)}...</div>
                            </td>
                            <td className="p-10 text-right space-x-3">
                               <button onClick={() => openInspector('Rule Detailed View', r)} className="px-5 py-2.5 bg-white/5 text-slate-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Audit</button>
                               <button onClick={() => handlePurgeRule(r._id)} className="px-5 py-2.5 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Purge</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-8 border-t border-b border-white/5 bg-white/[0.02] px-10">
                    <h3 className="text-xl font-black text-white px-2 tracking-tighter uppercase">Global Operation Stream</h3>
                  </div>
                  <div className="overflow-x-auto text-[10px] font-bold">
                    <table className="w-full text-left">
                      <tbody>
                        {ops.map(o => (
                          <tr key={o._id} className="border-b border-white/5 hover:bg-emerald-500/[0.01]">
                            <td className="p-8">
                               <div className="text-white uppercase">{(o.ruleId as any)?.name || 'Op_' + o._id.slice(-6)}</div>
                               <div className="text-slate-600 mt-1 uppercase font-mono">TX: {o.txHash || 'PENDING_COMMIT'}</div>
                            </td>
                            <td className="p-8">
                               <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase ${o.status === 'verified' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 bg-white/5'}`}>{o.status}</span>
                            </td>
                            <td className="p-8 text-right text-slate-600">
                               {new Date(o.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.section>
              )}

              {activeTab === 'cluster' && (
                <motion.section 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="p-16 rounded-[4rem] glass-blue border-white/5 text-center"
                >
                   <div className="w-24 h-24 bg-red-600/10 rounded-[2.5rem] flex items-center justify-center text-red-500 mx-auto mb-10 border border-red-500/20 shadow-[0_0_50px_rgba(220,38,38,0.1)]">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.631.316a6 6 0 01-3.86.517l-2.387-.477a2 2 0 00-1.022.547l-1.162 1.163a2 2 0 00.597 3.301l1.544.515a2 2 0 001.265 0l1.544-.515a2 2 0 00.597-3.301l-1.162-1.163z" />
                      </svg>
                   </div>
                   <h3 className="text-4xl font-black text-white tracking-tighter mb-4">Master Cluster Monitor_</h3>
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-12 opacity-60">Real-time node telemetry and protocol orchestration</p>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                      <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 text-left group hover:border-red-500/30 transition-all">
                         <div className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-4">Health Status</div>
                         <div className="text-xl font-bold text-white mb-2 underline underline-offset-8">NODE_ALPHA_01</div>
                         <p className="text-[10px] text-slate-500 font-medium">Core verification engine is responding within nominal latency parameters.</p>
                      </div>
                      <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 text-left group hover:border-red-500/30 transition-all">
                         <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-4">Uptime</div>
                         <div className="text-xl font-bold text-white mb-2">99.999%_SYNC</div>
                         <p className="text-[10px] text-slate-500 font-medium">Protocol state synchronized across all known validators globally.</p>
                      </div>
                   </div>
                </motion.section>
              )}

              {activeTab === 'treasury' && (
                <motion.section 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="rounded-[3rem] glass border-white/5 overflow-hidden"
                >
                   <div className="p-8 border-b border-white/5 bg-white/[0.02] px-10">
                    <h3 className="text-xl font-black text-white px-2 tracking-tighter uppercase">Protocol Treasury & Escrow</h3>
                  </div>
                   <div className="overflow-x-auto text-[11px] font-bold">
                    <table className="w-full text-left">
                      <tbody>
                        {deposits.length === 0 ? (
                           <tr>
                             <td className="p-10 text-center opacity-30 italic uppercase font-black tracking-widest">No deposits found</td>
                           </tr>
                        ) : deposits.map(d => (
                          <tr key={d._id} className="border-b border-white/5 group hover:bg-blue-600/[0.02] transition-colors">
                            <td className="p-10">
                               <div className="text-lg font-bold text-white uppercase tracking-tighter flex items-center gap-3">
                                  {d.depositAmount} {d.currency}
                                  <span className={`text-[8px] font-black px-2 py-0.5 border rounded uppercase tracking-tighter ${d.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{d.status}</span>
                               </div>
                               <div className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest font-black opacity-50">From: {d.userAddress?.slice(0, 16)}...</div>
                               <div className="text-[8px] text-slate-600 mt-1 uppercase font-mono">TX: {d.txHash}</div>
                            </td>
                            <td className="p-10 text-right space-x-3">
                               {d.status === 'pending' && (
                                 <button 
                                  onClick={() => handleApproveDeposit(d._id)} 
                                  className="px-5 py-2.5 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                 >
                                   Approve & Fund
                                 </button>
                               )}
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

          {/* Overseer Sidebar ( Protocol Logs ) */}
          <aside className="space-y-12">
            
            <section className="rounded-[3rem] glass border-white/5 overflow-hidden flex flex-col h-[650px]">
              <div className="p-8 border-b border-white/5 bg-white/[0.01]">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Protocol Audit logs</h3>
              </div>
              <div className="flex-1 p-8 space-y-8 overflow-y-auto bg-black/20 font-mono text-[9px]" style={{ scrollbarWidth: 'none' }}>
                {[
                  { t: '16:02', m: 'AUTH_GATE: ADMIN_GC.. verified securely', c: 'text-emerald-400' },
                  { t: '15:58', m: 'GOV_SYS: Registry_WHALE decommissioned', c: 'text-red-400' },
                  { t: '15:45', m: 'SYSTEM_HEALTH: Master_Cluster optimized', c: 'text-blue-400' },
                  { t: '15:30', m: 'ALRT: ID_G2.. flagged for rate_violation', c: 'text-amber-400' },
                  { t: '14:15', m: 'SYSLOG: Global state sync 100% complete', c: 'text-slate-600' },
                ].map((log, i) => (
                  <div key={i} className="flex gap-4 items-start border-l-2 border-white/5 pl-4 ml-1">
                    <span className="opacity-30 flex-shrink-0 font-bold">{log.t}</span>
                    <span className={`${log.c} font-bold leading-relaxed break-all`}>{log.m}</span>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-red-600/5 text-center mt-auto border-t border-white/5 font-mono text-[8px] font-black text-red-500 tracking-widest">
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
