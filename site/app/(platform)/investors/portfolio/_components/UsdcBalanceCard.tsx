import { useAccount, useReadContract } from "wagmi";
import erc20Abi from "@/smartcontract/abi/ERC20.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

const USDC = "0x0000000000000000000000000000000000068cda";

export function UsdcBalanceCard() {
  const { address } = useAccount();

  const { data: balance, isLoading } = useReadContract({
    address: USDC,
    abi: erc20Abi.abi,
    functionName: "balanceOf",
    args: [address ?? "0x0000000000000000000000000000000000000000"],
    query: { enabled: !!address }, // only runs if wallet is connected
  });

  const { data: decimals } = useReadContract({
    address: USDC,
    abi: erc20Abi.abi,
    functionName: "decimals",
  });

  const formattedBalance =
    balance && decimals
      ? Number(balance) / 10 ** Number(decimals)
      : 0;

//   console.log("USDC", formattedBalance)

  return (
    <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
      <CardHeader className="flex items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">USDC Balance</CardTitle>
        <DollarSign className="h-4 w-4" />
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? "Loading..." : `$${formattedBalance.toLocaleString()}`}
        </div>
        <p className="text-xs text-orange-100">Ready for new investments</p>
      </CardContent>
    </Card>
  );
}
