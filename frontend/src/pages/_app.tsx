import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { WalletProvider } from '../context/WalletContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Zypherion Protocol | Sovereign Infrastructure</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <WalletProvider>
        <Component {...pageProps} />
      </WalletProvider>
    </>
  );
}
