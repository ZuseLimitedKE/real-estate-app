declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GOOGLE_PLACES_API_KEY: string;

      UPLOADTHING_TOKEN: string;

      HEDERA_RPC_URL: string;
      HEDERA_ACCOUNT: string;
      REAL_ESTATE_MANAGER_CONTRACT: string;

      AUTH_SECRET: string;
      NEXTAUTH_URL: string;

      MONGODB_URI: string;
      MONGODB_DB_NAME: string;

      SMTP_HOST: string;
      SMTP_PORT: string; // numeric string, e.g. "465"
      SMTP_SECURE: string; // "true" | "false"
      SMTP_USER: string;
      SMTP_PASSWORD: string;
      FROM_EMAIL: string;

      PLATFORM_NAME: string;
      FRONTEND_DEV_URL: string;
      FRONTEND_PROD_URL: string;
      NODE_ENV: string;

      UPLOAD_MAX_SIZE?: string;
      UPLOAD_ALLOWED_TYPES?: string;

      RATE_LIMIT_MAX_REQUESTS?: string;
      RATE_LIMIT_WINDOW_MS?: string;

      HEDERA_NETWORK?: string;
      HEDERA_ACCOUNT_ID?: string;
      HEDERA_PRIVATE_KEY?: string;

      SECURITY_HEADERS_ENABLED?: string;

      LOG_LEVEL?: string;
      LOG_FILE?: string;

      NEXT_PUBLIC_DEV_MODE?: string;

      JWT_ACCESS_SECRET: string;
      JWT_REFRESH_SECRET: string;
      JWT_ACCESS_EXPIRY: string; // seconds (numeric string)
      JWT_REFRESH_EXPIRY: string; // seconds (numeric string)
      JWT_ISSUER: string;
      NEXT_PUBLIC_MARKETPLACE_CONTRACT: string;
      DEPLOYER_PRIVATE_KEY: string;
      DEPLOYER_ACCOUNT: string;
      INITIAL_OWNER: string;
      FEE_COLLECTOR: string;
      USDC_TOKEN: string;
      ENVIRONMENT: string;
    }
  }
}
