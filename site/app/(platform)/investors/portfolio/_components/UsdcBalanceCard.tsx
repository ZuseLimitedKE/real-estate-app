import { useAccount, useReadContract } from "wagmi";
import marketPlaceAbi from "@/smartcontract/abi/MarketPlace.json";
import erc20Abi from "@/smartcontract/abi/ERC20.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

const MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT as `0x${string}`;
const USDC = process.env.NEXT_PUBLIC_USDC_TOKEN as `0x${string}`;

export function UsdcBalanceCard() {
  const { address } = useAccount();

  const { data: escrowBalance, isLoading: isEscrowLoading } = useReadContract({
    address: MARKETPLACE,
    abi: marketPlaceAbi.abi,
    functionName: "getEscrowBalance",
    args: [USDC, address ?? "0x0000000000000000000000000000000000000000"],
    query: { enabled: !!address }, // only runs if wallet is connected
  });

  const { data: decimals } = useReadContract({
    address: USDC,
    abi: erc20Abi.abi,
    functionName: "decimals",
  });

  const formattedBalance =
    escrowBalance && decimals
      ? Number(escrowBalance) / 10 ** Number(decimals)
      : 0;

  return (
    <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
      <CardHeader className="flex items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">USDC in Escrow</CardTitle>
        <DollarSign className="h-4 w-4" />
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">
          {isEscrowLoading ? "Loading..." : `$${formattedBalance.toLocaleString()}`}
        </div>
        <p className="text-xs text-orange-100">
            {formattedBalance === 0 
                ? "No funds in escrow yet"
                : "Funds locked in escrow"
            }
        </p>
      </CardContent>
    </Card>
  );
}
