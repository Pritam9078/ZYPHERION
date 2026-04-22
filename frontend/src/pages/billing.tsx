import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import AuthGuard from '../components/AuthGuard';
import { useWalletContext } from '../context/WalletContext';

import { signTransaction } from '@stellar/freighter-api';
import { Horizon, TransactionBuilder, Networks, Asset, Operation, Transaction } from '@stellar/stellar-sdk';
import { recordDeposit, fetchUserDeposits } from '../services/api';

const ADMIN_WALLET = 'GB6U7APEDEHKWVXDTVO4UE5E3UDSMEOKB3DCLJ4PMAY3ABSOFK7PBUD7';

export default function BillingDashboard() {
  const { wallet } = useWalletContext();
  const [depositAmount, setDepositAmount] = useState('100');
  const [isDepositing, setIsDepositing] = useState(false);
  const [balance, setBalance] = useState('0.00');
  const [transactions, setTransactions] = useState<any[]>([]);

  const loadData = async () => {
    if (!wallet.address) return;
    const token = localStorage.getItem('zypher_token');
    try {
      // Fetch Stellar Balance
      const server = new Horizon.Server('https://horizon-testnet.stellar.org');
      const account = await server.loadAccount(wallet.address);
      const nativeBalance = account.balances.find(b => b.asset_type === 'native');
      if (nativeBalance) {
        setBalance(parseFloat(nativeBalance.balance).toFixed(2));
      }

      // Fetch Transaction History from Backend
      if (token) {
        const txs = await fetchUserDeposits(token);
        setTransactions(txs);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [wallet.address, isDepositing]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.address) return alert('Please connect your wallet first.');
    
    setIsDepositing(true);
    try {
      const TESTNET_PASSPHRASE = 'Test SDF Network ; September 2015';
      const server = new Horizon.Server('https://horizon-testnet.stellar.org');
      const account = await server.loadAccount(wallet.address);
      
      const tx = new TransactionBuilder(account, { 
        fee: '1000', 
        networkPassphrase: TESTNET_PASSPHRASE,
        timebounds: {
          minTime: '0',
          maxTime: (Math.floor(Date.now() / 1000) + 900).toString()
        }
      })
      .addOperation(Operation.payment({
        destination: ADMIN_WALLET,
        asset: Asset.native(),
        amount: depositAmount.toString()
      }))
      .build();

      // Freighter v6 requires `networkPassphrase`, NOT `network`
      const result = await signTransaction(tx.toXDR(), { networkPassphrase: TESTNET_PASSPHRASE });
      
      // Handle both old and new Freighter API response shapes
      const signedXdr = typeof result === 'string' ? result : (result as any).signedTxXdr;
      if (!signedXdr) throw new Error('Transaction signing failed or was rejected.');
      
      // Submit directly via XDR without re-parsing to avoid constructor issues
      const submitResponse = await server.submitTransaction(
        TransactionBuilder.fromXDR(signedXdr, TESTNET_PASSPHRASE) as any
      );
      
      
      // Register deposit with backend
      const token = localStorage.getItem('zypher_token');
      if (!token) throw new Error('Not authenticated.');

      await recordDeposit(token, {
        depositAmount: Number(depositAmount),
        txHash: submitResponse.hash,
        currency: 'XLM'
      });

      alert(`Successfully deposited ${depositAmount} XLM! Tx: ${submitResponse.hash}`);
      setDepositAmount('100');
    } catch (error: any) {
      console.error(error);
      alert(`Deposit failed: ${error.message}`);
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-zypher-bg text-slate-200">
        <div className="fixed inset-0 blueprint-bg opacity-20 pointer-events-none" />
        <Navbar />

        <main className="relative z-10 container mx-auto px-6 py-12">
          
          <header className="mb-12 border-b border-white/5 pb-8">
            <h2 className="text-5xl font-black text-white tracking-tighter mb-4">Billing & Quota_</h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Manage your SaaS tier, track proof usage, and deposit testnet credits into the escrow contract.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Current Tier & Usage */}
            <section className="lg:col-span-2 space-y-8">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-[2.5rem] glass border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Current Tier</div>
                  <div className="text-4xl font-black text-white mb-2">{wallet.tier || 'Free'} Plan</div>
                  <div className="text-xs text-slate-400">Account Type: <span className="text-blue-400">{wallet.accountType}</span></div>
                </div>
                <div className="text-right">
                   <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Status</div>
                   <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider inline-block ${wallet.approved ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                     {wallet.approved ? 'Approved' : 'Pending Review'}
                   </div>
                </div>
              </motion.div>

              {/* Usage Metrics */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-8 rounded-[2.5rem] glass border-white/5">
                <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-6">Usage Analytics</h3>
                
                <div className="mb-8">
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-slate-400">Proofs Generated (Monthly)</span>
                    <span className="text-white">142 / 1,000</span>
                  </div>
                  <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full w-[14%]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                    <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Total Logic Rules</div>
                    <div className="text-2xl font-bold text-white">2 <span className="text-xs text-slate-500">/ 3</span></div>
                  </div>
                  <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                    <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">API Error Rate</div>
                    <div className="text-2xl font-bold text-emerald-400">0.00%</div>
                  </div>
                </div>

                <div className="mt-12">
                  <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6">Recent Escrow Transactions_</h4>
                  <div className="space-y-4">
                    {transactions.length === 0 ? (
                      <div className="p-8 text-center glass border-white/5 rounded-2xl opacity-40 italic text-xs uppercase tracking-widest">No transaction history found</div>
                    ) : transactions.map((tx, i) => (
                      <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex justify-between items-center group hover:bg-white/[0.04] transition-all">
                        <div>
                          <div className="text-xs font-bold text-white mb-1 uppercase tracking-tight">{tx.depositAmount} {tx.currency} {tx.type}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{tx.txHash.slice(0, 24)}...</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${tx.status === 'confirmed' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' : 'text-amber-400 border-amber-400/20 bg-amber-400/5'}`}>
                            {tx.status}
                          </div>
                          <div className="text-[9px] text-slate-600 mt-2 font-bold">{new Date(tx.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Wallet Balance & Deposit */}
            <aside className="space-y-8">
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="p-8 rounded-[2.5rem] glass-blue border-white/5">
                <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-6">Testnet Escrow</h3>
                
                <div className="text-center mb-8">
                  <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Available Balance</div>
                  <div className="text-5xl font-black text-white mb-1">{balance}</div>
                  <div className="text-xs font-medium text-slate-500">XLM (Testnet)</div>
                </div>

                <form onSubmit={handleDeposit} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Deposit Amount</label>
                    <input 
                      type="number" 
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isDepositing}
                    className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${isDepositing ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                  >
                    {isDepositing ? 'Processing on Stellar...' : 'Fund Escrow Contract'}
                  </button>
                  <p className="text-[9px] text-center text-slate-500 mt-4 leading-relaxed">
                    Depositing funds locks tokens in the Zypherion Soroban smart contract. You can withdraw unused credits at any time.
                  </p>
                </form>
              </motion.div>
            </aside>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
