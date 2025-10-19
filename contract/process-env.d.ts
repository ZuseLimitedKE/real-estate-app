declare global{
    namespace NodeJS {
        interface ProcessEnv {
            INITIAL_OWNER: string;
            USDC_TOKEN: string;
            FEE_COLLECTOR: string;
            NETWORK: string;
            PRIVATE_KEY: string;
            ACCOUNT_ID: string;
            ORDER_MAKER_PRIVATE_KEY: string;
            ORDER_MAKER_ACCOUNT_ID: string;
            LOCAL_CONTRACT_ID: string;
        }
    }
}
export { }