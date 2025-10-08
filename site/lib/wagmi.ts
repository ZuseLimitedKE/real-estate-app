import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  hederaTestnet, 
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Atria',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
  chains: [
    hederaTestnet
  ],
  ssr: true,
});
