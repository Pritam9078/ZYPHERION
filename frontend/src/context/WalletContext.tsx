import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isConnected, getAddress, signMessage, setAllowed } from '@stellar/freighter-api';
import { useRouter } from 'next/router';

interface WalletState {
  address: string | null;
  status: 'idle' | 'connecting' | 'connected' | 'error';
  role: 'user' | 'admin' | null;
  accountType?: 'Guest' | 'Developer' | 'DAOAdmin' | 'NodeOperator';
  tier?: 'Free' | 'Basic' | 'Pro' | 'Enterprise';
  kycStatus?: 'unverified' | 'pending' | 'verified';
  approved?: boolean;
}

interface WalletContextType {
  wallet: WalletState;
  connect: (accountType?: string) => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    status: 'idle',
    role: null,
  });

  // Session Restoration
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('zypher_token');
      if (token) {
        setWallet(prev => ({ ...prev, status: 'connecting' }));
        try {
          const res = await fetch('http://localhost:5001/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            const user = data.user;
            setWallet({
              address: user.address,
              status: 'connected',
              role: user.role,
              accountType: user.accountType,
              tier: user.tier,
              kycStatus: user.kycStatus,
              approved: user.approved,
            });
          } else {
            localStorage.removeItem('zypher_token');
            setWallet(prev => ({ ...prev, status: 'idle' }));
          }
        } catch (e) {
          console.error('[Zypherion Context] Session restore failed:', e);
          setWallet(prev => ({ ...prev, status: 'idle' }));
        }
      }
    };
    restoreSession();
  }, []);

  const connect = async (accountType?: string) => {
    setWallet(prev => ({ ...prev, status: 'connecting' }));
    try {
      const connected = await isConnected();
      const isActuallyConnected = typeof connected === 'boolean' ? connected : (connected as any)?.isConnected;

      if (!isActuallyConnected) {
        alert('Freighter wallet not detected. Please install it.');
        setWallet(prev => ({ ...prev, status: 'error' }));
        return;
      }

      await setAllowed();
      const addressResult = await getAddress();
      const address = typeof addressResult === 'string' ? addressResult : (addressResult as any)?.address;

      if (!address) throw new Error("No address returned from Freighter.");

      const message = "Authenticate with Zypherion Protocol";
      const signedResult = await signMessage(message);
      if (!signedResult) throw new Error("Signing failed.");

      const signature = typeof signedResult === 'string' ? signedResult : (signedResult as any)?.signedMessage;

      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature, message, accountType }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('zypher_token', data.token);
        setWallet({
          address,
          status: 'connected',
          role: data.user.role,
          accountType: data.user.accountType,
          tier: data.user.tier,
          kycStatus: data.user.kycStatus,
          approved: data.user.approved,
        });
        
        // Handle Approval routing
        if (data.user.role !== 'admin' && !data.user.approved && data.user.accountType !== 'Guest') {
          router.push('/pending-approval');
        } else {
          router.push('/dashboard');
        }
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      console.error(err);
      setWallet(prev => ({ ...prev, status: 'error' }));
      alert(err.message || 'Connection failed');
    }
  };

  const disconnect = () => {
    localStorage.removeItem('zypher_token');
    setWallet({ address: null, status: 'idle', role: null });
    router.push('/');
  };

  return (
    <WalletContext.Provider value={{ wallet, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};
