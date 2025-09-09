declare global {
    namespace NodeJS {
        interface ProcessEnv {
            AUTH_SECRET: string;
            NEXTAUTH_URL: string;

            MONGODB_URI: string;
            MONGODB_DB_NAME: string;

            SMTP_HOST: string;
            SMTP_PORT: string;
            SMTP_SECURE: string;
            SMTP_USER: string;
            SMTP_PASSWORD: string;
            FROM_EMAIL: string;

            PLATFORM_NAME: string;
            FRONTEND_URL: string;
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
        }
    }
}