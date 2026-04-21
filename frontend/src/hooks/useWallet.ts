import { useWalletContext } from '../context/WalletContext';

export const useWallet = () => {
  return useWalletContext();
};
