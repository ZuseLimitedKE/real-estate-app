import { Web3 } from 'web3';
import { AccountId, Client, PrivateKey, TokenCreateTransaction, TokenType } from "@hashgraph/sdk";

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
    async register(args: RegisterPropertyContract): Promise<{ tokenID: string, txHash: string }> {
        try {
            if (!pkEnv || !accountID) {
                throw new Error("Invalid env setup, HEDERA_ACCOUNT or HEDERA_ACCOUNT_ID is not set");
            }

            const operatorKey = PrivateKey.fromStringECDSA(pkEnv);
            const operatorID = AccountId.fromString(accountID);
            
            // Create token for property
            const client = Client.forName(network).setOperator(operatorID, operatorKey);
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
}

const realEstateManagerContract = new RealEstateManagerContract();
export default realEstateManagerContract;