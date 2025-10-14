import { describe, it } from "mocha";
import { expect } from "chai";
import {
    AccountId, ContractId, AccountCreateTransaction, Hbar, PrivateKey, TokenAssociateTransaction,
    ContractExecuteTransaction, ContractFunctionParameters, TokenId,
    AccountAllowanceApproveTransaction
} from "@hashgraph/sdk";
import {
    getClient,
    deploy,
    call,
    query,
    setMaxTransactionFee,
    setMaxQueryPayment,
    setDefaultGas,
    setClient,
    setContractId,
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
    getTokenBalances
} from "../test-utils.js";
import fs from "fs";
const abiStr = fs.readFileSync(`./artifacts/contracts/MarketPlace.sol/MarketPlace.json`, 'utf-8')
describe("MarketPlace Contract", function () {

    const env = getEnv()
    let OPERATOR_KEY: PrivateKey;
    let OPERATOR_ID: AccountId;
    if (env.NETWORK == "localnet") {
        OPERATOR_KEY = env.LPRIVATE_KEY!;
        OPERATOR_ID = env.LACCOUNT_ID!;
    }
    else {
        OPERATOR_KEY = env.PRIVATE_KEY!;
        OPERATOR_ID = env.ACCOUNT_ID!;
    }
    const client = getClient()

    this.timeout(0);
    before(async () => {
        console.log(`starting Markeplace tests`);
        // you may want to override default tx fee and payments (in hbar) globally here
        // setMaxTransactionFee(10);
        // setMaxQueryPayment(10);
        // or do it per call/query

        // set the default gas
        setDefaultGas(200_000);

        // deploy the contract
        // if you already know the contract Id, you may do this instead
        // setContractId(ContractId.fromString("0.0.contractNumber"));
        // constructor parameters
        let parameters = [];
        // deploy the contract
        const abi = JSON.parse(abiStr) as { abi: any, bytecode: string }
        const contractId = await deploy("MarketPlace", abi.bytecode);
        // const contractId = "0.0.1046"
        console.log(`contract deployed at: ${contractId}`);
        setContractId(contractId);
    });
    it("Should just test if testing works", async function () {
        const contractId = getContractId();
        expect(true).to.equal(true);
    });
    it("should associate a token to the contract", async () => {
        const token = await mintToken("testToken", "TT", OPERATOR_ID, client, OPERATOR_KEY);
        setTokenId(token.toString());
        const evmTokenAddress = `0x${token.toEvmAddress()}`;
        const contractId = getContractId();
        const txTokenAssociate = await new ContractExecuteTransaction()
            .setContractId(contractId)
            .setGas(4_000_000)
            .setFunction("tokenAssociate", new ContractFunctionParameters().addAddress(evmTokenAddress))
            .setMaxTransactionFee(new Hbar(5))
            .freezeWith(client);
        const signTxTokenAssociate = await txTokenAssociate.sign(OPERATOR_KEY);
        const txTokenAssociateResponse = await signTxTokenAssociate.execute(client);
        const receipt = await txTokenAssociateResponse.getReceipt(client);
        const status = receipt.status;
        expect(status.toString()).to.equal("SUCCESS");
    });
    it("should allow a user to give allowance to the contract", async () => {
        const contractId = getContractId();
        const tokenId = getTokenId();
        const allowanceReceipt = await allowanceApproval(tokenId, OPERATOR_ID.toString(), contractId, 100, OPERATOR_KEY, client);
        expect(allowanceReceipt.status.toString()).to.equal("SUCCESS");
    })
    it("Should allow a user to deposit token to contract", async () => {
        const contractId = getContractId();
        const tokenId = getTokenId();
        const evmTokenAddress = `0x${TokenId.fromString(tokenId).toEvmAddress()}`;
        const txDeposit = await new ContractExecuteTransaction()
            .setContractId(contractId)
            .setGas(4_000_000)
            .setFunction("depositToken", new ContractFunctionParameters().addAddress(evmTokenAddress).addUint256(100))
            .setMaxTransactionFee(new Hbar(5))
            .freezeWith(client);
        const signTxDeposit = await txDeposit.sign(OPERATOR_KEY);
        const txDepositResponse = await signTxDeposit.execute(client);
        const receipt = await txDepositResponse.getReceipt(client);
        expect(receipt.status.toString()).to.equal("SUCCESS");
    })
    it("should allow a user to initialize a buy order", async () => {
        const contractId = getContractId();
        const tokenId = getTokenId();
        const evmTokenAddress = `0x${TokenId.fromString(tokenId).toEvmAddress()}`;
        const nonce = getNonce();
        const txInitBuyOrder = await new ContractExecuteTransaction()
            .setContractId(contractId)
            .setGas(4_000_000)
            .setFunction("initBuyOrder", new ContractFunctionParameters()
                .addUint64(nonce)
                .addAddress(evmTokenAddress)
                .addUint64(50)
            )
            .setMaxTransactionFee(new Hbar(5))
            .freezeWith(client);
        const signTxInitBuyOrder = await txInitBuyOrder.sign(OPERATOR_KEY);
        const txInitBuyOrderResponse = await signTxInitBuyOrder.execute(client);
        const receipt = await txInitBuyOrderResponse.getReceipt(client);
        expect(receipt.status.toString()).to.equal("SUCCESS");
    })
     it("should allow a user to initialize a sell order", async () => {
        const contractId = getContractId();
        const tokenId = getTokenId();
        const evmTokenAddress = `0x${TokenId.fromString(tokenId).toEvmAddress()}`;
        const nonce = getNonce();
        const txInitBuyOrder = await new ContractExecuteTransaction()
            .setContractId(contractId)
            .setGas(4_000_000)
            .setFunction("initSellOrder", new ContractFunctionParameters()
                .addUint64(nonce)
                .addAddress(evmTokenAddress)
                .addUint64(20)
            )
            .setMaxTransactionFee(new Hbar(5))
            .freezeWith(client);
        const signTxInitBuyOrder = await txInitBuyOrder.sign(OPERATOR_KEY);
        const txInitBuyOrderResponse = await signTxInitBuyOrder.execute(client);
        const receipt = await txInitBuyOrderResponse.getReceipt(client);
        expect(receipt.status.toString()).to.equal("SUCCESS");
    })


})
