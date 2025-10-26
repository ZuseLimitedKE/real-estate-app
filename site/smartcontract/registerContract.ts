import { Web3 } from 'web3';
import { AccountId, Long, Client, PrivateKey, TokenBurnTransaction, TokenCreateTransaction, TokenInfoQuery, TokenType, TransferTransaction, TokenId, Status, AccountBalanceQuery, Wallet } from "@hashgraph/sdk";
import { MyError } from '@/constants/errors';
import { addressSchema } from '@/types/property_details';

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

    async getPropertyTokensBalanceInAdmin(property_token_id: string): Promise<number> {
        try {
            if (!pkEnv || !accountID) {
                throw new Error("Invalid env setup, HEDERA_ACCOUNT or HEDERA_ACCOUNT_ID is not set");
            }
            const operatorKey = PrivateKey.fromStringECDSA(pkEnv);
            const operatorID = AccountId.fromString(accountID);
            const client = Client.forName(network).setOperator(operatorID, operatorKey);

            const balance = await new AccountBalanceQuery()
                .setAccountId(operatorID)
                .execute(client)

            if (!balance.tokens || !balance.tokenDecimals) {
                console.log("Whoops")
                // No other tokens owned
                return 0;
            } else {
                const rawTokenBalance = balance.tokens.get(property_token_id);
                const tokenDecimals = balance.tokenDecimals.get(property_token_id);

                if (!rawTokenBalance || tokenDecimals === null) {
                    return 0;
                }

                console.log("i am here")

                const tokenBalance = rawTokenBalance as Long;
                const numTokens = tokenBalance.toNumber() / Math.pow(10, tokenDecimals as number)
                return numTokens;
            }
        } catch (err) {
            console.error(`Error getting token balance for ${property_token_id} from contract`, err);
            throw new MyError("Could not get token balance");
        }
    }
    async transferTokensFromAdminToUser(address: string, tokenId: string, amount: number): Promise<string> {
        try {
            if (!pkEnv || !accountID) {
                throw new Error("Invalid env setup, HEDERA_ACCOUNT or HEDERA_ACCOUNT_ID is not set");
            }
            let accountId;
            if (address.startsWith("0x")) {
                accountId = AccountId.fromEvmAddress(0, 0, address).toString();
            }
            else {
                accountId = address
            }
            const operatorKey = PrivateKey.fromStringECDSA(pkEnv);
            const operatorID = AccountId.fromString(accountID);
            const client = Client.forName(network).setOperator(operatorID, operatorKey);
            const associatedTokens = await this.getAssociatedTokens(accountId);

            if (!associatedTokens.includes(tokenId)) {
                throw new MyError("User does not have the token associated");
            }

            const transferTx = await new TransferTransaction()
                .addTokenTransfer(tokenId, operatorID, -amount)
                .addTokenTransfer(tokenId, accountId, amount)
                .freezeWith(client);

            const signTx = await transferTx.sign(operatorKey);
            const txResponse = await signTx.execute(client);
            const receipt = await txResponse.getReceipt(client);

            if (receipt.status.toString() !== "SUCCESS") {
                throw new Error(`Failed to transfer tokens: ${receipt.status.toString()}`);
            }

            return txResponse.transactionId.toString();

        }
        catch (error) {
            console.error(`Error transferring tokens from admin to user: ${error}`);
            throw new MyError("Could not transfer tokens from admin to user");
        }

    }
    async getAssociatedTokens(accountId: string): Promise<string[]> {
        const NETWORK = process.env.ENVIRONMENT!
        if (!NETWORK) {
            throw new MyError("ENVIRONMENT variable is not set");
        }
        let MIRROR_NODE_URL: string;
        if (NETWORK == "localnet") {
            MIRROR_NODE_URL = "http://127.0.0.1:5551"
        }
        else if (NETWORK == "testnet") {
            MIRROR_NODE_URL = "https://testnet.mirrornode.hedera.com"
        }
        else if (NETWORK == "mainnet") {
            MIRROR_NODE_URL = "https://api.mainnet.mirrornode.hedera.com"
        }
        else {
            throw new Error("Unsupported network. Use 'testnet' or 'mainnet'.");
        }
        let tokens: string[] = [];
        let nextLink: string | null = `/api/v1/accounts/${accountId}/tokens?limit=100`;

        try {
            while (nextLink) {
                const response = await fetch(`${MIRROR_NODE_URL}${nextLink}`);
                if (!response.ok) {
                    throw new Error(`Mirror node API returned ${response.status}: ${response.statusText}`);
                }
                const data: { tokens: { token_id: string }[], links: { next: string | null } } = await response.json() as { tokens: { token_id: string }[], links: { next: string | null } };
                tokens.push(...data.tokens.map(token => token.token_id));
                nextLink = data.links.next;
            }
            return tokens;
        } catch (error) {
            console.error(`Error fetching associated tokens for ${accountId}:`, error);
            throw new MyError("Could not fetch associated tokens from mirror node");
        }
    }
    // Accepts addressToSend and token as evm addresses
    async distributeFund(addressToSend: string, amount: number, token: string): Promise<string> {
        try {
            if (!Number.isSafeInteger(amount)) {
                throw new MyError("Unsafe integer, can't use it in transaction");
            }
            const tokenIDParsed = addressSchema.safeParse(token);
            if (!tokenIDParsed.success) {
                throw new MyError("Invalid token address");
            }
            const tokenID = TokenId.fromEvmAddress(0, 0, tokenIDParsed.data);

            const recipientAddressParsed = addressSchema.safeParse(addressToSend);
            if (!recipientAddressParsed.success) {
                throw new MyError("Invalid recepient address");
            }
            const recipientID = AccountId.fromEvmAddress(0, 0, recipientAddressParsed.data);

            const { client, operatorID, operatorKey } = this._getClientDetails();

            const recepientAccountBalance = await new AccountBalanceQuery()
                .setAccountId(recipientID)
                .execute(client);

            const isAssociated = recepientAccountBalance.tokens?.get(tokenID) !== undefined;

            if (!isAssociated) {
                throw new MyError("User is not associated to USDC");
            }

            //Create the transfer transaction
            const txTransfer = new TransferTransaction()
                .addTokenTransfer(tokenID, operatorID, -(amount)) //Fill in the token ID 
                .addTokenTransfer(tokenID, recipientID, amount) //Fill in the token ID and receiver account
                .freezeWith(client);

            //Sign with the sender account private key
            const signTxTransfer = await txTransfer.sign(operatorKey);

            //Sign with the client operator private key and submit to a Hedera network
            const txTransferResponse = await signTxTransfer.execute(client);

            const receiptTransferTx = await txTransferResponse.getReceipt(client);
            const statusTransferTx = receiptTransferTx.status;

            //Get the Transaction ID
            const txTransferId = txTransferResponse.transactionId.toString();

            if (statusTransferTx === Status.Success) {
                return txTransferId
            }

            throw new MyError("Transaction not succeeded");
        } catch (err) {
            console.error(`Error sending tokens to investor ${addressToSend}: ${amount}`, err);
            if (err instanceof MyError) {
                throw err;
            }
            throw new Error("Could not deposit funds");
        }
    }
}

const realEstateManagerContract = new RealEstateManagerContract();
export default realEstateManagerContract;