"use client";

import { useState, useEffect } from "react";
import { useAccount, useWalletClient, useChainId } from "wagmi";
import { keccak256, encodePacked } from "viem";
import { createOrder } from "@/server-actions/marketplace/actions";
export default function TestMarketPlace() {
    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();
    const chainId = useChainId();

    const [orderType, setOrderType] = useState<"BUY" | "SELL">("BUY");
    const [signature, setSignature] = useState<string | null>(null);

    // Order form fields (user-editable)
    const [order, setOrder] = useState({
        propertyToken: "" as `0x${string}`,
        remainingAmount: "",
        pricePerShare: "",
    });

    // Auto-generated values
    const [nonce, setNonce] = useState<bigint>(BigInt(0));
    const [expiry, setExpiry] = useState<bigint>(BigInt(0));

    useEffect(() => {
        // Simulate fetching user's next nonce (you’d do this from backend or contract)
        const generateNonce = () => BigInt(Date.now()); // for testing: timestamp-based
        const generateExpiry = () => BigInt(Math.floor(Date.now() / 1000) + 24 * 60 * 60); // expires in 24h

        setNonce(generateNonce());
        setExpiry(generateExpiry());
    }, [address, orderType]);

    if (chainId !== 296) {
        return (
            <div className="p-6 max-w-md mx-auto">
                <h1 className="text-xl font-semibold mb-4">Test Marketplace</h1>
                <p className="text-red-600">Please connect to the Hedera network (chain ID 296).</p>
            </div>
        );
    }

    const EIP712_DOMAIN = {
        name: "AtriaMarketPlace",
        version: "1.0.0",
        chainId: BigInt(296),
        verifyingContract: process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT! as `0x${string}`,
    } as const;

    const EIP712_TYPES = {
        BuyOrder: [
            { name: "maker", type: "address" },
            { name: "propertyToken", type: "address" },
            { name: "remainingAmount", type: "uint256" },
            { name: "pricePerShare", type: "uint256" },
            { name: "expiry", type: "uint256" },
            { name: "nonce", type: "uint256" },
        ],
        SellOrder: [
            { name: "maker", type: "address" },
            { name: "propertyToken", type: "address" },
            { name: "remainingAmount", type: "uint256" },
            { name: "pricePerShare", type: "uint256" },
            { name: "expiry", type: "uint256" },
            { name: "nonce", type: "uint256" },
        ],
    } as const;

    async function handleSignOrder() {
        if (!walletClient || !address) return alert("Connect wallet first");

        const message = {
            maker: address,
            propertyToken: order.propertyToken,
            remainingAmount: BigInt(order.remainingAmount || "0"),
            pricePerShare: BigInt(order.pricePerShare || "0"),
            expiry,
            nonce,
        };

        try {
            const sig = await walletClient.signTypedData({
                domain: EIP712_DOMAIN,
                types: EIP712_TYPES,
                primaryType: orderType === "BUY" ? "BuyOrder" : "SellOrder",
                message,
            });

            setSignature(sig);

            const orderHash = keccak256(
                encodePacked(
                    ["address", "address", "uint256", "uint256", "uint256", "uint256"],
                    [
                        message.maker,
                        message.propertyToken,
                        message.remainingAmount,
                        message.pricePerShare,
                        message.expiry,
                        message.nonce,
                    ]
                )
            );

            console.log("Order Hash:", orderHash);
            console.log("Signature:", sig);
            await createOrder({
                orderType,
                propertyToken: message.propertyToken,
                remainingAmount: message.remainingAmount.toString(),
                pricePerShare: message.pricePerShare.toString(),
                expiry:  Number(message.expiry),
                nonce: message.nonce.toString(),
            }, sig, address);
          
        } catch (err) {
            console.error(err);
            alert("Signing failed.");
        }
    }

    return (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-xl font-semibold mb-4">Test Marketplace</h1>

            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => setOrderType("BUY")}
                    className={`px-3 py-1 rounded ${orderType === "BUY" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                >
                    Buy
                </button>
                <button
                    onClick={() => setOrderType("SELL")}
                    className={`px-3 py-1 rounded ${orderType === "SELL" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                >
                    Sell
                </button>
            </div>

            {/* User inputs only editable fields */}
            {Object.entries(order).map(([key, value]) => (
                <div key={key} className="mb-3">
                    <label className="block text-sm capitalize mb-1">{key}</label>
                    <input
                        value={value}
                        onChange={(e) => setOrder({ ...order, [key]: e.target.value })}
                        className="border rounded w-full p-2"
                        placeholder={key}
                    />
                </div>
            ))}

            {/* Read-only auto-generated values */}
            <div className="text-sm text-gray-600 mt-4 space-y-1">
                <div><strong>Maker:</strong> {address || "—"}</div>
                <div><strong>Nonce:</strong> {nonce.toString()}</div>
                <div><strong>Expiry:</strong> {new Date(Number(expiry) * 1000).toLocaleString()}</div>
            </div>

            <button
                onClick={handleSignOrder}
                className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
                Sign {orderType} Order
            </button>

            {signature && (
                <div className="mt-4 break-all text-xs bg-gray-100 p-2 rounded">
                    <div><strong>Signature:</strong> {signature}</div>
                </div>
            )}
        </div>
    );
}
