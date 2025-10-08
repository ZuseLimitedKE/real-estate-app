import { Order, ErrorResponse, SettleOrderSchema, type SettleOrder, SuccessResponse } from "@/types/marketplace";
import Web3, { Web3Account } from "web3";
import MarketPlaceABI from "@/marketPlaceContractABI.json";
export class MarketPlace {
    async getWeb3(): Promise<Web3> {
        try {
            if (!process.env.HEDERA_RPC_URL) {
                throw new Error("Invalid env setup. Set HEDERA_RPC_URL in env variables");
            }
            return new Web3(process.env.HEDERA_RPC_URL);
        } catch (err) {

            console.error("Error getting web3", err);
            throw new Error("Error getting web3");
        }
    }
    async getAccount(): Promise<Web3Account> {
        try {
            if (!process.env.DEPLOYER_PRIVATE_KEY) {
                throw new Error("Invalid env setup. Set DEPLOYER_PRIVATE_KEY in env");
            }
            const web3 = await this.getWeb3();
            const account = web3.eth.accounts.privateKeyToAccount(process.env.DEPLOYER_PRIVATE_KEY);
            return account;
        } catch (err) {
            console.log("Error getting account", err);
            throw new Error("Error getting account");
        }
    }
    async settleTrade(args: SettleOrder): Promise<SuccessResponse | ErrorResponse> {
        try {
            const parsed = SettleOrderSchema.safeParse(args);
            if (!parsed.success) {
                return { status: "INVALID_DATA", message: "Invalid order data", statusCode: 400, success: false } as ErrorResponse;
            }
            const { buyOrder, sellOrder } = parsed.data;
            this.assertOrderType(buyOrder.order, "BUY");
            this.assertOrderType(sellOrder.order, "SELL");
            const web3 = await this.getWeb3();
            const contractAddress = process.env.MARKETPLACE_CONTRACT;
            if (!contractAddress) {
                throw new Error('MARKETPLACE_CONTRACT env variable is not set');
            }
            const contract = new web3.eth.Contract(MarketPlaceABI.abi, contractAddress);
            const account = await this.getAccount();
            const block = await web3.eth.getBlock();
            const buyRemaining = BigInt(buyOrder.order.remainingAmount);
            const buyPrice = BigInt(buyOrder.order.pricePerShare);
            const buyExpiry = BigInt(buyOrder.order.expiry);
            const buyNonce = BigInt(buyOrder.order.nonce);

            const sellRemaining = BigInt(sellOrder.order.remainingAmount);
            const sellPrice = BigInt(sellOrder.order.pricePerShare);
            const sellExpiry = BigInt(sellOrder.order.expiry);
            const sellNonce = BigInt(sellOrder.order.nonce);

            const buyStruct = {
                maker: buyOrder.order.maker,
                propertyToken: buyOrder.order.propertyToken,
                buyRemaining,
                buyPrice,
                buyExpiry,
                buyNonce,
            };

            const sellStruct = {
                maker: sellOrder.order.maker,
                propertyToken: sellOrder.order.propertyToken,
                sellRemaining,
                sellPrice,
                sellExpiry,
                sellNonce,
            };


            const tx = contract.methods.settle(
                buyStruct, buyOrder.signature, sellStruct, sellOrder.signature);
            const txData = {
                from: account.address,
                to: contractAddress as string,
                data: tx.encodeABI(),
                maxFeePerGas: block.baseFeePerGas! * BigInt(2),
                maxPriorityFeePerGas: 100000,
            };

            // Pre-flight call to capture potential revert reason without sending the transaction
            try {
                await web3.eth.call({
                    to: String(txData.to), data: txData.data, from: txData.from, maxFeePerGas: block.baseFeePerGas! * BigInt(2),
                    maxPriorityFeePerGas: 100000,
                });
            } catch (callErr) {
                // Attempt to extract revert reason and return it
                const revertReason = await this.extractRevertReason(web3, callErr as any);
                console.error('Preflight call reverted:', revertReason ?? callErr);
                return { status: "ERROR", message: `Preflight revert: ${revertReason ?? String(callErr)}`, statusCode: 400, success: false } as ErrorResponse;
            }

            const signedTx = await web3.eth.accounts.signTransaction(txData, account.privateKey);
            try {
                const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction as string);
                return { status: "SUCCESS", message: "Trade settled successfully", data: receipt, success: true } as SuccessResponse;
            } catch (sendErr) {
                // Try to get revert reason via a read call if possible
                const revertReason = await this.extractRevertReason(web3, sendErr as any);
                console.error('Transaction failed:', sendErr, 'revertReason:', revertReason);
                return { status: "ERROR", message: `Transaction failed: ${revertReason ?? String(sendErr)}`, statusCode: 500, success: false } as ErrorResponse;
            }
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
}

export const marketPlace = new MarketPlace();