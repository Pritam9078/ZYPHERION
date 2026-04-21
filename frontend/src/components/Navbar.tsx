import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useWallet } from '../hooks/useWallet';

const Navbar = () => {
  const router = useRouter();
  const { wallet, connect, disconnect } = useWallet();

  return (
    <nav className="px-8 py-4 flex justify-between items-center border-b border-white/[0.05] bg-zypher-bg/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center gap-12">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 border border-blue-500 rounded-lg rotate-45 flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
            <span className="-rotate-45 font-bold text-xs">Z</span>
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
          <Link 
            href="/developer" 
            className={`transition-colors ${router.pathname === '/developer' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
          >
            Developer
          </Link>
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
          onClick={wallet.address ? disconnect : connect}
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
