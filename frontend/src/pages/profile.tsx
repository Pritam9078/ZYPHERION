import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import AuthGuard from '../components/AuthGuard';
import { useWallet } from '../hooks/useWallet';
import { useSound } from '../hooks/useSound';
import { fetchUserProfile, updateUserProfile, API_BASE } from '../services/api';

export default function ProfilePage() {
  const router = useRouter();
  const { wallet } = useWallet();
  const { playHover, playClick, playSuccess, playError } = useSound();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: ''
  });
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('zypher_token');
    if (!token) {
      router.push('/');
      return;
    }

    const loadProfile = async () => {
      try {
        const profile = await fetchUserProfile(token);
        setUser(profile);
        setFormData({
          name: profile.name || '',
          email: profile.email || '',
          bio: profile.bio || '',
          avatar: profile.avatar || ''
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('zypher_token');
    if (!token) return;

    setSaving(true);
    setMessage(null);
    try {
      await updateUserProfile(token, formData);
      setMessage({ text: 'Profile updated successfully', type: 'success' });
      playSuccess();
      // Refresh local user state
      const updatedUser = await fetchUserProfile(token);
      setUser(updatedUser);
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to update profile', type: 'error' });
      playError();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-zypher-bg flex flex-col items-center justify-center space-y-6">
      <motion.div 
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-16 h-16 border-4 border-blue-500/10 border-t-blue-500 rounded-full" 
      />
      <div className="text-[10px] font-black text-blue-600 dark:text-blue-400/60 uppercase tracking-[0.5em] animate-pulse">Initializing Identity_Core</div>
    </div>
  );

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white dark:bg-zypher-bg text-slate-900 dark:text-slate-200 transition-colors duration-300">
        <div className="fixed inset-0 blueprint-bg opacity-[0.03] dark:opacity-10 pointer-events-none" />
        <Navbar />

        <main className="relative z-10 container mx-auto px-6 py-12 max-w-4xl">
          <header className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-500/20">Identity_Management</span>
              <div className="h-[1px] flex-1 bg-slate-200 dark:bg-white/5" />
            </div>
            <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-4">User Profile_</h1>
            <p className="text-slate-500 font-medium tracking-tight">Configure your sovereign identity and protocol metadata.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Left: Avatar & Status */}
            <div className="space-y-8">
              <div className="p-8 rounded-[3rem] glass border-slate-200 dark:border-white/5 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500/20 bg-slate-100 dark:bg-black/40">
                    <img 
                      src={formData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${wallet.address}`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white dark:border-zypher-bg" />
                </div>
                
                <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-6 truncate w-full px-4">
                  {wallet.address}
                </div>

                <div className="space-y-4 w-full">
                  <div className="flex justify-between items-center px-4 py-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-transparent">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Role</span>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">{user?.accountType || 'Guest'}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-transparent">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tier</span>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">{user?.tier || 'Free'}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-transparent">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">SLA</span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">ACTIVE_99.9</span>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-[3rem] glass border-slate-200 dark:border-white/5">
                <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-6">Protocol Usage</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-900 dark:text-white mb-2 uppercase">
                      <span>Monthly Quota</span>
                      <span>{user?.proofsUsedThisMonth || 0} / 1,000</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(((user?.proofsUsedThisMonth || 0) / 1000) * 100, 100)}%` }}
                        className="h-full bg-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-900 dark:text-white mb-2 uppercase">
                      <span>Credit Balance</span>
                      <span>{user?.creditsBalance || 0} ZYP</span>
                    </div>
                    <button 
                      onClick={() => router.push('/billing')}
                      onMouseEnter={playHover}
                      className="w-full py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-transparent"
                    >
                      Refill Treasury
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="md:col-span-2">
              <form onSubmit={handleSave} className="p-12 rounded-[3.5rem] glass border-slate-200 dark:border-white/5 space-y-10">
                <AnimatePresence>
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`p-4 rounded-2xl border text-xs font-bold uppercase tracking-widest ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'}`}
                    >
                      {message.text}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Identity Name</label>
                    <input 
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Satoshi Nakamoto"
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Secure Email</label>
                    <input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@protocol.com"
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Identity Bio</label>
                  <textarea 
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Describe your protocol operations..."
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Avatar Endpoint (URL)</label>
                  <input 
                    type="text"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700"
                  />
                </div>

                <div className="pt-6">
                  <button 
                    type="submit"
                    disabled={saving}
                    onMouseEnter={playHover}
                    onClick={() => playClick()}
                    className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:transform-none"
                  >
                    {saving ? 'SYNCHRONIZING...' : 'Commit Changes_'}
                  </button>
                </div>
              </form>

              {/* Security Actions */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="p-8 rounded-[2.5rem] glass border-slate-200 dark:border-white/5 flex items-center justify-between group">
                    <div>
                      <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">DID Verification</div>
                      <div className="text-[9px] text-slate-500 uppercase font-bold">Unlink or rotate DID</div>
                    </div>
                    <button className="px-5 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-transparent rounded-xl text-[9px] font-black uppercase text-slate-500 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 group-hover:text-white transition-all">Verify</button>
                 </div>
                 <div className="p-8 rounded-[2.5rem] glass border-slate-200 dark:border-white/5 flex items-center justify-between group">
                    <div>
                      <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">API Access</div>
                      <div className="text-[9px] text-slate-500 uppercase font-bold">Revoke all sessions</div>
                    </div>
                    <button className="px-5 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-transparent rounded-xl text-[9px] font-black uppercase text-red-600 dark:text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all">Revoke</button>
                 </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
