import { Order, ErrorResponse, SettleOrderSchema, type SettleOrder, SuccessResponse, SignedOrder, SignedOrderSchema } from "@/types/marketplace";
import Web3, { Web3Account } from "web3";
import MarketPlaceABI from "@/marketPlaceContractABI.json";
import { AccountId, PrivateKey, Client, TokenAssociateTransaction, Status, ContractExecuteTransaction, ContractFunctionParameters, Hbar, TokenId } from "@hashgraph/sdk"
import { hexToBytes } from "viem";
import { Interface } from "@ethersproject/abi";
import fs from "fs";

import abiStr from "@/smartcontract/abi/MarketPlace.json";
export class MarketPlaceContract {

    async getClient(): Promise<Client> {
        try {
            if (!process.env.DEPLOYER_ACCOUNT_ID || !process.env.DEPLOYER_PRIVATE_KEY) {
                throw new Error("Missing DEPLOYER_ACCOUNT_ID or DEPLOYER_PRIVATE_KEY");
            }
            const client = Client.forTestnet()
            client.setOperator(
                AccountId.fromString(process.env.DEPLOYER_ACCOUNT_ID!),
                PrivateKey.fromStringECDSA(process.env.DEPLOYER_PRIVATE_KEY!)
            );
            return client;
        } catch (err) {
            console.error("Error getting client", err);
            throw new Error("Error getting client");
        }
    }
    async settleTrade(buy: SignedOrder, sell: SignedOrder): Promise<SuccessResponse | ErrorResponse> {
        try {

            const parsedBuy = SignedOrderSchema.safeParse(buy);
            const parsedSell = SignedOrderSchema.safeParse(sell);
            if (!parsedBuy.success || !parsedSell.success) {
                return { status: "INVALID_DATA", message: "Invalid order data", statusCode: 400, success: false } as ErrorResponse;
            }
            const buyOrder = parsedBuy.data;
            const sellOrder = parsedSell.data;
            this.assertOrderType(buyOrder.order, "BUY");
            this.assertOrderType(sellOrder.order, "SELL");
            const client = await this.getClient();
            const contractAddress = process.env.MARKETPLACE_HEDERA_ACCOUNTID!;
            const BUYORDER = {
                maker: buyOrder.order.maker as `0x${string}`,
                propertyToken: `0x${TokenId.fromString(buyOrder.order.propertyToken).toEvmAddress()}` as `0x${string}`,
                remainingAmount: Number(buyOrder.order.remainingAmount),
                pricePerShare: Number(buyOrder.order.pricePerShare),
                expiry: Number(buyOrder.order.expiry),
                type: "BuyOrder",
                nonce: Number(buyOrder.order.nonce),
                signature: buyOrder.signature as `0x${string}`,
            }
            const SELLORDER = {
                maker: sellOrder.order.maker as `0x${string}`,
                propertyToken: `0x${TokenId.fromString(sellOrder.order.propertyToken).toEvmAddress()}` as `0x${string}`,
                remainingAmount: Number(sellOrder.order.remainingAmount),
                pricePerShare: Number(sellOrder.order.pricePerShare),
                expiry: Number(sellOrder.order.expiry),
                type: "SellOrder",
                nonce: Number(sellOrder.order.nonce),
                signature: sellOrder.signature as `0x${string}`,
            }
            const { type: _bt, signature: buyOrderSignature, ...parsedBuyOrder } = BUYORDER;
            const { type: _st, signature: sellOrderSignature, ...parsedSellOrder } = SELLORDER;
            const params = this.encodeFunctionParameters("settle", [parsedBuyOrder, hexToBytes(buyOrderSignature), parsedSellOrder, hexToBytes(sellOrderSignature)]);
            const txSettleTrade = await new ContractExecuteTransaction()
                .setContractId(contractAddress)
                .setFunctionParameters(params)
                .setGas(5_000_000)
                .setMaxTransactionFee(new Hbar(10))
                .freezeWith(client);
            const signTxSettleTrade = await txSettleTrade.sign(PrivateKey.fromStringECDSA(process.env.DEPLOYER_PRIVATE_KEY!));
            const txSettleTradeResponse = await signTxSettleTrade.execute(client);
            const receipt = await txSettleTradeResponse.getReceipt(client);
            const status = receipt.status;
            if (status.toString() !== "SUCCESS") {
                return { status: "ERROR", message: `Trade settlement failed with status: ${status}`, statusCode: 500, success: false } as ErrorResponse;
            }
            return {
                status: "SUCCESS",
                message: "Trade settled successfully",
                data: { txHash: txSettleTradeResponse.transactionId.toString() },
                success: true
            } as SuccessResponse;
        }
        catch (error) {
            console.error("Error settling trade", error);
            return { status: "ERROR", message: "Error settling trade", statusCode: 500, success: false } as ErrorResponse;
        }

    }

    private assertOrderType(order: Order, expectedType: "BUY" | "SELL") {
        if (order.orderType !== expectedType) {
            throw Error(`Order type mismatch: expected ${expectedType}, got ${order.orderType}`);
        }
    }

    // Try to extract a revert reason from various error shapes and by performing a call
    private async extractRevertReason(web3: Web3, err: any): Promise<string | undefined> {
        try {
            // If the error already contains data that is the revert payload, decode it
            if (err && typeof err === 'object') {
                // Common providers put the revert data in err.data, err.result or err.returnedData
                const payload = err.data || err.result || err.returnedData || (err.transaction && err.transaction.data);
                if (payload && typeof payload === 'string') {
                    // ABI-encoded revert reason typically starts with 0x08c379a0
                    const hex = payload.startsWith('0x') ? payload : `0x${payload}`;
                    const reason = this.decodeRevertReasonFromHex(hex);
                    if (reason) return reason;
                }

                // Some providers include message with 'revert reason: <reason>'
                if (typeof err.message === 'string') {
                    const m = err.message.match(/revert(?:ed)?[: ]+(.+)/i);
                    if (m) return m[1].trim();
                }
            }

            // If none of the above worked, try a raw eth_call to reproduce the revert and decode
            if (err && err.transaction && err.transaction.to && err.transaction.data) {
                const callResult = await web3.eth.call({ to: err.transaction.to, data: err.transaction.data, from: err.transaction.from });
                if (callResult) {
                    const reason = this.decodeRevertReasonFromHex(callResult);
                    if (reason) return reason;
                }
            }

            // Fallback to generic error message
            if (err && err.message) return String(err.message);
        } catch (e) {
            console.error('Failed to extract revert reason', e);
        }
        return undefined;
    }

    // Decode a typical solidity revert reason from hex (0x08c379a0...)
    private decodeRevertReasonFromHex(hex: string): string | undefined {
        try {
            if (!hex || typeof hex !== 'string') return undefined;
            const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
            // If not the standard selector, skip
            if (!clean.startsWith('08c379a0')) return undefined;
            // The rest is ABI encoded: offset (32) + string length + string bytes
            // Remove selector (4 bytes => 8 hex chars)
            const data = clean.slice(8);
            // Skip the first 32 bytes (offset)
            const lenHex = data.slice(64, 128);
            const len = parseInt(lenHex, 16);
            const strHex = data.slice(128, 128 + len * 2);
            const buf = Buffer.from(strHex, 'hex');
            return buf.toString('utf8');
        } catch (e) {
            return undefined;
        }
    }
    static async associateTokentoContract(tokenId: `0x${string}`) {
        try {
            if (!tokenId) {
                throw new Error("Token ID is required for association");
            }
            const mp = new MarketPlaceContract();
            const client = await mp.getClient();
            const contractAddress = process.env.NEXT_PUBLIC_MARKETPLACE_HEDERA_ACCOUNTID!;
            if (!contractAddress) {
                throw new Error('MARKETPLACE_CONTRACT env variable is not set');
            }
            const txTokenAssociate = await new ContractExecuteTransaction()
                .setContractId(contractAddress)
                .setGas(4_000_000)
                .setFunction("tokenAssociate", new ContractFunctionParameters().addAddress(tokenId))
                .setMaxTransactionFee(new Hbar(5))
                .freezeWith(client);

            //Sign and execute the property token transaction
            const signTxTokenAssociate = await txTokenAssociate.sign(PrivateKey.fromStringECDSA(process.env.DEPLOYER_PRIVATE_KEY!));
            const txTokenAssociateResponse = await signTxTokenAssociate.execute(client);
            const receipt = await txTokenAssociateResponse.getReceipt(client);
            const status = receipt.status;
            return { status: "SUCCESS", message: "Trade settled successfully", data: receipt, success: true } as SuccessResponse;
        } catch (error) {
            console.error("Error associating token to contract", error);
            return { success: false }
        }
    }
    /**
 * Helper function to encode function name and parameters that can be used to invoke a contract's function
 * @param functionName the name of the function to invoke
 * @param parameterArray an array of parameters to pass to the function
 */
    private encodeFunctionParameters(functionName: string, parameterArray: any[]) {
        const abi = abiStr as { abi: any, bytecode: string }
        let abiInterface = new Interface(abi.abi);
        // build the call parameters using ethers.js
        // .slice(2) to remove leading '0x'
        const functionCallAsHexString = abiInterface!.encodeFunctionData(functionName, parameterArray).slice(2);
        // convert to a Uint8Array
        return Buffer.from(functionCallAsHexString, `hex`);
    }
}
export const marketPlaceContract = new MarketPlaceContract();

