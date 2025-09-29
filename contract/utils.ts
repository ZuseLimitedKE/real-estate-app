import "dotenv/config"
import path from "path"
import fs from "fs"
import { AccountId, Client, EvmAddress, PrivateKey } from "@hashgraph/sdk"

export function getEnv() {
    const network = process.env.NETWORK
    console.log("NETWORK:", network);
    if (!network) {
        throw new Error("NETWORK ENV VAR NOT SET")
    }
    const PRIVATE_KEY = process.env.PRIVATE_KEY

    const ACCOUNT_ID = process.env.ACCOUNT_ID
    // const ADDRESS= process.env.ADDRESS

    const TPRIVATE_KEY = process.env.TPRIVATE_KEY
    const TACCOUNT_ID = process.env.TACCOUNT_ID
    // const TADDRESS= process.env.TADDRESS

    if (network == 'localnet') {
        return {
            PRIVATE_KEY: PrivateKey.fromStringECDSA(PRIVATE_KEY!),
            ACCOUNT_ID: AccountId.fromString(ACCOUNT_ID!),
            // ADDRESS: EvmAddress.fromString(ADDRESS!),
            NETWORK: network
        }
    }
    else {
        return {
            PRIVATE_KEY: PrivateKey.fromStringECDSA(TPRIVATE_KEY!),
            ACCOUNT_ID: AccountId.fromString(TACCOUNT_ID!),
            // ADDRESS: EvmAddress.fromString(TADDRESS!),
            NETWORK: network
        }
    }
}

/**
 * 
 * @returns Client
 */
export const getClient = () => {
    const env = getEnv()

    if (env.NETWORK == "localnet") {
        const client = Client.forLocalNode()
        client.setOperator(env.ACCOUNT_ID, env.PRIVATE_KEY)
        return client
    } else {
        const client = Client.forTestnet()
        client.setOperator(env.ACCOUNT_ID, env.PRIVATE_KEY)
        return client
    }
}

