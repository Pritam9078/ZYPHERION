import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useWallet } from '../hooks/useWallet';
import { toggleGlobalMute, getGlobalIsMuted } from '../hooks/useSound';

const Navbar = () => {
  const router = useRouter();
  const { wallet, connect, disconnect } = useWallet();
  const [isMuted, setIsMuted] = React.useState(false);

  React.useEffect(() => {
    setIsMuted(getGlobalIsMuted());
    const handleMuteChange = () => setIsMuted(getGlobalIsMuted());
    window.addEventListener('zypher_mute_toggled', handleMuteChange);
    return () => window.removeEventListener('zypher_mute_toggled', handleMuteChange);
  }, []);

  return (
    <nav className="px-8 py-4 flex justify-between items-center border-b border-white/[0.05] bg-zypher-bg/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center gap-12">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
            <img src="/logo.png" alt="Zypherion Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-lg font-bold tracking-widest text-white group-hover:text-blue-400 transition-colors">
            ZYPHERION
          </span>
        </Link>
        
        <div className="hidden lg:flex gap-8 text-[11px] font-semibold uppercase tracking-wider">
          <Link 
            href="/dashboard" 
            className={`transition-colors ${router.pathname === '/dashboard' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
          >
            Dashboard
          </Link>
          {wallet.accountType === 'NodeOperator' && (
            <Link 
              href="/node-operator" 
              className={`transition-colors ${router.pathname === '/node-operator' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
            >
              Node_Monitor
            </Link>
          )}
          <Link 
            href="/developer" 
            className={`transition-colors ${router.pathname === '/developer' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
          >
            Developer
          </Link>
          {wallet.address && (
            <>
              <Link 
                href="/billing" 
                className={`transition-colors ${router.pathname === '/billing' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
              >
                Billing
              </Link>
            </>
          )}
          {wallet.role === 'admin' && (
            <Link 
              href="/admin" 
              className={`transition-colors ${router.pathname === '/admin' ? 'text-red-400' : 'text-slate-400 hover:text-white'}`}
            >
              Admin_Panel
            </Link>
          )}
          <a href="#" className="text-slate-400 hover:text-white transition-colors">Documentation</a>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => toggleGlobalMute()}
          className="p-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
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
            className={`p-2 rounded-full border transition-all ${router.pathname === '/profile' ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'}`}
            title="Sovereign Identity Profile"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
        )}

        <button 
          onClick={wallet.address ? disconnect : () => connect()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          {wallet.status === 'connecting' ? 'AUTHENTICATING...' : 
           wallet.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : 
           'Connect Wallet'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
