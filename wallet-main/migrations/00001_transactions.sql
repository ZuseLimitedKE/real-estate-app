-- +goose Up
-- +goose StatementBegin

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) NOT NULL,
    hedera_account_id VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL,
    amount_ksh DECIMAL(15,2) NOT NULL,
    amount_usdc DECIMAL(15,6) NOT NULL,
    exchange_rate DECIMAL(10,4) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    mpesa_checkout_id VARCHAR(50),
    mpesa_receipt_number VARCHAR(50),
    hedera_tx_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_type CHECK (type IN ('onramp', 'offramp')),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'initiated', 'confirmed', 'settled', 'failed'))
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE transactions;
DROP EXTENSION IF EXISTS "uuid-ossp";
-- +goose StatementEnd