/*-
 *
 * Smart Contracts Libs Labs
 *
 * Copyright (C) 2019 - 2021 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import {
    Client,
    ContractCreateTransaction,
    ContractExecuteTransaction,
    FileCreateTransaction,
    AccountId,
    Hbar,
    PrivateKey, ContractCallQuery,
    ContractCreateFlow,
    ContractFunctionParameters,
    TokenCreateTransaction,
    TokenType,
    TokenId,
    AccountAllowanceApproveTransaction,
} from "@hashgraph/sdk";

import { Interface } from "@ethersproject/abi";
import fs from "fs";
import * as dotenv from "dotenv";
import "dotenv/config";
const abiStr = fs.readFileSync(`./artifacts/contracts/MarketPlace.sol/MarketPlace.json`, 'utf-8')
// console.log("abiStr:", abiStr);
const abi = JSON.parse(abiStr) as { abi: any, bytecode: string }
let client: Client;
let abiInterface = new Interface(abi.abi);
// let abiInterface;
let contractId: string;
let maxTransactionFee = new Hbar(5);
let maxQueryPayment = new Hbar(5);
let defaultGas = 100_000;
let token: string;
let usdcAddress: string;
function getOperatorId() {
    return process.env.ACCOUNT_ID!;
}
function getOperatorKey() {
    return process.env.PRIVATE_KEY!;
}

function setClient(newClient: Client) {
    client = newClient;
}
function setContractId(newContractId: string) {
    contractId = newContractId;
}
function setMaxTransactionFee(newMaxfee: number) {
    maxTransactionFee = new Hbar(newMaxfee);
}

function setMaxQueryPayment(newMaxPaymentHbar: number) {
    maxQueryPayment = new Hbar(newMaxPaymentHbar);
}

function setDefaultGas(newDefaultGas: number) {
    defaultGas = newDefaultGas;
}

async function deploy(contractName: string, byteCode: string, usdcOwner: AccountId, usdcOwnerKey: PrivateKey, usdcOwnerclient: Client): Promise<string> {
    // console.log("Bytecode", byteCode);
    console.log(`Deploying contract: ${contractName}`);
    const env = getEnv()
    let OPERATOR_KEY: PrivateKey;
    let OPERATOR_ID: AccountId;
    let MIRROR_NODE_URL: string;
    if (env.NETWORK == "localnet") {
        OPERATOR_KEY = env.LPRIVATE_KEY!;
        OPERATOR_ID = env.LACCOUNT_ID!;
        MIRROR_NODE_URL = process.env.LMIRROR_NODE_URL!
    }
    else {
        OPERATOR_KEY = env.PRIVATE_KEY!;
        OPERATOR_ID = env.ACCOUNT_ID!;
        MIRROR_NODE_URL = process.env.MIRROR_NODE_URL!
    }
    const client = getClient()

    const usdc_address = await mintToken("USDC", "USDC", usdcOwner, usdcOwnerclient, usdcOwnerKey);
    setUSDCAddress(usdc_address.toString());
    const evmAddress = usdc_address.toEvmAddress();
    const _initialOwner = OPERATOR_ID.toEvmAddress();
    const feeCollector = OPERATOR_ID.toEvmAddress();
    const _feeBps = 100
    console.log(`Deploying contract: ${contractName}`)
    const contractDeployTx = await new ContractCreateFlow()
        .setBytecode(byteCode)
        .setConstructorParameters(new ContractFunctionParameters()
            .addAddress(_initialOwner)
            .addAddress(evmAddress)
            .addAddress(feeCollector)
            .addUint32(_feeBps)
        )
        .setGas(9_000_000)
        .execute(client)

    const contractReceipt = await contractDeployTx.getReceipt(client)

    console.log(`Contract ID: ${contractReceipt.contractId}`)
    // testStore.set(contractName, contractReceipt.contractId?.toString() ?? "")
    return contractReceipt.contractId!.toString();
}
async function mintToken(name: string, symbol: string, ACCOUNT_ID: AccountId, client: Client, PRIVATE_KEY: PrivateKey): Promise<TokenId> {
    const txTokenCreate = await new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setTokenType(TokenType.FungibleCommon)
        .setTreasuryAccountId(ACCOUNT_ID)
        .setInitialSupply(500)
        .freezeWith(client);
    const signTxTokenCreate = await txTokenCreate.sign(PRIVATE_KEY);
    const txTokenCreateResponse = await signTxTokenCreate.execute(client);
    const receiptTokenCreateTx = await txTokenCreateResponse.getReceipt(client);
    const tokenId = receiptTokenCreateTx.tokenId;

    return tokenId!;
}

async function call(functionName: string, parameters: any[], gas: number) {
    console.log(`calling ${functionName} with [${parameters}]`);

    // generate function call with function name and parameters
    const functionCallAsUint8Array = encodeFunctionParameters(functionName, parameters);

    const maxGas = gas ? gas : defaultGas;

    // execute the transaction
    const transaction = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setFunctionParameters(functionCallAsUint8Array)
        .setGas(maxGas)
        .execute(client);

    // a record contains the output of the function
    const record = await transaction.getRecord(client);
    // the result of the function call is in record.contractFunctionResult.bytes
    // let`s parse it using ethers.js
    const results = abiInterface!.decodeFunctionResult(functionName, record.contractFunctionResult!.bytes);
    console.log(results);
    return results;
}

async function query(functionName: string, parameters: any[], gas: number) {
    console.log(`querying ${functionName} with [${parameters}]`);

    // generate function call with function name and parameters
    const functionCallAsUint8Array = encodeFunctionParameters(functionName, parameters);

    const maxGas = gas ? gas : defaultGas;

    // execute the query
    const contractFunctionResult = await new ContractCallQuery()
        .setContractId(contractId)
        .setFunctionParameters(functionCallAsUint8Array)
        .setGas(maxGas)
        .execute(client);

    // the result of the function call is in the query
    // let`s parse it using ethers.js
    const results = abiInterface!.decodeFunctionResult(functionName, contractFunctionResult.bytes);
    console.log(results);
    return results;

}

/**
 * Helper function to encode function name and parameters that can be used to invoke a contract's function
 * @param functionName the name of the function to invoke
 * @param parameterArray an array of parameters to pass to the function
 */
function encodeFunctionParameters(functionName: string, parameterArray: any[]) {
    // build the call parameters using ethers.js
    // .slice(2) to remove leading '0x'
    const functionCallAsHexString = abiInterface!.encodeFunctionData(functionName, parameterArray).slice(2);
    // convert to a Uint8Array
    return Buffer.from(functionCallAsHexString, `hex`);
}
function getEnv() {
    const network = process.env.NETWORK
    console.log("NETWORK:", network);
    if (!network) {
        throw new Error("NETWORK ENV VAR NOT SET")
    }
    const PRIVATE_KEY = process.env.PRIVATE_KEY!
    const ACCOUNT_ID = process.env.ACCOUNT_ID!
    const LPRIVATE_KEY = process.env.LPRIVATE_KEY!
    const LACCOUNT_ID = process.env.LACCOUNT_ID!
    const MIRROR_NODE_URL = process.env.LMIRROR_NODE_URL!
    if (!PRIVATE_KEY || !ACCOUNT_ID) {
        throw new Error("PRIVATE_KEY or ACCOUNT_ID ENV VAR NOT SET")
    }
    if (!LPRIVATE_KEY || !LACCOUNT_ID) {
        throw new Error("LPRIVATE_KEY or LACCOUNT_ID ENV VAR NOT SET")
    }
    if (network == 'localnet') {
        return {
            LPRIVATE_KEY: PrivateKey.fromStringECDSA(LPRIVATE_KEY!),
            LACCOUNT_ID: AccountId.fromString(LACCOUNT_ID!),
            // ADDRESS: EvmAddress.fromString(ADDRESS!),
            NETWORK: network,
            MIRROR_NODE_URL: MIRROR_NODE_URL
        }
    }
    else {
        return {
            PRIVATE_KEY: PrivateKey.fromStringECDSA(PRIVATE_KEY!),
            ACCOUNT_ID: AccountId.fromString(ACCOUNT_ID!),
            // ADDRESS: EvmAddress.fromString(TADDRESS!),
            NETWORK: network,
            MIRROR_NODE_URL: MIRROR_NODE_URL
        }
    }
}
const getClient = () => {
    const env = getEnv()

    if (env.NETWORK == "localnet") {
        const client = Client.forLocalNode()
        client.setOperator(env.LACCOUNT_ID!, env.LPRIVATE_KEY!)
        return client
    } else {
        const client = Client.forTestnet()
        client.setOperator(env.ACCOUNT_ID!, env.PRIVATE_KEY!)
        return client
    }
}
function getContractId() {
    return contractId;
}
async function getAssociatedTokens(accountId: string): Promise<string[]> {
    const env = getEnv()
    let OPERATOR_KEY: PrivateKey;
    let OPERATOR_ID: AccountId;
    let MIRROR_NODE_URL: string;
    if (env.NETWORK == "localnet") {
        OPERATOR_KEY = env.LPRIVATE_KEY!;
        OPERATOR_ID = env.LACCOUNT_ID!;
        MIRROR_NODE_URL = process.env.LMIRROR_NODE_URL!
    }
    else {
        OPERATOR_KEY = env.PRIVATE_KEY!;
        OPERATOR_ID = env.ACCOUNT_ID!;
        MIRROR_NODE_URL = process.env.MIRROR_NODE_URL!
    }
    let tokens: string[] = [];
    let nextLink: string | null = `/api/v1/accounts/${accountId}/tokens?limit=100`;

    while (nextLink) {
        const response = await fetch(`${MIRROR_NODE_URL}${nextLink}`);
        const data: { tokens: { token_id: string }[], links: { next: string | null } } = await response.json() as { tokens: { token_id: string }[], links: { next: string | null } };
        tokens.push(...data.tokens.map(token => token.token_id));
        nextLink = data.links.next;
    }
    return tokens;
}
function setTokenId(tokenId: string) {
    token = tokenId;
}
function getTokenId(): string {
    return token;
}
async function allowanceApproval(tokenId: string, owner: string, spender: string, amount: number, ownerPrivateKey: PrivateKey, client: Client) {
    const allowanceTx = new AccountAllowanceApproveTransaction()
        .approveTokenAllowance(tokenId, owner, spender, amount)
        .freezeWith(client);
    const allowanceSign = await allowanceTx.sign(ownerPrivateKey);
    const allowanceSubmit = await allowanceSign.execute(client);
    const allowanceReceipt = await allowanceSubmit.getReceipt(client);

    return allowanceReceipt;
}
async function getTokenBalances(accountId: string): Promise<{ tokenId: string, balance: number }[]> {
    const env = getEnv()
    let OPERATOR_KEY: PrivateKey;
    let OPERATOR_ID: AccountId;
    let MIRROR_NODE_URL: string;
    if (env.NETWORK == "localnet") {
        OPERATOR_KEY = env.LPRIVATE_KEY!;
        OPERATOR_ID = env.LACCOUNT_ID!;
        MIRROR_NODE_URL = process.env.LMIRROR_NODE_URL!
    }
    else {
        OPERATOR_KEY = env.PRIVATE_KEY!;
        OPERATOR_ID = env.ACCOUNT_ID!;
        MIRROR_NODE_URL = process.env.MIRROR_NODE_URL!
    }
    let tokens: { tokenId: string, balance: number }[] = [];
    let nextLink: string | null = `/api/v1/accounts/${accountId}/balances?limit=100`;

    while (nextLink) {
        const response = await fetch(`${MIRROR_NODE_URL}${nextLink}`);
        const data = await response.json()
        return tokens
        nextLink = null
    }
    return tokens;
}
const getNonce = () => new Date().getTime();
function getUserAccount(operator_key: string, operator_id: string, network: "localnet" | "testnet" | "mainnet"): { client: Client, accountId: AccountId, privateKey: PrivateKey } {
    if (!operator_key || typeof operator_key !== "string") {
        throw new Error("Invalid or missing operator_key");
    }
    if (!operator_id || typeof operator_id !== "string") {
        throw new Error("Invalid or missing operator_id");
    }
    if (!network || !["localnet", "testnet", "mainnet"].includes(network)) {
        throw new Error("Invalid or missing network");
    }
    const privateKey = PrivateKey.fromStringECDSA(operator_key);
    const accountId = AccountId.fromString(operator_id);
    let client: Client;
    if (network == "localnet") {
        client = Client.forLocalNode();
    } else if (network == "testnet") {
        client = Client.forTestnet();
    } else {
        client = Client.forMainnet();
    }
    client.setOperator(accountId, privateKey);
    return { client, accountId, privateKey };
}
function getUserEnvs() {
    const USER1_KEY = process.env.USER1_KEY!
    const USER1_ID = process.env.USER1_ID!
    const USER2_KEY = process.env.USER2_KEY!
    const USER2_ID = process.env.USER2_ID!
    const NETWORK = process.env.NETWORK!
    if (!USER1_KEY || !USER1_ID) {
        throw new Error("USER1_KEY or USER1_ID ENV VAR NOT SET")
    }
    if (!USER2_KEY || !USER2_ID) {
        throw new Error("USER2_KEY or USER2_ID ENV VAR NOT SET")
    }
    if (!NETWORK) {
        throw new Error("NETWORK ENV VAR NOT SET")
    }
    return {
        USER1_KEY,
        USER1_ID,
        USER2_KEY,
        USER2_ID,
        NETWORK
    }
}
function setUSDCAddress(address: string) {
    usdcAddress = address;
}
function getUSDCAddress(): string {
    return usdcAddress;
}
let buyerNonce = 0;
let sellerNonce = 0;
function setBuyerNonce(nonce: number) {
    buyerNonce = nonce;
}
function setSellerNonce(nonce: number) {
    sellerNonce = nonce;
}
function getBuyerNonce(): number {
    return buyerNonce;
}
function getSellerNonce(): number {
    return sellerNonce;
}
export {
    deploy,
    call,
    query,
    setMaxTransactionFee,
    setMaxQueryPayment,
    setDefaultGas,
    setContractId,
    setClient,
    getClient,
    getOperatorId,
    getOperatorKey,
    getEnv,
    mintToken,
    getContractId,
    getAssociatedTokens,
    setTokenId,
    getTokenId,
    allowanceApproval,
    getNonce,
    getTokenBalances,
    getUserAccount,
    getUserEnvs,
    setUSDCAddress,
    getUSDCAddress,
    encodeFunctionParameters,
    setBuyerNonce,
    setSellerNonce,
    getBuyerNonce,
    getSellerNonce
}