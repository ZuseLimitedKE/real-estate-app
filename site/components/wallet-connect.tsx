"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
export function WalletConnect() {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const [isConnecting, setIsConnecting] = useState(false);

  // Get the first available connector (WalletConnect)
  const connector = connectors[0];

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      connect({ connector });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast.error("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  if (isConnected && address) {
    return (
      <Button
        variant="outline"
        onClick={() => disconnect()}
        className="cursor-pointer font-semibold hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        Disconnect: {`${address.slice(0, 6)}...${address.slice(-4)}`}
      </Button>
    );
  }

  return (
    <Button
      variant="default"
      onClick={handleConnect}
      className="cursor-pointer font-semibold hover:bg-primary/90 transition-colors"
      disabled={isConnecting}
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
