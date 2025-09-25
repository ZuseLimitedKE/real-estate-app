"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
// import { Button } from "@/components/ui/button";
import { NavbarButton } from "./ui/resizable-navbar";
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
      <NavbarButton variant="primary" as="button" onClick={() => disconnect()}>
        Disconnect
      </NavbarButton>
    );
  }

  return (
    <NavbarButton
      variant="primary"
      as="button"
      onClick={handleConnect}
      disabled={isConnecting}
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </NavbarButton>
  );
}
