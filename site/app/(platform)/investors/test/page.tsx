"use client";

import { useState, useEffect } from "react";
import { useAccount, useWalletClient, useChainId, usePublicClient } from "wagmi";
import { keccak256, encodePacked } from "viem";
import { createOrder, associateTokentoContract } from "@/server-actions/marketplace/actions";
import MARKETPLACE_ABI from "@/marketPlaceContractABI.json";
import { hederaTestnet, hedera } from 'viem/chains';
import { TokenId } from "@hashgraph/sdk";

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
    const publicClient = usePublicClient();
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
                expiry: Number(message.expiry),
                nonce: message.nonce.toString(),
            }, sig, address);

        } catch (err) {
            console.error(err);
            alert("Signing failed.");
        }
    }
    // ============================
    // 🔹 Contract Interaction Logic
    // ============================

    async function handleDeposit() {
        if (!walletClient || !address) return alert("Connect wallet first");

        try {
           
            // const associateResult = await associateTokentoContract(order.propertyToken);
            // if (!associateResult || !associateResult.success) {
            //     console.log("Token association failed. Check console for details.");
            //     return
            // }
            const amount = BigInt(order.remainingAmount);
            if (amount <= BigInt(0)) return alert("Enter valid amount");

            const txHash = await walletClient.writeContract({
                address: process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT! as `0x${string}`,
                abi: MARKETPLACE_ABI.abi,
                functionName: "depositToken",
                args: [order.propertyToken, amount],
                chain: hederaTestnet,
            });
            const receipt = await publicClient?.waitForTransactionReceipt({ hash: txHash });
            console.log("Receipt:", receipt);
            console.log("Deposit Tx here:", txHash);
        } catch (err) {
            console.log("Deposit failed:", err);
            alert("Deposit failed. Check console for details.");
        }
    }

    async function handleInitOrder() {
        if (!walletClient || !address) return alert("Connect wallet first");

        try {
            const amount = BigInt(order.remainingAmount || "0");
            if (amount <= BigInt(0)) return alert("Enter valid amount");

            const nonce64 = Number(nonce); // safe for testing (fits in uint64)
            const fn =
                orderType === "BUY" ? "initBuyOrder" : "initSellOrder";

            const txHash = await walletClient.writeContract({
                address: process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT! as `0x${string}`,
                abi: MARKETPLACE_ABI.abi,
                functionName: fn,
                args:
                    orderType === "BUY"
                        ? [nonce64, order.propertyToken, Number(amount)]
                        : [nonce64, order.propertyToken, Number(amount)],
                chain: hederaTestnet,
            });

            console.log("Init Order Tx:", txHash);
            alert(`${orderType} order initialized! Tx: ${txHash}`);
        } catch (err) {
            console.error("Initialization failed:", err);
            alert("Order initialization failed. Check console for details.");
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
            <div>
                {signature && (
                    <div className="mt-4 break-all text-xs bg-gray-100 p-2 rounded">
                        <div><strong>Signature:</strong> {signature}</div>
                    </div>
                )}
                <button
                    onClick={handleSignOrder}
                    className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                    Sign {orderType} Order
                </button>
                {/* Initialize marketplace */}


                {/* Deposit tokens */}
                <div className="mt-6 border-t pt-4">
                    <h2 className="text-lg font-semibold mb-2">Deposit to Escrow</h2>
                    <div className="space-y-3">
                        <input
                            placeholder="Token address (0x...)"
                            onChange={(e) => setOrder({ ...order, propertyToken: e.target.value as `0x${string}` })}
                            value={order.propertyToken}
                            className="border rounded w-full p-2"
                        />
                        <input
                            placeholder="Amount to deposit"
                            onChange={(e) => setOrder({ ...order, remainingAmount: e.target.value })}
                            value={order.remainingAmount}
                            className="border rounded w-full p-2"
                        />
                        <button
                            onClick={() => handleDeposit()}
                            className="w-full bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700"
                        >
                            Deposit Tokens
                        </button>
                    </div>
                </div>

            </div>

            <button
                onClick={handleInitOrder}
                className="mt-6 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
            >
                Initialize Marketplace
            </button>

        </div>
    );
}
