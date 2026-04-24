import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '../hooks/useWallet';

export default function DashboardRedirector() {
  const router = useRouter();
  const { wallet } = useWallet();

  useEffect(() => {
    if (wallet.status === 'connected') {
      if (wallet.role === 'admin' || wallet.accountType === 'DAOAdmin') {
        router.push('/admin');
      } else if (wallet.accountType === 'NodeOperator') {
        router.push('/node-operator');
      } else if (wallet.accountType === 'Developer') {
        router.push('/developer');
      } else {
        router.push('/guest');
      }
    } else if (wallet.status === 'idle') {
      router.push('/');
    }
  }, [wallet.status, wallet.role, wallet.accountType, router]);

  return (
    <div className="min-h-screen bg-zypher-bg flex items-center justify-center">
       <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );
}
