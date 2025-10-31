-- +goose Up
-- +goose StatementBegin

CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id),
    source VARCHAR(50) NOT NULL DEFAULT 'mpesa',
    payload JSONB NOT NULL,
    status_code INT NOT NULL,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT FALSE,
    CONSTRAINT valid_source CHECK (source = 'mpesa')
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE webhooks;
-- +goose StatementEnd