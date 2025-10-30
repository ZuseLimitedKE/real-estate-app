import { describe, it } from "mocha";
import { expect } from "chai";
import {
    AccountId, ContractId, AccountCreateTransaction, Hbar, PrivateKey, TokenAssociateTransaction,
    ContractExecuteTransaction, ContractFunctionParameters, TokenId,
    AccountAllowanceApproveTransaction
} from "@hashgraph/sdk";
import {
    getClient, deploy, call, query, setMaxTransactionFee, setMaxQueryPayment, setDefaultGas, setClient, setContractId, getOperatorId,
    getOperatorKey, getEnv, mintToken, getContractId, getAssociatedTokens, setTokenId, getTokenId, allowanceApproval, getNonce,
    getTokenBalances, getUserAccount, getUserEnvs, getUSDCAddress, encodeFunctionParameters, setBuyerNonce,
    setSellerNonce,
    getBuyerNonce,
    getSellerNonce
} from "../test-utils.js";
import fs from "fs";
import { network } from "hardhat";
import { signBuyOrder, signSellOrder } from "../settle-util.js";
import { hexToBytes } from "viem";
const abiStr = fs.readFileSync(`./artifacts/contracts/MarketPlace.sol/MarketPlace.json`, 'utf-8')
describe("MarketPlace Contract", function () {
    console.log("Starting this");

    const env = getEnv()
    const { USER1_KEY, USER1_ID, USER2_KEY, USER2_ID, NETWORK } = getUserEnvs();
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
    const BUYER = getUserAccount(USER1_KEY, USER1_ID, NETWORK as "localnet" | "testnet" | "mainnet");//Buys property tokens
    const SELLER = getUserAccount(USER2_KEY, USER2_ID, NETWORK as "localnet" | "testnet" | "mainnet");//Sells property tokens
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
        // let parameters = [];
        // deploy the contract
        const abi = JSON.parse(abiStr) as { abi: any, bytecode: string }
        //Mint USDC token on the buyer's account
        const contractId = await deploy("MarketPlace", abi.bytecode, BUYER.accountId, BUYER.privateKey, BUYER.client);
        // const contractId = "0.0.1038"
        console.log(`contract deployed at: ${contractId}`);
        setContractId(contractId);
    });
    it("should associate a token to the contract", async () => {
        //Associate both the residential token and USDC to the contract
        const token = await mintToken("ABC apartments Unit 33", "ABC3", SELLER.accountId, SELLER.client, SELLER.privateKey);
        const usdcToken = getUSDCAddress();
        console.log("USDC token id", usdcToken);
        console.log("Property token id", token.toString());
        setTokenId(token.toString());
        const evmTokenAddress = `0x${token.toEvmAddress()}`;
        const usdcEVMAddress = `0x${TokenId.fromString(usdcToken).toEvmAddress()}`;
        const contractId = getContractId();
        //Tx for property token
        const txTokenAssociate = await new ContractExecuteTransaction()
            .setContractId(contractId)
            .setGas(4_000_000)
            .setFunction("tokenAssociate", new ContractFunctionParameters().addAddress(evmTokenAddress))
            .setMaxTransactionFee(new Hbar(5))
            .freezeWith(client);

        //Sign and execute the property token transaction
        const signTxTokenAssociate = await txTokenAssociate.sign(OPERATOR_KEY);
        const txTokenAssociateResponse = await signTxTokenAssociate.execute(client);
        const receipt = await txTokenAssociateResponse.getReceipt(client);
        const status = receipt.status;

        //Tx for USDC token
        const usdctokenAssociate = await new ContractExecuteTransaction()
            .setContractId(contractId)
            .setGas(4_000_000)
            .setFunction("tokenAssociate", new ContractFunctionParameters().addAddress(usdcEVMAddress))
            .setMaxTransactionFee(new Hbar(5))
            .freezeWith(client);
        //Sign and execute the usdc transaction
        const signTxUSDCAssociate = await usdctokenAssociate.sign(OPERATOR_KEY);
        const txUSDCAssociateResponse = await signTxUSDCAssociate.execute(client);
        const receiptUSDC = await txUSDCAssociateResponse.getReceipt(client);
        const statusUSDC = receiptUSDC.status;

        expect(status.toString()).to.equal("SUCCESS");
        expect(statusUSDC.toString()).to.equal("SUCCESS");

    });
    it("should allow users to associate tokens to their accounts", async () => {
        //Associate the property token and USDC to the buyer and seller accounts
        const tokenId = getTokenId();
        const usdcToken = getUSDCAddress();
        const propertyTokenAssociatetx = await new TokenAssociateTransaction()
            .setAccountId(BUYER.accountId)
            .setTokenIds([TokenId.fromString(tokenId)])
            .freezeWith(BUYER.client);
        const signPropertyTokenAssociate = await propertyTokenAssociatetx.sign(BUYER.privateKey);
        const propertyTokenAssociateResponse = await signPropertyTokenAssociate.execute(BUYER.client);
        const receipt = await propertyTokenAssociateResponse.getReceipt(BUYER.client);
        console.log("Property token associate receipt", receipt.status.toString());
        expect(receipt.status.toString()).to.equal("SUCCESS");

        //Associate USDC token to the buyer
        const usdcTokenAssociateTx = await new TokenAssociateTransaction()
            .setAccountId(SELLER.accountId)
            .setTokenIds([TokenId.fromString(usdcToken)])
            .freezeWith(SELLER.client);
        const signUSDCAssociate = await usdcTokenAssociateTx.sign(SELLER.privateKey);
        const usdcTokenAssociateResponse = await signUSDCAssociate.execute(SELLER.client);
        const receiptUSDC = await usdcTokenAssociateResponse.getReceipt(SELLER.client);
        console.log("USDC token associate receipt", receiptUSDC.status.toString());
        expect(receiptUSDC.status.toString()).to.equal("SUCCESS");

    })
    it("should allow a user to give allowance to the contract", async () => {
        //give allowance to the contract on both the property token and USDC
        const tokenId = getTokenId();
        const usdcToken = getUSDCAddress();
        const contractId = getContractId();
        const usdcAllowanceReceipt = await allowanceApproval(usdcToken, BUYER.accountId.toString(), contractId, 100* 10 ** 6, BUYER.privateKey, BUYER.client);
        const allowanceReceipt = await allowanceApproval(tokenId, SELLER.accountId.toString(), contractId, 100* 10 ** 6, SELLER.privateKey, SELLER.client);
        expect(allowanceReceipt.status.toString()).to.equal("SUCCESS");
        expect(usdcAllowanceReceipt.status.toString()).to.equal("SUCCESS");
    })
    it("Should allow a user to deposit token to contract", async () => {
        //Both buyer and seller deposit tokens to the contract
        const contractId = getContractId();
        const tokenId = getTokenId();
        const usdcToken = getUSDCAddress();

        const evmTokenAddress = `0x${TokenId.fromString(tokenId).toEvmAddress()}`;
        const evmUSDCAddress = `0x${TokenId.fromString(usdcToken).toEvmAddress()}`;
        //Deposit property token by the seller
        const txDeposit = await new ContractExecuteTransaction()
            .setContractId(contractId)
            .setGas(4_000_000)
            .setFunction("depositToken", new ContractFunctionParameters().addAddress(evmTokenAddress).addUint256(100* 10 ** 6))
            .setMaxTransactionFee(new Hbar(5))
            .freezeWith(SELLER.client);
        const signTxDeposit = await txDeposit.sign(SELLER.privateKey);
        const txDepositResponse = await signTxDeposit.execute(SELLER.client);
        const receipt = await txDepositResponse.getReceipt(SELLER.client);
        console.log("Deposit Property token receipt", receipt.status.toString());
        //Deposit USDC by the buyer
        const txUSDCDeposit = await new ContractExecuteTransaction()
            .setContractId(contractId)
            .setGas(4_000_000)
            .setFunction("depositToken", new ContractFunctionParameters().addAddress(evmUSDCAddress).addUint256(100* 10 ** 6))
            .setMaxTransactionFee(new Hbar(5))
            .freezeWith(BUYER.client);
        const signTxUSDCDeposit = await txUSDCDeposit.sign(BUYER.privateKey);
        const txUSDCDepositResponse = await signTxUSDCDeposit.execute(BUYER.client);
        const receiptUSDC = await txUSDCDepositResponse.getReceipt(BUYER.client);
        console.log("Deposit USDC token receipt", receiptUSDC.status.toString());
        expect(receiptUSDC.status.toString()).to.equal("SUCCESS");
        expect(receipt.status.toString()).to.equal("SUCCESS");
    })
    it("should allow a user to initialize a buy order", async () => {
        //Buyer should initialize a buy order
        const contractId = getContractId();
        const usdcTokenId = getUSDCAddress();
        const evmTokenAddress = `0x${TokenId.fromString(usdcTokenId).toEvmAddress()}`;
        const nonce = getNonce();
        setBuyerNonce(nonce);
        const txInitBuyOrder = await new ContractExecuteTransaction()
            .setContractId(contractId)
            .setGas(4_000_000)
            .setFunction("initBuyOrder", new ContractFunctionParameters()
                .addUint64(nonce)
                .addAddress(evmTokenAddress)
                .addUint64(50* 10 ** 6)
            )
            .setMaxTransactionFee(new Hbar(5))
            .freezeWith(BUYER.client);
        const signTxInitBuyOrder = await txInitBuyOrder.sign(BUYER.privateKey);
        const txInitBuyOrderResponse = await signTxInitBuyOrder.execute(BUYER.client);
        const receipt = await txInitBuyOrderResponse.getReceipt(BUYER.client);
        expect(receipt.status.toString()).to.equal("SUCCESS");
    })
    it("should allow a user to initialize a sell order", async () => {
        const contractId = getContractId();
        const tokenId = getTokenId();
        const evmTokenAddress = `0x${TokenId.fromString(tokenId).toEvmAddress()}`;
        const nonce = getNonce();
        setSellerNonce(nonce);
        const txInitBuyOrder = await new ContractExecuteTransaction()
            .setContractId(contractId)
            .setGas(4_000_000)
            .setFunction("initSellOrder", new ContractFunctionParameters()
                .addUint64(nonce)
                .addAddress(evmTokenAddress)
                .addUint64(50* 10 ** 6)
            )
            .setMaxTransactionFee(new Hbar(5))
            .freezeWith(SELLER.client);
        const signTxInitBuyOrder = await txInitBuyOrder.sign(SELLER.privateKey);
        const txInitBuyOrderResponse = await signTxInitBuyOrder.execute(SELLER.client);
        const receipt = await txInitBuyOrderResponse.getReceipt(SELLER.client);
        expect(receipt.status.toString()).to.equal("SUCCESS");
    })
    it("should test that a trade can settle onchain as expected", async () => {
        const generateExpiry = () => Math.floor(Date.now() / 1000) + 24 * 60 * 60; // expires in 24h

        const contractId = getContractId();
        const buyOrder = {
            maker: `0x${BUYER.accountId.toEvmAddress()}` as `0x${string}`,
            propertyToken: `0x${TokenId.fromString(getTokenId()).toEvmAddress()}` as `0x${string}`,
            remainingAmount: 50,
            pricePerShare: 0.5 * 10 ** 6, //accounting for USDC decimals
            expiry: generateExpiry(),
            type: "BuyOrder",
            nonce: getBuyerNonce()

        }
        const sellOrder = {
            maker: `0x${SELLER.accountId.toEvmAddress()}` as `0x${string}`,
            propertyToken: `0x${TokenId.fromString(getTokenId()).toEvmAddress()}` as `0x${string}`,
            remainingAmount: 50,
            pricePerShare: 0.5 * 10 ** 6, //accounting for USDC decimals
            expiry: generateExpiry(),
            type: "SellOrder",
            nonce: getSellerNonce()
        }
        const { type: _bt, ...buyOrderNoType } = buyOrder;
        const { type: _st, ...sellOrderNoType } = sellOrder;
        const params = encodeFunctionParameters("settle", [buyOrderNoType,  sellOrderNoType]);
        const txSettleTrade = await new ContractExecuteTransaction()
            .setContractId(contractId)
            .setFunctionParameters(params)
            .setGas(5_000_000)
            .setMaxTransactionFee(new Hbar(10))
            .freezeWith(client);
        const signTxSettleTrade = await txSettleTrade.sign(OPERATOR_KEY);
        const txSettleTradeResponse = await signTxSettleTrade.execute(client);
        const receipt = await txSettleTradeResponse.getReceipt(client);
        console.log("Settle trade receipt", receipt.status.toString());
        expect(receipt.status.toString()).to.equal("SUCCESS");
    })
    it.skip("Should confirm the balances of the investors", async()=>{
        //Check whether buyer got the property tokens
        //check whether seller got the usdc
        const buyerTokens = await getTokenBalances(BUYER.accountId.toString());
        const sellerTokens = await getTokenBalances(SELLER.accountId.toString());
        console.log("Buyer token balances", buyerTokens);
        console.log("Seller token balances", sellerTokens);
    })

})
