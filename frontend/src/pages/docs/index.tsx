import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ThreeDBackground from '../../components/ThreeDBackground';
import Navbar from '../../components/Navbar';

const TechnicalDocs = () => {
  const sections = [
    { id: 'architecture', title: 'Network Architecture', icon: '🏛️' },
    { id: 'zk-proofs', title: 'ZK-Proof Systems', icon: '🧩' },
    { id: 'soroban', title: 'Soroban Contracts', icon: '📜' },
    { id: 'topology', title: 'Network Topology', icon: '🌐' },
    { id: 'security', title: 'Security & Audits', icon: '🛡️' },
  ];

  const coreConcepts = [
    {
      title: 'State Attestation',
      desc: 'How Zypherion verifies off-chain events and commits them to the Stellar ledger with absolute cryptographic certainty.',
      tag: 'CORE'
    },
    {
      title: 'Predicate Logic',
      desc: 'The domain-specific language used to define cross-chain automation rules and event triggers.',
      tag: 'LOGIC'
    },
    {
      title: 'Decentralized Oracles',
      desc: 'A network of verifier nodes that ingestion and validate external data using multi-party computation.',
      tag: 'NETWORK'
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30 overflow-x-hidden">
      <Head>
        <title>Technical Documentation | Zypherion Protocol</title>
        <meta name="description" content="Deep dive into the technical specifications, ZK architecture, and Soroban integration of the Zypherion Protocol." />
      </Head>

      <ThreeDBackground />
      <Navbar />

      <main className="pt-32 pb-20 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-16">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block space-y-12 sticky top-32 h-fit">
          <div className="space-y-8">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">Protocol_Specs</h4>
              <ul className="space-y-1">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all group">
                      <span className="text-lg grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all">{s.icon}</span>
                      <span className="text-xs font-bold text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all">{s.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">Resources</h4>
              <ul className="space-y-1">
                <li>
                  <Link href="/docs/sdk" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-blue-500/10 transition-all group border border-transparent hover:border-blue-500/20">
                    <span className="text-lg">📦</span>
                    <span className="text-xs font-bold text-blue-400 group-hover:text-blue-300">TypeScript SDK</span>
                  </Link>
                </li>
                <li>
                  <a href="https://github.com/Pritam9078/ZYPHERION" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all group">
                    <span className="text-lg">🐙</span>
                    <span className="text-xs font-bold text-slate-400 group-hover:text-white">GitHub Repository</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="p-8 rounded-[2rem] bg-gradient-to-br from-blue-600/10 to-indigo-600/5 border border-blue-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <h5 className="text-[10px] font-bold text-blue-400 uppercase mb-3 tracking-wider">Whitepaper_v1.2</h5>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-6">Explore the full mathematical foundations of Zypherion's ZK-Attestation model.</p>
            <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-bold text-white uppercase tracking-wider transition-all border border-white/10">Download PDF</button>
          </div>
        </aside>

        {/* Documentation Content */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-24"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Technical Specification v0.9.4
            </div>
            <h1 className="text-7xl font-bold text-white tracking-tighter mb-8 leading-[0.85] uppercase">
              Technical<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">Documentation_</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-3xl">
              Zypherion is a sovereign automation protocol built on the Stellar Network, utilizing Zero-Knowledge proofs to synchronize off-chain logic with on-chain state execution.
            </p>
          </motion.div>

          {/* Quick Concept Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
            {coreConcepts.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                className="p-8 rounded-[2rem] glass border border-white/5 hover:border-blue-500/30 transition-all group"
              >
                <div className="text-[9px] font-bold text-blue-500 mb-3 tracking-[0.2em]">{c.tag}</div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{c.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Architecture Section */}
          <section id="architecture" className="scroll-mt-32 mb-32">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-2xl">🏛️</div>
              <h2 className="text-4xl font-bold text-white tracking-tight uppercase">Network Architecture_</h2>
            </div>
            
            <div className="prose prose-invert max-w-none space-y-8">
              <p className="text-lg text-slate-400 leading-relaxed">
                The protocol operates as a decentralized verification layer. When a cross-chain event occurs (e.g., a transaction on Ethereum or a price change via an oracle), Zypherion verifiers capture the state and generate a cryptographic attestation.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
                <div className="space-y-6">
                  <h4 className="text-white font-bold text-xl">The Sovereign Link</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    A proprietary communication bridge that uses <strong>Curve25519</strong> signatures to authenticate telemetry data before it enters the ZK Prover pipeline.
                  </p>
                  <ul className="space-y-3 text-sm text-slate-500">
                    <li className="flex items-start gap-3"><span className="text-blue-500">→</span> Millisecond latency for event capture</li>
                    <li className="flex items-start gap-3"><span className="text-blue-500">→</span> Multi-sig consensus for validator ingress</li>
                    <li className="flex items-start gap-3"><span className="text-blue-500">→</span> End-to-end encrypted telemetry streams</li>
                  </ul>
                </div>
                <div className="aspect-video bg-blue-600/5 border border-white/5 rounded-3xl p-8 flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 animate-pulse" />
                  <div className="relative z-10 text-center">
                    <div className="text-[10px] font-bold text-blue-400 mb-2 tracking-wider uppercase">Visualizer_01</div>
                    <div className="text-white font-bold text-2xl uppercase tracking-tighter italic">L2_Verification_Flow</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ZK Proofs Section */}
          <section id="zk-proofs" className="scroll-mt-32 mb-32">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-2xl">🧩</div>
              <h2 className="text-4xl font-bold text-white tracking-tight uppercase">ZK-Proof Systems_</h2>
            </div>
            
            <p className="text-lg text-slate-400 leading-relaxed mb-12">
              Zypherion leverages <strong>Groth16</strong> Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge (zk-SNARKs) to prove that logic rules were executed correctly without exposing the underlying private data.
            </p>

            <div className="bg-black/60 rounded-[2.5rem] p-10 border border-white/5 relative group">
              <div className="absolute top-6 right-8 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Protocol Pipeline</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { step: 'Circom Circuits', desc: 'Logic is compiled into arithmetic circuits that define protocol constraints.' },
                  { step: 'Witness Generation', desc: 'Private inputs are transformed into a verifiable witness object.' },
                  { step: 'Verification Key', desc: 'A compact 300-byte key is stored on Soroban to verify infinite proofs.' }
                ].map((p, i) => (
                  <div key={i} className="space-y-4">
                    <div className="text-2xl font-bold text-white/20">{i+1}</div>
                    <h5 className="font-bold text-white uppercase text-sm tracking-tight">{p.step}</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Soroban Contracts */}
          <section id="soroban" className="scroll-mt-32 mb-32">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-2xl">📜</div>
              <h2 className="text-4xl font-bold text-white tracking-tight uppercase">Soroban Smart Contracts_</h2>
            </div>
            
            <p className="text-lg text-slate-400 leading-relaxed mb-12">
              Our core logic is enforced by Rust-based Soroban smart contracts. These contracts act as the "Source of Truth" for all automated state changes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { name: 'zypher_registry.rs', desc: 'Handles the immutable registration of logic rules and ZK verification keys.' },
                { name: 'zypher_escrow.rs', desc: 'Manages gas abstraction and credit deposits via a secure vault system.' },
                { name: 'zypher_prover.rs', desc: 'The on-chain verification engine that validates Groth16 proofs in &lt;100ms.' },
                { name: 'zypher_telemetry.rs', desc: 'Indexes all protocol events for real-time telemetry synchronization.' }
              ].map((c, i) => (
                <div key={i} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 transition-all flex items-start gap-6 group">
                   <div className="w-1.5 h-10 bg-emerald-500/20 rounded-full group-hover:bg-emerald-500 transition-colors" />
                   <div>
                     <h4 className="font-mono text-emerald-400 font-bold mb-2">{c.name}</h4>
                     <p className="text-xs text-slate-500 leading-relaxed">{c.desc}</p>
                   </div>
                </div>
              ))}
            </div>
          </section>

          {/* Topology */}
          <section id="topology" className="scroll-mt-32 mb-32">
             <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 rounded-2xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-2xl">🌐</div>
              <h2 className="text-4xl font-bold text-white tracking-tight uppercase">Network Topology_</h2>
            </div>
            <div className="p-12 glass rounded-[3rem] border border-white/5 relative overflow-hidden">
               <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full" />
               <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight">The Decentralized Edge</h3>
                    <p className="text-sm text-slate-400 leading-relaxed mb-8">
                      Zypherion utilizes a globally distributed network of "Edge Verifiers" that sit closer to the data sources (Exchanges, Blockchains, IoT Gateways).
                    </p>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500">
                          <span>Nodes Online</span>
                          <span className="text-blue-400">1,248</span>
                       </div>
                       <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: '85%' }}
                            className="h-full bg-blue-500"
                          />
                       </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-white font-bold uppercase text-[10px] tracking-wider">Global Status</h4>
                    <ul className="space-y-4">
                       {[
                         { loc: 'NA-East-1 (NY)', status: 'Optimal', ping: '12ms' },
                         { loc: 'EU-West-2 (LDN)', status: 'Optimal', ping: '18ms' },
                         { loc: 'AS-East-1 (TKO)', status: 'Nominal', ping: '42ms' }
                       ].map((n, idx) => (
                         <li key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                            <span className="text-xs font-bold text-slate-300">{n.loc}</span>
                            <div className="flex items-center gap-4">
                               <span className="text-[10px] font-bold text-blue-500 uppercase">{n.status}</span>
                               <span className="text-[10px] font-mono text-slate-600">{n.ping}</span>
                            </div>
                         </li>
                       ))}
                    </ul>
                  </div>
               </div>
            </div>
          </section>
        </div>
      </main>

      {/* Final Call to Action */}
      <section className="border-t border-white/[0.05] py-32 text-center mt-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-white mb-6 uppercase tracking-tight">Ready to Deploy Sovereignty?_</h2>
          <p className="text-slate-400 mb-10 leading-relaxed font-medium">Step into the future of decentralized automation. Connect your wallet and initialize your first cross-chain logic rule in under 5 minutes.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Link href="/dashboard" className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-[10px] uppercase tracking-wider transition-all shadow-xl shadow-blue-500/20">Protocol Dashboard</Link>
             <Link href="/docs/sdk" className="px-10 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold text-[10px] uppercase tracking-wider transition-all border border-white/10">Read SDK Guide</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.05] py-16 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
        &copy; 2026 Zypherion Research_ // Distributed under the Sovereign License_
      </footer>
    </div>
  );
};

export default TechnicalDocs;
