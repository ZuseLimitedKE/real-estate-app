declare global{
    namespace NodeJS {
        interface ProcessEnv {
            INITIAL_OWNER: string;
            USDC_TOKEN: string;
            FEE_COLLECTOR: string;
            NETWORK: string;
            PRIVATE_KEY: string;
            ACCOUNT_ID: string;
            // ADDRESS?: string;
            TPRIVATE_KEY: string;
            TACCOUNT_ID: string;
            // TADDRESS?: string;
        }
    }
}
export { }