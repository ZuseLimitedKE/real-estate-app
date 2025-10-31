package stores

import (
	"database/sql"
	"encoding/json"
	"time"
)


type Webhook struct {
	ID string `json:"id"`
	TransactionID string `json:"transaction_id"`
	Source string `json:"source"`
	Payload json.RawMessage `json:"payload"`
	StatusCode int `json:"status_code"`
	ReceivedAt time.Time `json:"received_at"`
	Processed bool `json:"processed"`
}

type PostgresWebhookStore struct {
	db *sql.DB
}

func NewPostgresWebhookStore(db *sql.DB) *PostgresWebhookStore {
	return &PostgresWebhookStore{db: db}
}

type WebhookStore interface {
	CreateWebhook(webhook Webhook) (*Webhook, error)
}

func (pw *PostgresWebhookStore) CreateWebhook(webhook Webhook) (*Webhook, error) {
	query := `
	
	INSERT INTO webhooks (transaction_id, source, payload, status_code, received_at, processed)
	VALUES ($1, $2, $3, $4, $5, $6)
	RETURNING id, transaction_id, source, payload, status_code, received_at, processed
	`

	err := pw.db.QueryRow(query, webhook.TransactionID, webhook.Source, webhook.Payload, webhook.StatusCode, webhook.ReceivedAt, webhook.Processed).
	Scan(&webhook.ID, &webhook.TransactionID, &webhook.Source, &webhook.Payload, &webhook.StatusCode, &webhook.ReceivedAt, &webhook.Processed)
	if err != nil {
		return nil, err
	}
	return &webhook, nil
}