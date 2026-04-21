import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import AuthGuard from '../components/AuthGuard';

export default function DeveloperDashboard() {
  const [apiKey, setApiKey] = useState('ZYPH-TEST-9F8A-XXXX-XXXX');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhooks, setWebhooks] = useState([
    { id: '1', url: 'https://myapp.com/api/zypherion-webhook', events: ['EXECUTION_COMPLETED'] }
  ]);

  const handleRegisterWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl) return;
    setWebhooks([...webhooks, { id: Date.now().toString(), url: webhookUrl, events: ['EXECUTION_COMPLETED'] }]);
    setWebhookUrl('');
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-zypher-bg text-slate-200">
        <div className="fixed inset-0 blueprint-bg opacity-20 pointer-events-none" />
        <Navbar />

        <main className="relative z-10 container mx-auto px-6 py-12">
          
          <header className="mb-12 border-b border-white/5 pb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-500/20">SDK_ACCESS_GRANTED</span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter mb-4">Developer Portal_</h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Manage your API keys, configure webhooks, and integrate the Zypherion SDK directly into your infrastructure.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* API Keys */}
            <section className="lg:col-span-2 space-y-8">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-[2.5rem] glass border-white/5">
                <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4v-4l5.613-5.613C9.4 10.743 9.4 9 11 9c1.6 0 3.2.4 4.5.8L15 7z" /></svg>
                  API Credentials
                </h3>
                <div className="bg-black/30 p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Sandbox Key</div>
                    <div className="font-mono text-emerald-400 tracking-wider text-sm">{apiKey}</div>
                  </div>
                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Regenerate</button>
                </div>
              </motion.div>

              {/* Webhooks */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-8 rounded-[2.5rem] glass border-white/5">
                <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Webhook Endpoints
                </h3>
                
                <form onSubmit={handleRegisterWebhook} className="flex gap-4 mb-8">
                  <input 
                    type="url" 
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://your-domain.com/webhook" 
                    className="flex-1 bg-black/30 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <button type="submit" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all">Register</button>
                </form>

                <div className="space-y-4">
                  {webhooks.map(wh => (
                    <div key={wh.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                      <div className="font-mono text-xs text-slate-300">{wh.url}</div>
                      <div className="flex gap-2">
                        {wh.events.map(ev => (
                          <span key={ev} className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded text-[9px] font-black uppercase">{ev}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </section>

            {/* Quick Links & Docs */}
            <aside className="space-y-8">
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="p-8 rounded-[2.5rem] glass-blue border-white/5">
                <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-6">Developer Resources</h3>
                <div className="space-y-4">
                  <a href="http://localhost:5001/api-docs" target="_blank" rel="noreferrer" className="block p-4 bg-black/20 hover:bg-black/40 border border-white/5 rounded-2xl transition-all group">
                    <div className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-1 group-hover:text-blue-300">Swagger UI</div>
                    <div className="text-xs text-slate-500">Interactive API documentation</div>
                  </a>
                  <a href="https://github.com/Pritam9078/ZYPHERION" target="_blank" rel="noreferrer" className="block p-4 bg-black/20 hover:bg-black/40 border border-white/5 rounded-2xl transition-all group">
                    <div className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-1 group-hover:text-blue-300">NPM Package</div>
                    <div className="text-xs text-slate-500">zypherion-sdk (TypeScript)</div>
                  </a>
                  <div className="p-4 bg-black/20 border border-white/5 rounded-2xl mt-8">
                    <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-2 font-black">Installation</div>
                    <code className="text-xs text-emerald-400 bg-black p-2 rounded block font-mono">npm install zypherion-sdk</code>
                  </div>
                </div>
              </motion.div>
            </aside>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
