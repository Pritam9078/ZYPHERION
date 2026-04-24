import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '../hooks/useWallet';
import { motion } from 'framer-motion';
import { getRouteConfig } from '../services/routes';
import Preloader from './Preloader';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  allowedAccountTypes?: string[];
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAdmin: propsRequireAdmin, allowedAccountTypes: propsAllowedTypes }) => {
  const { wallet } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (wallet.status !== 'connecting') {
      const token = localStorage.getItem('zypher_token');
      const config = getRouteConfig(router.pathname);
      
      // 1. Check if public
      if (config.public) return;

      // 2. Not logged in at all
      if (!token && wallet.status === 'idle') {
        router.push('/');
        return;
      }

      // 3. Authorization Check
      let isAuthorized = true;
      
      // Use props if provided (backward compatibility), otherwise use config
      const finalRequireAdmin = propsRequireAdmin ?? config.requireAdmin ?? false;
      const finalAllowedTypes = propsAllowedTypes ?? config.allowedAccountTypes;

      if (wallet.status === 'connected' && wallet.role !== 'admin') {
        if (finalRequireAdmin) {
          isAuthorized = false;
        }
        
        if (finalAllowedTypes && wallet.accountType) {
          if (!finalAllowedTypes.includes(wallet.accountType)) {
            isAuthorized = false;
          } else {
            isAuthorized = true;
          }
        }
      }

      if (!isAuthorized) {
        // Safe redirect loop protection
        const currentPath = router.pathname;
        let targetPath = '/guest';
        if (wallet.accountType === 'Developer') targetPath = '/developer';
        else if (wallet.accountType === 'NodeOperator') targetPath = '/node-operator';
        else if (wallet.accountType === 'DAOAdmin') targetPath = '/admin';

        if (currentPath !== targetPath) {
          router.push(targetPath);
        }
        return;
      }
    }
  }, [wallet.status, wallet.role, wallet.accountType, router.pathname]);

  if (wallet.status === 'connecting' || wallet.status === 'idle') {
    return <Preloader />;
  }

  // Final check: if user is logged in, but we need admin and they aren't, 
  // check if they have an allowed account type instead.
  if (propsRequireAdmin && wallet.role !== 'admin') {
    if (!propsAllowedTypes || !wallet.accountType || !propsAllowedTypes.includes(wallet.accountType)) {
      return null;
    }
  }

  // Final check for account types (if not already covered by requireAdmin check)
  if (!propsRequireAdmin && propsAllowedTypes && wallet.accountType && !propsAllowedTypes.includes(wallet.accountType) && wallet.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
