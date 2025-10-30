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
            // Ensure the orders are of correct type
            const buyOrder = parsedBuy.data;
            const sellOrder = parsedSell.data;
            this.assertOrderType(buyOrder.order, "BUY");
            this.assertOrderType(sellOrder.order, "SELL");
            const client = await this.getClient();
            const contractAddress = process.env.NEXT_PUBLIC_MARKETPLACE_HEDERA_ACCOUNTID!;
            const BUYORDER = {
                maker: buyOrder.order.maker as `0x${string}`,
                propertyToken: buyOrder.order.propertyToken as `0x${string}`,
                remainingAmount: Number(buyOrder.order.remainingAmount)*10**6,
                pricePerShare: Number(buyOrder.order.pricePerShare)*10**6,
                expiry: Number(buyOrder.order.expiry),
                type: "BuyOrder",
                nonce: Number(buyOrder.order.nonce),
                signature: buyOrder.signature as `0x${string}`,
            }
            const SELLORDER = {
                maker: sellOrder.order.maker as `0x${string}`,
                propertyToken: sellOrder.order.propertyToken as `0x${string}`,
                remainingAmount: Number(sellOrder.order.remainingAmount),
                pricePerShare: Number(sellOrder.order.pricePerShare) *10**6,
                expiry: Number(sellOrder.order.expiry),
                type: "SellOrder",
                nonce: Number(sellOrder.order.nonce),
                signature: sellOrder.signature as `0x${string}`,
            }
            console.log("BUYORDER", BUYORDER);
            console.log("SELLORDER", SELLORDER);
            const { type: _bt, signature: buyOrderSignature, ...parsedBuyOrder } = BUYORDER;
            const { type: _st, signature: sellOrderSignature, ...parsedSellOrder } = SELLORDER;
            const params = this.encodeFunctionParameters("settle", [parsedBuyOrder, parsedSellOrder]);
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
            console.log("Trade settled successfully", txSettleTradeResponse.transactionId.toString());
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

