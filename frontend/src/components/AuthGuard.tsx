import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '../hooks/useWallet';
import { motion } from 'framer-motion';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAdmin = false }) => {
  const { wallet } = useWallet();
  const router = useRouter();

  useEffect(() => {
    // Only check if we are not still "connecting" (session restoration)
    if (wallet.status !== 'connecting') {
      const token = localStorage.getItem('zypher_token');
      
      // 1. Not logged in at all
      if (!token && wallet.status === 'idle') {
        router.push('/');
        return;
      }

      // 2. Admin required but user is not admin
      if (requireAdmin && wallet.role !== 'admin' && wallet.status === 'connected') {
        router.push('/dashboard');
        return;
      }
    }
  }, [wallet.status, wallet.role, router, requireAdmin]);

  if (wallet.status === 'connecting' || wallet.status === 'idle') {
    return (
      <div className="min-h-screen bg-zypher-bg flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360] 
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 border-2 border-blue-500/20 border-t-blue-500 rounded-full mb-8"
        />
        <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Establishing Secure Uplink_</h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] animate-pulse">Verifying Protocol Permissions</p>
      </div>
    );
  }

  // Final check: if user is logged in, but we need admin and they aren't, don't show children yet
  if (requireAdmin && wallet.role !== 'admin') {
     return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
