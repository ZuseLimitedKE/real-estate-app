import { describe, it } from "mocha";
import { expect } from "chai";
import { AccountId, ContractId, AccountCreateTransaction, Hbar, PrivateKey, TokenAssociateTransaction, ContractExecuteTransaction, ContractFunctionParameters } from "@hashgraph/sdk";
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
    getAssociatedTokens
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
        // const contractId = "0.0.1037"
        console.log(`contract deployed at: ${contractId}`);
        setContractId(contractId);
    });
    it("Should just test if testing works", async function () {
        const contractId = getContractId();
        console.log("Using contract id:", contractId);
        expect(true).to.equal(true);
    });
    it("should associate a token to the contract", async () => {
        const token = await mintToken("testToken", "TT", OPERATOR_ID, client, OPERATOR_KEY);
        const evmTokenAddress = `0x${token.toEvmAddress()}`;
        console.log("Minted token:", evmTokenAddress);
        const contractId = getContractId();
        const txTokenAssociate = await new ContractExecuteTransaction()
            .setContractId(contractId)
            .setGas(4_000_000)
            .setFunction("tokenAssociate", new ContractFunctionParameters().addAddress(evmTokenAddress))
            .setMaxTransactionFee(new Hbar(5))
            .freezeWith(client);
        console.log("Associating token to contract:", token.toString());
        // Sign the transaction with the operator key
        const signTxTokenAssociate = await txTokenAssociate.sign(OPERATOR_KEY);
        const txTokenAssociateResponse = await signTxTokenAssociate.execute(client);
        //Get associated tokens
        // Wait for the association transaction to be confirmed before querying associated tokens
        await txTokenAssociateResponse.getReceipt(client);
        const associatedTokens = await getAssociatedTokens(OPERATOR_ID.toString());
        console.log("Associated tokens:", associatedTokens);
        expect(associatedTokens).to.include(token.toString());
    });

})
