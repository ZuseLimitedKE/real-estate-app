import { createConfig, http } from 'wagmi'
import { walletConnect } from 'wagmi/connectors'

export const hederaNetworks = {
  mainnet: {
    id: 295,
    name: 'Hedera Mainnet',
    network: 'hedera-mainnet',
    nativeCurrency: { name: 'HBAR', symbol: 'HBAR', decimals: 8 },
    rpcUrls: {
      default: {
        http: ['https://mainnet.hashio.io/api'],
      },
    },
    blockExplorers: {
      default: {
        name: 'HashScan',
        url: 'https://hashscan.io/mainnet',
      },
    },
  },
  testnet: {
    id: 296,
    name: 'Hedera Testnet',
    network: 'hedera-testnet',
    nativeCurrency: { name: 'HBAR', symbol: 'HBAR', decimals: 8 },
    rpcUrls: {
      default: {
        http: ['https://testnet.hashio.io/api'],
      },
    },
    blockExplorers: {
      default: {
        name: 'HashScan',
        url: 'https://hashscan.io/testnet',
      },
    },
  },
}

export const config = createConfig({
  chains: [hederaNetworks.testnet, hederaNetworks.mainnet],
  connectors: [
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
    }),
  ],
  transports: {
    [hederaNetworks.testnet.id]: http(),
    [hederaNetworks.mainnet.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}