import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
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
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
            <img src="/logo.png" alt="Zypherion Logo" className="w-full h-full object-cover" />
          </div>
        <span className="text-base font-bold tracking-[0.1em] text-slate-900 dark:text-white group-hover:text-blue-400 transition-colors">
            ZYPHERION
          </span>
        </Link>
        
        <div className="hidden lg:flex gap-8 text-[10px] font-bold uppercase tracking-wider italic">
          <Link 
            href={getDashboardLink()} 
            className={`transition-colors ${router.pathname.includes('dashboard') || router.pathname === getDashboardLink() ? 'text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Dashboard_
          </Link>

          {wallet.accountType === 'Developer' && (
            <Link 
              href="/developer" 
              className={`transition-colors ${router.pathname === '/developer' ? 'text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Architect_
            </Link>
          )}

          {wallet.accountType === 'NodeOperator' && (
            <Link 
              href="/node-operator" 
              className={`transition-colors ${router.pathname === '/node-operator' ? 'text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Telemetry_
            </Link>
          )}

          {wallet.role === 'admin' && (
            <Link 
              href="/admin" 
              className={`transition-colors ${router.pathname === '/admin' ? 'text-red-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Overseer_
            </Link>
          )}

          {wallet.address && (
            <Link 
              href={wallet.role === 'admin' ? '/admin?tab=treasury' : '/billing'} 
              className={`transition-colors ${(router.pathname === '/billing' || (router.pathname === '/admin' && router.query.tab === 'treasury')) ? 'text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Treasury_
            </Link>
          )}

          <Link 
            href="/docs" 
            className={`transition-colors ${router.pathname.startsWith('/docs') ? 'text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            SDK_Docs
          </Link>

          <a 
            href="https://forms.gle/zypherion-feedback-demo" 
            target="_blank" 
            rel="noreferrer"
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
          >
            Feedback_
          </a>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
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
        
        {wallet.address && (
          <Link 
            href="/profile" 
            className={`p-2 rounded-full border transition-all ${router.pathname === '/profile' ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
            title="Sovereign Identity Profile"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
        )}

        {wallet.address && (
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
        )}

        {/* Testnet Badge / Wrong Network Warning */}
        {wallet.address ? (
          <span
            title="Connected to Stellar Soroban Testnet — not mainnet"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400"
          >
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Soroban Testnet
          </span>
        ) : (
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            Not Connected
          </span>
        )}

        {/* Connect / Disconnect Button + helper text */}
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={wallet.address ? disconnect : handleConnect}
            className={`px-6 py-2 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center gap-2 ${
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
            ) : wallet.address ? (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            )}
            {wallet.status === 'connecting'
              ? 'Connecting...'
              : wallet.address
              ? (
                <div className="flex items-center gap-2">
                  <span>{wallet.address.slice(0, 4)}..{wallet.address.slice(-4)}</span>
                  <div 
                    onClick={(e) => { e.stopPropagation(); copyAddress(); }}
                    className="p-1 hover:bg-white/20 rounded transition-all active:scale-90"
                    title="Copy Address"
                  >
                    {copiedAddr ? (
                      <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-3 h-3 opacity-60 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    )}
                  </div>
                </div>
              )
              : walletError
              ? 'Retry Connection'
              : 'Connect Wallet'}
          </button>

          {/* Helper / error text */}
          {walletError && (
            <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">
              Connection failed — try again
            </span>
          )}
          {!wallet.address && !walletError && wallet.status !== 'connecting' && (
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider hidden sm:block">
              Connect wallet to continue
            </span>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
