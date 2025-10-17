import { useAccount, useReadContract } from "wagmi";
import marketPlaceAbi from "@/smartcontract/abi/MarketPlace.json";
import erc20Abi from "@/smartcontract/abi/ERC20.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

const MARKETPLACE = process.env.MARKETPLACE_CONTRACT as `0x${string}`;
const PROPERTY_TOKEN = process.env.PROPERTY_TOKEN_TOKEN as `0x${string}`;

export function PropertyTokensInEscrowCard() {
  const { address } = useAccount();

  // Get escrowed balance of property tokens for this connected wallet
  const { data: escrowBalance, isLoading: isEscrowLoading } = useReadContract({
    address: MARKETPLACE,
    abi: marketPlaceAbi.abi,
    functionName: "getEscrowBalance",
    args: [PROPERTY_TOKEN, address ?? "0x0000000000000000000000000000000000000000"],
    query: { enabled: !!address },
  });

  const { data: decimals } = useReadContract({
    address: PROPERTY_TOKEN,
    abi: erc20Abi.abi,
    functionName: "decimals",
  });

  const formattedBalance =
    escrowBalance && decimals !== undefined
      ? Number(escrowBalance) / 10 ** Number(decimals)
      : 0;

  return (
    <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
      <CardHeader className="flex items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Property Tokens in Escrow</CardTitle>
        <DollarSign className="h-4 w-4" />
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">
          {isEscrowLoading ? "Loading..." : `${formattedBalance.toLocaleString()}`}
        </div>
        <p className="text-xs text-purple-100">
          {formattedBalance === 0 
            ? "No property tokens in escrow yet"
            : "Property tokens locked in escrow"}
        </p>
      </CardContent>
    </Card>
  );
}