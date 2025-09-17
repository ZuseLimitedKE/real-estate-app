'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function WalletConnect() {
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { address, isConnected } = useAccount()
  const [isConnecting, setIsConnecting] = useState(false)

  // Get the first available connector (WalletConnect)
  const connector = connectors[0]

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await connect({ connector })
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      // You could show a toast notification here
    } finally {
      setIsConnecting(false)
    }
  }

  if (isConnected && address) {
    return (
      <Button 
        variant="outline" 
        onClick={() => disconnect()}
        className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        Disconnect: {`${address.slice(0, 6)}...${address.slice(-4)}`}
      </Button>
    )
  }

  return (
    <Button 
      variant="default" 
      onClick={handleConnect}
      className="cursor-pointer hover:bg-primary/90 transition-colors"
      disabled={isConnecting}
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  )
}