import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ThreeDBackground from '../../components/ThreeDBackground';

const SdkDocs = () => {
  const sections = [
    { id: 'install', title: 'Installation', icon: '📦' },
    { id: 'quickstart', title: 'Quick Start', icon: '⚡' },
    { id: 'auth', title: 'Authentication', icon: '🔐' },
    { id: 'rules', title: 'Logic Rules', icon: '⚙️' },
    { id: 'proofs', title: 'ZK Proofs', icon: '♾️' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30">
      <Head>
        <title>SDK Documentation | Zypherion Protocol</title>
        <meta name="description" content="Integrate the Zypherion Protocol into your dApp with our lightweight, sovereign TypeScript SDK." />
      </Head>

      <ThreeDBackground />

      {/* Glass Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05] bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white text-xl group-hover:rotate-12 transition-transform">⬡</div>
            <span className="font-black tracking-tight text-xl uppercase">Zypherion<span className="text-blue-500">_SDK</span></span>
          </Link>
          <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-wider">
            <a href="https://github.com/Pritam9078/ZYPHERION" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">GitHub</a>
            <Link href="/" className="px-5 py-2.5 bg-white text-slate-950 rounded-lg hover:bg-blue-500 hover:text-white transition-all">Protocol Home</Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-16">
        {/* Sidebar */}
        <aside className="hidden lg:block space-y-8 sticky top-32 h-fit">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 mb-4">Documentation_</h4>
            <ul className="space-y-2">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                    <span className="text-lg grayscale group-hover:grayscale-0 transition-all">{s.icon}</span>
                    <span className="text-xs font-bold text-slate-400 group-hover:text-white">{s.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10">
            <h5 className="text-[10px] font-black text-blue-400 uppercase mb-2">Need Help?</h5>
            <p className="text-[10px] text-slate-500 leading-relaxed mb-4">Our engineers are available 24/7 on the developer discord for integration support.</p>
            <button className="text-[10px] font-black text-white uppercase underline decoration-blue-500/50 hover:decoration-blue-500 transition-all">Join Discord</button>
          </div>
        </aside>

        {/* Content */}
        <article className="space-y-24">
          {/* Hero */}
          <section>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl font-black text-white tracking-tight mb-6 uppercase"
            >
              Integrate_Sovereignty.
            </motion.h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
              The Zypherion SDK is a lightweight, zero-dependency TypeScript library designed to embed trustless cross-chain automation directly into your application frontend or backend.
            </p>
          </section>

          {/* Installation */}
          <section id="install" className="scroll-mt-32">
            <h2 className="text-3xl font-black text-white mb-8 tracking-tight">01. Installation_</h2>
            <div className="bg-black/40 rounded-3xl p-8 border border-white/5 relative group">
              <div className="absolute top-4 right-6 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Bash</div>
              <pre className="font-mono text-sm overflow-x-auto text-blue-300">
                <code>npm install @zypherion/sdk</code>
              </pre>
              <button className="absolute bottom-4 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
              </button>
            </div>
          </section>

          {/* Quick Start */}
          <section id="quickstart" className="scroll-mt-32">
            <h2 className="text-3xl font-black text-white mb-8 tracking-tight">02. Quick Start_</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">Initialize the client with your Sandbox API key (found in the Developer Dashboard) and start orchestrating logic rules in minutes.</p>
            <div className="bg-black/40 rounded-3xl p-8 border border-white/5 relative overflow-hidden">
              <div className="absolute top-4 right-6 text-[10px] font-mono text-slate-500 uppercase tracking-widest">TypeScript</div>
              <pre className="font-mono text-sm leading-relaxed overflow-x-auto">
                <code>
                  <span className="text-purple-400">import</span> {'{ ZypherionSDK }'} <span className="text-purple-400">from</span> <span className="text-emerald-400">'@zypherion/sdk'</span>;<br /><br />
                  <span className="text-slate-500">// 1. Initialize Client</span><br />
                  <span className="text-purple-400">const</span> sdk = <span className="text-purple-400">new</span> <span className="text-blue-400">ZypherionSDK</span>({'{'}<br />
                  &nbsp;&nbsp;network: <span className="text-emerald-400">'sandbox'</span>,<br />
                  &nbsp;&nbsp;apiKey: <span className="text-emerald-400">'ZYPH-TEST-9F8A-XXXX'</span><br />
                  {'}'});<br /><br />
                  <span className="text-slate-500">// 2. Execute a Rule</span><br />
                  <span className="text-purple-400">const</span> result = <span className="text-purple-400">await</span> sdk.rules.<span className="text-blue-400">execute</span>(<span className="text-emerald-400">'rule_id_123'</span>);<br />
                  <span className="text-blue-400">console</span>.<span className="text-blue-400">log</span>(<span className="text-emerald-400">`Status: $</span>{'{result.status}'}<span className="text-emerald-400">`</span>);
                </code>
              </pre>
            </div>
          </section>

          {/* Authentication */}
          <section id="auth" className="scroll-mt-32">
            <h2 className="text-3xl font-black text-white mb-8 tracking-tight">03. Authentication_</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                <h3 className="text-xl font-bold text-white mb-4">API Key Access</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Ideal for server-to-server communication. Use your static developer credentials to bypass signature prompts for background workers.</p>
              </div>
              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                <h3 className="text-xl font-bold text-white mb-4">Wallet Signing</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Used for client-side actions. The SDK integrates seamlessly with the <strong>Freighter Wallet</strong> to sign protocol-level intents.</p>
              </div>
            </div>
          </section>

          {/* Logic Rules */}
          <section id="rules" className="scroll-mt-32">
            <h2 className="text-3xl font-black text-white mb-8 tracking-tight">04. Logic Rules_</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">Define predicates that trigger cross-chain actions. Rules are stored as immutable state objects and can be activated by verified network events.</p>
            <div className="bg-black/40 rounded-3xl p-8 border border-white/5 relative overflow-hidden">
              <div className="absolute top-4 right-6 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Example</div>
              <pre className="font-mono text-sm leading-relaxed overflow-x-auto">
                <code>
                  <span className="text-purple-400">await</span> sdk.rules.<span className="text-blue-400">deploy</span>({'{'}<br />
                  &nbsp;&nbsp;name: <span className="text-emerald-400">'PriceLiquidation'</span>,<br />
                  &nbsp;&nbsp;predicate: <span className="text-emerald-400">'XLM_PRICE &lt; 0.12'</span>,<br />
                  &nbsp;&nbsp;action: <span className="text-emerald-400">'EXECUTE_ORDER'</span><br />
                  {'}'});
                </code>
              </pre>
            </div>
          </section>

          {/* ZK Proofs */}
          <section id="proofs" className="scroll-mt-32">
            <h2 className="text-3xl font-black text-white mb-8 tracking-tight">05. ZK Proofs_</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">Zypherion uses Groth16 proofs to ensure that off-chain computations are verifiably correct without revealing sensitive data.</p>
            <div className="bg-black/40 rounded-3xl p-8 border border-white/5 relative overflow-hidden">
              <div className="absolute top-4 right-6 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Verification</div>
              <pre className="font-mono text-sm leading-relaxed overflow-x-auto">
                <code>
                  <span className="text-purple-400">const</span> isValid = <span className="text-purple-400">await</span> sdk.proofs.<span className="text-blue-400">verify</span>(proofId);<br />
                  <span className="text-purple-400">if</span> (isValid) {'{'}<br />
                  &nbsp;&nbsp;<span className="text-blue-400">console</span>.<span className="text-blue-400">log</span>(<span className="text-emerald-400">'Proof cryptographically verified.'</span>);<br />
                  {'}'}
                </code>
              </pre>
            </div>
          </section>

          {/* API Reference */}
          <section className="pt-20 border-t border-white/5">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-12">Core_Module_Reference</h2>
            <div className="space-y-12">
              {[
                { name: 'sdk.auth.handshake()', desc: 'Initiate a cryptographic signature request for user login.' },
                { name: 'sdk.rules.deploy(params)', desc: 'Deploy a new cross-chain logic rule with ZK constraints.' },
                { name: 'sdk.proofs.verify(id)', desc: 'Verify a generated Groth16 proof against the on-chain registry.' },
                { name: 'sdk.telemetry.getStream()', desc: 'Open a real-time WebSocket connection for protocol events.' },
              ].map((m) => (
                <div key={m.name} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-3xl hover:bg-white/[0.02] transition-all border border-transparent hover:border-white/5">
                  <code className="text-blue-400 font-bold text-lg">{m.name}</code>
                  <p className="text-sm text-slate-500">{m.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-16 text-center mt-40">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 mb-4">Built with conviction for the Stellar Ecosystem</p>
        <div className="flex justify-center gap-8 text-[10px] font-bold text-slate-500 uppercase">
          <Link href="/" className="hover:text-blue-500 transition-colors">Home</Link>
          <a href="#" className="hover:text-blue-500 transition-colors">Stellar Docs</a>
          <a href="#" className="hover:text-blue-500 transition-colors">Security</a>
        </div>
      </footer>
    </div>
  );
};

export default SdkDocs;
