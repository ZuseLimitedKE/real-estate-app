import { Web3 } from 'web3';
import { AccountId, Long, Client, PrivateKey, TokenBurnTransaction, TokenCreateTransaction, TokenInfoQuery, TokenType, TransferTransaction, TokenId } from "@hashgraph/sdk";
import { MyError } from '@/constants/errors';

export interface RegisterPropertyContract {
    tokenSymbol: string,
    propertyName: string,
    numTokens: number,
}

const rpcURL = process.env.HEDERA_RPC_URL;
const pkEnv = process.env.HEDERA_ACCOUNT;
const accountID = process.env.HEDERA_ACCOUNT_ID;
const contractAddress = process.env.REAL_ESTATE_MANAGER_CONTRACT;
const network = process.env.HEDERA_NETWORK || "testnet";

if (!rpcURL || !pkEnv || !contractAddress) {
    throw new Error("Invalid environment variable set up, set HEDERA_RPC_URL, HEDERA_ACCOUNT and REAL_ESTATE_MANAGER_CONTRACT in env variables");
}

const web3 = new Web3(rpcURL);

class RealEstateManagerContract {
    _getClientDetails(): { client: Client, operatorKey: PrivateKey, operatorID: AccountId } {
        try {
            if (!pkEnv || !accountID) {
                throw new Error("Invalid env setup, HEDERA_ACCOUNT or HEDERA_ACCOUNT_ID is not set");
            }

            const operatorKey = PrivateKey.fromStringECDSA(pkEnv);
            const operatorID = AccountId.fromString(accountID);

            // Create token for property
            const client = Client.forName(network).setOperator(operatorID, operatorKey);
            return { client, operatorID, operatorKey };
        } catch (err) {
            console.error("Could not get client", err);
            throw err;
        }
    }

    async register(args: RegisterPropertyContract): Promise<{ tokenID: string, txHash: string }> {
        try {
            const { client, operatorID, operatorKey } = this._getClientDetails();
            const tokenCreate = await new TokenCreateTransaction()
                .setTokenName(args.propertyName)
                .setTokenSymbol(args.tokenSymbol)
                .setTokenType(TokenType.FungibleCommon)
                .setDecimals(0)
                .setInitialSupply(args.numTokens)
                .setTreasuryAccountId(operatorID)
                .setSupplyKey(operatorKey)
                .execute(client);

            const tokenCreateReceipt = await tokenCreate.getReceipt(client);
            const tokenID = tokenCreateReceipt.tokenId;

            if (!tokenID) {
                throw new Error("Token ID is null after creation");
            }

            return { tokenID: tokenID.toString(), txHash: tokenCreate.transactionId.toString() };
        } catch (err) {
            console.error("Error registering property in contract", err);
            throw new Error(`Error registering contract: ${(err as Error).message}`);
        }
    }

    // This function should only be called if register tokens function fails
    async burnTokens(tokens: string[], retry: number = 0) {
        console.log(`Round ${retry} of burning tokens`);
        const { client, operatorID, operatorKey } = this._getClientDetails();

        if (retry > 5) {
            console.error("Maximum retries for burning tokens has been reached");
            throw new MyError("Maximum retries reached");
        }

        try {
            for (const tokenID of tokens) {
                const info = await new TokenInfoQuery().setTokenId(tokenID).execute(client);
                if (info.totalSupply > Long.fromNumber(0)) {
                    const burnTx = new TokenBurnTransaction()
                        .setTokenId(tokenID)
                        .setAmount(info.totalSupply)
                        .freezeWith(client);

                    const signTx = await burnTx.sign(operatorKey);
                    await signTx.execute(client);
                }

            }
        } catch (err) {
            await new Promise((r) => setTimeout(r, Math.min(1000 * (retry + 1), 5000)));
            this.burnTokens(tokens, retry + 1);
        }
    }

    // Accepts addressToSend and token as evm addresses
    async distributeFund(addressToSend: string, amount: number, token: string): Promise<string> {
        try {
            const tokenID = TokenId.fromEvmAddress(0, 0,token);

            const recepientID = AccountId.fromEvmAddress(0, 0, addressToSend);
            const { client, operatorID, operatorKey } = this._getClientDetails();
            //Create the transfer transaction
            const txTransfer = new TransferTransaction()
                .addTokenTransfer(tokenID, operatorID, -amount) //Fill in the token ID 
                .addTokenTransfer(tokenID, recepientID, amount) //Fill in the token ID and receiver account
                .freezeWith(client);

            //Sign with the sender account private key
            const signTxTransfer = await txTransfer.sign(operatorKey);

            //Sign with the client operator private key and submit to a Hedera network
            const txTransferResponse = await signTxTransfer.execute(client);

            //Get the Transaction ID
            const txTransferId = txTransferResponse.transactionId.toString();
            return txTransferId
        } catch (err) {
            console.error(`Error sending tokens to investor ${addressToSend}: ${amount}`, err);
            throw new Error("Could not deposit funds");
        }
    }
}

const realEstateManagerContract = new RealEstateManagerContract();
export default realEstateManagerContract;