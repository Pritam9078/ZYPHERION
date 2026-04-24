import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useWallet } from '../hooks/useWallet';
import { toggleGlobalMute, getGlobalIsMuted } from '../hooks/useSound';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const router = useRouter();
  const { wallet, connect, disconnect } = useWallet();
  const { theme, toggleTheme } = useTheme();
  const [isMuted, setIsMuted] = React.useState(false);
  const [copiedAddr, setCopiedAddr] = React.useState(false);
  const [walletError, setWalletError] = React.useState(false);

  const handleConnect = async () => {
    setWalletError(false);
    try {
      await connect();
    } catch {
      setWalletError(true);
    }
  };

  const copyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
    }
  };

  React.useEffect(() => {
    setIsMuted(getGlobalIsMuted());
    const handleMuteChange = () => setIsMuted(getGlobalIsMuted());
    window.addEventListener('zypher_mute_toggled', handleMuteChange);
    return () => window.removeEventListener('zypher_mute_toggled', handleMuteChange);
  }, []);

  const getDashboardLink = () => {
    // Dashboard_ now always points to the Global Overview (Observer Mode) for all roles
    // to differentiate it from role-specific functional dashboards like Architect or Overseer.
    return '/guest';
  };

  return (
    <nav className="px-8 py-4 flex justify-between items-center border-b border-white/[0.05] dark:border-white/[0.05] bg-white/80 dark:bg-zypher-bg/80 backdrop-blur-xl sticky top-0 z-40 transition-colors duration-300">
      <div className="flex items-center gap-12">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center glass-glow bg-blue-600/10 group-hover:rotate-6 transition-transform">
            <img src="/logo.png" alt="Zypherion Logo" className="w-6 h-6 object-contain" />
          </div>
        <span className="text-base font-bold tracking-[0.1em] text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
            ZYPHERION<span className="text-blue-500">_</span>
          </span>
        </Link>
        
        <div className="hidden lg:flex gap-8 text-[11px] font-bold uppercase tracking-wider">
          <Link 
            href={getDashboardLink()} 
            className={`transition-all relative py-1 ${router.pathname.includes('dashboard') || router.pathname === getDashboardLink() ? 'text-blue-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Dashboard_
            {(router.pathname.includes('dashboard') || router.pathname === getDashboardLink()) && <motion.div layoutId="nav-active" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />}
          </Link>

          {wallet.accountType === 'Developer' && (
            <Link 
              href="/developer" 
              className={`transition-all relative py-1 ${router.pathname === '/developer' ? 'text-blue-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Architect_
              {router.pathname === '/developer' && <motion.div layoutId="nav-active" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />}
            </Link>
          )}

          {wallet.accountType === 'NodeOperator' && (
            <Link 
              href="/node-operator" 
              className={`transition-all relative py-1 ${router.pathname === '/node-operator' ? 'text-blue-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Telemetry_
              {router.pathname === '/node-operator' && <motion.div layoutId="nav-active" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />}
            </Link>
          )}

          {wallet.role === 'admin' && (
            <Link 
              href="/admin" 
              className={`transition-all relative py-1 ${router.pathname === '/admin' ? 'text-red-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Overseer_
              {router.pathname === '/admin' && <motion.div layoutId="nav-active" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />}
            </Link>
          )}

          {wallet.address && (
            <Link 
              href={wallet.role === 'admin' ? '/admin?tab=treasury' : '/billing'} 
              className={`transition-all relative py-1 ${(router.pathname === '/billing' || (router.pathname === '/admin' && router.query.tab === 'treasury')) ? 'text-blue-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Treasury_
              {(router.pathname === '/billing' || (router.pathname === '/admin' && router.query.tab === 'treasury')) && <motion.div layoutId="nav-active" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />}
            </Link>
          )}

          <Link 
            href="/docs" 
            className={`transition-all relative py-1 ${router.pathname.startsWith('/docs') ? 'text-blue-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            SDK_Docs_
            {router.pathname.startsWith('/docs') && <motion.div layoutId="nav-active" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />}
          </Link>

          <Link 
            href="/feedback" 
            className={`transition-all relative py-1 ${router.pathname === '/feedback' ? 'text-emerald-500' : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-500'}`}
          >
            Feedback_
            {router.pathname === '/feedback' && <motion.div layoutId="nav-active" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />}
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4 h-full">
        <div className="flex items-center gap-2 pr-4 border-r border-slate-200 dark:border-white/10">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 18v1m9-9h-1M3 12H2m3.343-5.657l-.707-.707m12.728 12.728l-.707-.707M6.343 17.657l-.707.707M17.657 6.343l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => toggleGlobalMute()}
            className="p-2 rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            title={isMuted ? "Unmute sounds" : "Mute sounds"}
          >
            {isMuted ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5z" /></svg>
            )}
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          {wallet.address && (
            <div className="flex items-center gap-2">
              <Link 
                href="/profile" 
                className={`p-2 rounded-full border transition-all ${router.pathname === '/profile' ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
                title="Sovereign Identity Profile"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>

              <button
                onClick={copyAddress}
                className="p-2 rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400"
                title={copiedAddr ? 'Copied!' : 'Copy wallet address'}
              >
                {copiedAddr ? (
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                )}
              </button>
            </div>
          )}

          {wallet.address ? (
            <span
              title="Connected to Stellar Soroban Testnet"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400"
            >
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Testnet
            </span>
          ) : (
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              Offline
            </span>
          )}

          <button
            onClick={wallet.address ? disconnect : handleConnect}
            className={`px-6 py-2 text-white rounded-full text-[10px] font-bold uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center gap-2 ${
              walletError
                ? 'bg-red-600 hover:bg-red-500 shadow-red-600/20'
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
            }`}
          >
            {wallet.status === 'connecting' ? (
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            )}
            {wallet.status === 'connecting'
              ? 'Connecting...'
              : wallet.address
              ? `${wallet.address.slice(0, 4)}..${wallet.address.slice(-4)}`
              : walletError
              ? 'Retry'
              : 'Connect Wallet'}
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
