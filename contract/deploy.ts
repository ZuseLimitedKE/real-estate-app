import "dotenv/config"
import { Client, ContractCreateFlow, ContractCreateTransaction, Hbar, PrivateKey, ContractFunctionParameters } from "@hashgraph/sdk";
import { getClient } from "./utils.js";
import fs from "node:fs"
// import { testStore } from "./lib/test-store";


async function deploy(contractName: string, byteCode: string) {
    // console.log("Bytecode", byteCode);
    const client = getClient()
    const _initialOwner = process.env.INITIAL_OWNER!
    const _usdcToken = process.env.USDC_TOKEN!
    const feeCollector = process.env.FEE_COLLECTOR!
    const _feeBps = 100
    console.log(`Deploying contract: ${contractName}`)
    const contractDeployTx = await new ContractCreateFlow()
        .setBytecode(byteCode)
        .setConstructorParameters(new ContractFunctionParameters()
            .addAddress(_initialOwner)
            .addAddress(_usdcToken)
            .addAddress(feeCollector)
            .addUint32(_feeBps)
        )
        .setGas(9_000_000)
        .execute(client)

    const contractReceipt = await contractDeployTx.getReceipt(client)

    console.log(`Contract ID: ${contractReceipt.contractId}`)
    // testStore.set(contractName, contractReceipt.contractId?.toString() ?? "")
}

async function main() {

    // get contract abi at ./abi/MarketPlace.json
    const abiStr = fs.readFileSync(`./artifacts/contracts/MarketPlace.sol/MarketPlace.json`, 'utf-8')
    // console.log("abiStr:", abiStr);
    const abi = JSON.parse(abiStr) as { abi: any, bytecode: string }
    // console.log("abi:", abi.bytecode);

    await deploy("MarketPlace", abi.bytecode)

}

main()