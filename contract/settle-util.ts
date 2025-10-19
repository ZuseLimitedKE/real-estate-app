import { ContractId } from "@hashgraph/sdk";
import { keccak256, encodePacked } from "viem";
import { signTypedData } from 'viem/accounts';

export interface Order {
    maker: `0x${string}`;
    propertyToken: `0x${string}`;
    remainingAmount: number;
    pricePerShare: number;
    expiry: number;
    type: "BuyOrder" | "SellOrder";
    nonce: number;

}




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

export async function signBuyOrder(order: Order, privateKey: `0x${string}`, contractId: string): Promise<{ hash: string, signature: string }> {
    try {

        if (order.type !== "BuyOrder") {
            throw new Error("Invalid order type for signBuyOrder");
        }
        if (!privateKey) {
            throw new Error("Private key is required for signing");
        }
        const CONTRACT_ID = `0x${ContractId.fromString(contractId).toEvmAddress()}` as `0x${string}`;
        const EIP712_DOMAIN = {
            name: "AtriaMarketPlace",
            version: "1.0.0",
            chainId: BigInt(298),
            verifyingContract: CONTRACT_ID! as `0x${string}`,
        } as const;
        const message = {
            maker: order.maker,
            propertyToken: order.propertyToken,
            remainingAmount: BigInt(order.remainingAmount || "0"),
            pricePerShare: BigInt(order.pricePerShare || "0"),
            expiry: BigInt(order.expiry),
            nonce: BigInt(order.nonce),
        };
        const signature = await signTypedData({
            privateKey: privateKey as `0x${string}`,
            domain: EIP712_DOMAIN,
            types: EIP712_TYPES,
            primaryType: order.type,
            message,
        });

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
        return {
            hash: orderHash,
            signature: signature,
        }
    } catch (error) {
        console.error("Error signing buy order:", error);
        throw error;
    }

}
export async function signSellOrder(order: Order, privateKey: `0x${string}`, contractId: string): Promise<{ hash: string, signature: string }> {
    try {
        if (order.type !== "SellOrder") {
            throw new Error("Invalid order type for signSellOrder");
        }
        if (!privateKey) {
            throw new Error("Private key is required for signing");
        }
        const CONTRACT_ID = `0x${ContractId.fromString(contractId).toEvmAddress()}` as `0x${string}`;
        const EIP712_DOMAIN = {
            name: "AtriaMarketPlace",
            version: "1.0.0",
            chainId: BigInt(298),
            verifyingContract: CONTRACT_ID! as `0x${string}`,
        } as const;
        const message = {
            maker: order.maker,
            propertyToken: order.propertyToken,
            remainingAmount: BigInt(order.remainingAmount || "0"),
            pricePerShare: BigInt(order.pricePerShare || "0"),
            expiry: BigInt(order.expiry),
            nonce: BigInt(order.nonce),
        };
        const signature = await signTypedData({
            privateKey: privateKey as `0x${string}`,
            domain: EIP712_DOMAIN,
            types: EIP712_TYPES,
            primaryType: "SellOrder",
            message,
        });

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
        return {
            hash: orderHash,
            signature: signature,
        }
    }
    catch (error) {
        console.error("Error signing sell order:", error);
        throw error;
    }
}