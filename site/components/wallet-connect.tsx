"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { NavbarButton } from "./ui/resizable-navbar";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
export function WalletConnect() {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const [isConnecting, setIsConnecting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const connector = useMemo(() => connectors?.[0], [connectors]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      if (!connector) throw new Error("No wallet connector available");
      connect({ connector });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast.error("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  // Render stable button text until mounted to avoid hydration mismatches
  if (!mounted) {
    return (
      <NavbarButton variant="primary" as="button" disabled>
        Connect Wallet
      </NavbarButton>
    );
  }

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
      disabled={isConnecting || !connector}
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </NavbarButton>
  );
}
