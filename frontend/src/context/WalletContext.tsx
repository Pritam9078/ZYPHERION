import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StellarWalletsKit, Networks } from '@creit.tech/stellar-wallets-kit';

import { useRouter } from 'next/router';
import { API_BASE } from '../services/api';
import WalletSelectorModal from '../components/WalletSelectorModal';
import IdentitySelectorModal from '../components/IdentitySelectorModal';

interface WalletState {
  address: string | null;
  status: 'idle' | 'connecting' | 'connected' | 'error';
  role: 'user' | 'admin' | null;
  accountType?: 'Guest' | 'Developer' | 'DAOAdmin' | 'NodeOperator';
  tier?: 'Free' | 'Basic' | 'Pro' | 'Enterprise';
  kycStatus?: 'unverified' | 'pending' | 'verified';
  approved?: boolean;
  creditsBalance?: number;
  gasBalance?: number;
  walletType: string | null;
}

interface WalletContextType {
  wallet: WalletState;
  connect: (accountType?: string) => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    status: 'idle',
    role: null,
    walletType: null,
  });

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isIdentityOpen, setIsIdentityOpen] = useState(false);
  const [pendingAccountType, setPendingAccountType] = useState<string | undefined>(undefined);
  const [isKitInitialized, setIsKitInitialized] = useState(false);

  // Initialize the kit with the required modules
  useEffect(() => {
    const initKit = async () => {
      try {
        // @ts-ignore
        const { FreighterModule } = await import('@creit.tech/stellar-wallets-kit/modules/freighter');
        // @ts-ignore
        const { AlbedoModule } = await import('@creit.tech/stellar-wallets-kit/modules/albedo');
        // @ts-ignore
        const { xBullModule } = await import('@creit.tech/stellar-wallets-kit/modules/xbull');
        // @ts-ignore
        const { HanaModule } = await import('@creit.tech/stellar-wallets-kit/modules/hana');

        StellarWalletsKit.init({
          modules: [
            new FreighterModule(),
            new AlbedoModule(),
            new xBullModule(),
            new HanaModule(),
          ],
          network: Networks.TESTNET
        });
        setIsKitInitialized(true);
      } catch (err) {
        console.error('[Zypherion Context] Kit init failed:', err);
      }
    };
    initKit();
  }, []);

  // Session Restoration
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('zypher_token');
      const savedWalletType = localStorage.getItem('zypher_wallet_type');
      
      if (token && savedWalletType) {
        setWallet(prev => ({ ...prev, status: 'connecting' }));
        try {
          // Set the wallet in the kit
          StellarWalletsKit.setWallet(savedWalletType);

          const res = await fetch(`${API_BASE}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            const user = data.user;
            console.log('[Zypherion Context] Session restored:', user.address, user.accountType);
            setWallet({
              address: user.address,
              status: 'connected',
              role: user.role,
              accountType: user.accountType,
              tier: user.tier,
              kycStatus: user.kycStatus,
              approved: user.approved,
              creditsBalance: user.creditsBalance,
              gasBalance: user.gasBalance,
              walletType: savedWalletType,
            });

            // Handle Redirection for existing session
            if (router.pathname === '/') {
              if (user.role !== 'admin' && !user.approved && user.accountType !== 'Guest' && user.accountType !== 'Developer') {
                router.push('/pending-approval');
              } else if (user.role === 'admin' || user.accountType === 'DAOAdmin') {
                router.push('/admin');
              } else if (user.accountType === 'NodeOperator') {
                router.push('/node-operator');
              } else if (user.accountType === 'Developer') {
                router.push('/developer');
              } else {
                router.push('/guest');
              }
            }
          } else {
            localStorage.removeItem('zypher_token');
            localStorage.removeItem('zypher_wallet_type');
            setWallet(prev => ({ ...prev, status: 'idle' }));
          }
        } catch (e) {
          console.error('[Zypherion Context] Session restore failed:', e);
          setWallet(prev => ({ ...prev, status: 'idle' }));
        }
      }
    };
    if (isKitInitialized) {
      restoreSession();
    }
  }, [isKitInitialized]);

  const executeConnect = async (selectedWalletType: string, accountType?: string) => {
    setWallet(prev => ({ ...prev, status: 'connecting' }));
    try {
      // Set the wallet in the kit
      StellarWalletsKit.setWallet(selectedWalletType);

      // Get Address
      const { address } = await StellarWalletsKit.fetchAddress();
      
      if (!address) throw new Error("No address returned from wallet.");

      const message = "Authenticate with Zypherion Protocol".trim();
      
      // Sign Message
      const signResult = await StellarWalletsKit.signMessage(message);
      console.log("[Zypherion Auth] Full Sign Result:", signResult);
      
      const signatureRaw = (signResult as any).signedMessage || (signResult as any).signature || signResult;
      const signature = typeof signatureRaw === 'string' ? signatureRaw : Buffer.from(signatureRaw as any).toString('base64');
      
      if (!signature) throw new Error("Signing failed.");
      
      console.log("[Zypherion Auth] Diagnostic Payload:", {
        address,
        sigPrefix: signature.slice(0, 10),
        sigLength: signature.length
      });

      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature, message, accountType }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('zypher_token', data.token);
        localStorage.setItem('zypher_wallet_type', selectedWalletType);
        
        setWallet({
          address,
          status: 'connected',
          role: data.user.role,
          accountType: data.user.accountType,
          tier: data.user.tier,
          kycStatus: data.user.kycStatus,
          approved: data.user.approved,
          creditsBalance: data.user.creditsBalance,
          gasBalance: data.user.gasBalance,
          walletType: selectedWalletType,
        });
        
        // Handle Identity-based routing
        if (data.user.role !== 'admin' && !data.user.approved && data.user.accountType !== 'Guest' && data.user.accountType !== 'Developer') {
          router.push('/pending-approval');
        } else if (data.user.role === 'admin' || data.user.accountType === 'DAOAdmin') {
          router.push('/admin');
        } else if (data.user.accountType === 'NodeOperator') {
          router.push('/node-operator');
        } else if (data.user.accountType === 'Developer') {
          router.push('/developer');
        } else {
          router.push('/guest');
        }
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      console.error('[Zypherion Context] Connection error:', err);
      setWallet(prev => ({ ...prev, status: 'error' }));
      alert(err.message || 'Connection failed');
    }
  };

  const connect = (accountType?: string) => {
    console.log('[Zypherion Context] connect() triggered with type:', accountType || 'none (trigger identity selector)');
    if (accountType) {
      setPendingAccountType(accountType);
      setIsSelectorOpen(true);
    } else {
      setIsIdentityOpen(true);
    }
  };

  const disconnect = () => {
    localStorage.removeItem('zypher_token');
    localStorage.removeItem('zypher_wallet_type');
    setWallet({ address: null, status: 'idle', role: null, walletType: null });
    router.push('/');
  };

  return (
    <WalletContext.Provider value={{ wallet, connect, disconnect }}>
      {children}
      <IdentitySelectorModal
        isOpen={isIdentityOpen}
        onClose={() => setIsIdentityOpen(false)}
        onSelect={(role) => {
          setIsIdentityOpen(false);
          setPendingAccountType(role);
          setIsSelectorOpen(true);
        }}
      />
      <WalletSelectorModal 
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelect={(type) => {
          setIsSelectorOpen(false);
          executeConnect(type, pendingAccountType);
        }}
      />
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



