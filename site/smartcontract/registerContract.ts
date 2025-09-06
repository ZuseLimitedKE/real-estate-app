import {Web3} from 'web3';
import abi from "../realEstaetManagerABI.json";

export interface RegisterPropertyContract {
    propertyID: string,
    tokenSymbol: string,
    propertyName: string,
    numTokens: number,
    agentAddress: string,
    timeCreated: Date,
    propertyAddress: string,
    serviceFee: number
}

const web3 = new Web3(process.env.HEDERA_RPC_URL!);
const account = web3.eth.accounts.wallet.add(process.env.HEDERA_ACCOUNT!);
const contract = new web3.eth.Contract(abi.abi, process.env.REAL_ESTATE_MANAGER_CONTRACT!);

class RealEstateManagerContract {
    async register(args: RegisterPropertyContract): Promise<{tokenID: string | undefined, txHash: string}> {
        try {
            const tx = await contract.methods.registerProperty(
                args.propertyID,
                args.tokenSymbol,
                args.propertyName,
                BigInt(args.numTokens),
                args.agentAddress,
                BigInt(args.timeCreated.getTime()),
                args.propertyAddress,
                BigInt(args.serviceFee)
            ).send({from: account[0].address});

            const tokenID = tx.events?.PropertyRegistered?.returnValues?.id

            return {txHash: tx.transactionHash, tokenID: tokenID ? tokenID as string : undefined};
        } catch(err) {
            console.error("Error registering property in contract", err);
            throw new Error("Error registering contract");
        }
    }
}

const realEstateManagerContract = new RealEstateManagerContract();
export default realEstateManagerContract;