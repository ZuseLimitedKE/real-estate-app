# NHX Wallet Backend

**Fiat On/Off-Ramp Service for Mobile Money Integration**

NHX Wallet is a high-performance Go backend service that bridges traditional mobile money (M-Pesa) with blockchain-based stablecoins (USDC) on the Hedera network. It enables seamless fiat-to-crypto conversions for users in Kenya, providing the crucial on-ramp and off-ramp infrastructure for the NHX tokenization platform.

[![Go](https://img.shields.io/badge/Go-1.24.1-00ADD8?logo=go)](https://golang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?logo=postgresql)](https://postgresql.org/)
[![Hedera](https://img.shields.io/badge/Hedera-SDK_v2.72-purple)](https://hedera.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://docker.com/)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [Technical Stack](#technical-stack)
- [Payment Flow](#payment-flow)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Security](#security)
- [Monitoring](#monitoring)

---

## Overview

The NHX Wallet backend is a RESTful API service that orchestrates the conversion between Kenyan Shillings (KES) and USDC stablecoin on the Hedera network. It integrates with M-Pesa's Lipa Na M-Pesa Online API (STK Push) to collect fiat payments and manages the corresponding cryptocurrency transfers.

### **Core Responsibilities**

1. **On-Ramp Operations**: Convert KES (via M-Pesa) → USDC (on Hedera)
2. **Transaction Management**: Track payment lifecycle from initiation to settlement
3. **Webhook Processing**: Handle M-Pesa payment confirmations asynchronously
4. **State Management**: Maintain transaction history in PostgreSQL
5. **Hedera Integration**: Execute cryptocurrency transfers using Hiero SDK

---

## Architecture

### **High-Level System Design**

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Application                        │
│                      (NHX Frontend/Mobile)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       NHX Wallet Backend                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              HTTP Server (Chi Router)                     │  │
│  │  ┌────────────┬─────────────┬──────────────────────────┐ │  │
│  │  │  /onramp   │  /webhooks  │       /health            │ │  │
│  │  │  /initiate │   /mpesa    │                          │ │  │
│  │  └────────────┴─────────────┴──────────────────────────┘ │  │
│  └──────────────────────────┬───────────────────────────────┘  │
│                             │                                   │
│  ┌──────────────────────────┴───────────────────────────────┐  │
│  │                Application Layer                          │  │
│  │  ┌──────────────────┬──────────────────┐                 │  │
│  │  │ Transaction      │  Webhook         │                 │  │
│  │  │ Handler          │  Handler         │                 │  │
│  │  └────────┬─────────┴──────────┬───────┘                 │  │
│  └───────────┼────────────────────┼─────────────────────────┘  │
│              │                    │                             │
│  ┌───────────▼────────────────────▼─────────────────────────┐  │
│  │                  Data Access Layer                        │  │
│  │  ┌──────────────────┬──────────────────┐                 │  │
│  │  │ Transaction      │  Webhook         │                 │  │
│  │  │ Store            │  Store           │                 │  │
│  │  └────────┬─────────┴──────────┬───────┘                 │  │
│  └───────────┼────────────────────┼─────────────────────────┘  │
└──────────────┼────────────────────┼─────────────────────────────┘
               │                    │
               ▼                    ▼
┌──────────────────────────────────────────────────────────────────┐
│                        PostgreSQL Database                        │
│  ┌──────────────────┬──────────────────┬───────────────────────┐ │
│  │   transactions   │    webhooks      │    migrations         │ │
│  └──────────────────┴──────────────────┴───────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      External Services                            │
│  ┌──────────────────────────┬────────────────────────────────┐  │
│  │    M-Pesa API            │    Hedera Network              │  │
│  │  • STK Push              │  • Testnet                     │  │
│  │  • Payment Webhooks      │  • USDC Transfers              │  │
│  └──────────────────────────┴────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### **Layered Architecture**

The application follows **Clean Architecture** principles with clear separation of concerns:

```
wallet/
├── main.go                      # Application entry point
├── internal/
│   ├── app/
│   │   └── app.go              # Application initialization & DI container
│   ├── api/                    # HTTP handlers (Controller layer)
│   │   ├── transactions.go     # On-ramp endpoint handler
│   │   └── webhooks.go         # M-Pesa webhook handler
│   ├── routes/
│   │   └── routes.go           # HTTP route configuration
│   ├── stores/                 # Data access layer (Repository pattern)
│   │   ├── postgres.go         # PostgreSQL connection
│   │   ├── transactions.go     # Transaction CRUD operations
│   │   └── webhooks.go         # Webhook logging
│   ├── payments/               # External service integrations
│   │   ├── mpesa.go           # M-Pesa API client
│   │   └── stripe.go          # Stripe integration (future)
│   └── utils/                  # Shared utilities
│       ├── json.go            # HTTP response helpers
│       └── pricing.go         # Exchange rate calculations
└── migrations/                 # Database schema versions
    ├── 00001_transactions.sql
    ├── 00002_webhooks.sql
    └── 00003_alter_transactions.sql
```

---

## Key Features

### **🔄 On-Ramp Operations**

- **M-Pesa STK Push Integration**: Trigger payment prompts directly on user's mobile phone
- **Automatic Exchange Rate Conversion**: KES → USDC at real-time rates (default: 129.15 KES/USDC)
- **Transaction State Machine**: Track payment through initiated → confirmed → settled states
- **Idempotency**: Prevent duplicate transactions using M-Pesa checkout IDs

### **📡 Webhook Processing**

- **Asynchronous Payment Confirmation**: Handle M-Pesa callbacks for payment status
- **Resilient Error Handling**: Gracefully handle failed payments and retries
- **Audit Trail**: Log all webhook events for compliance and debugging

### **💾 Persistent Storage**

- **PostgreSQL Integration**: ACID-compliant transaction storage
- **Migration Management**: Version-controlled schema changes using Goose
- **Connection Pooling**: Optimized database performance with pgx/v5

### **🌐 Hedera Network Integration**

- **Hiero SDK v2.72**: Native Hedera Go SDK for cryptocurrency operations
- **Testnet Support**: Development and testing on Hedera testnet
- **Account Management**: Secure operator account for USDC distributions

### **🐳 Production-Ready**

- **Docker Support**: Containerized deployment with Docker Compose
- **Health Checks**: `/health` endpoint for monitoring
- **Graceful Shutdown**: Proper cleanup of database connections
- **Structured Logging**: Detailed logs with timestamps and context

---

## Technical Stack

### **Core Technologies**

| Component           | Technology | Version | Purpose                            |
| ------------------- | ---------- | ------- | ---------------------------------- |
| **Runtime**         | Go         | 1.24.1  | High-performance backend language  |
| **Web Framework**   | Chi Router | v5.2.3  | Lightweight HTTP router            |
| **Database**        | PostgreSQL | 16+     | Relational data storage            |
| **DB Driver**       | pgx/v5     | 5.7.6   | High-performance PostgreSQL driver |
| **Migration Tool**  | Goose      | v3.26.0 | Database schema versioning         |
| **Blockchain SDK**  | Hiero SDK  | v2.72.0 | Hedera network integration         |
| **Payment Gateway** | M-Pesa API | -       | Mobile money integration           |
| **Environment**     | godotenv   | 1.5.1   | Configuration management           |

### **Dependencies**

```go
require (
    github.com/go-chi/chi/v5 v5.2.3           // HTTP router
    github.com/hiero-ledger/hiero-sdk-go/v2   // Hedera SDK
    github.com/jackc/pgx/v5 v5.7.6            // PostgreSQL driver
    github.com/joho/godotenv v1.5.1           // Environment loader
    github.com/pressly/goose/v3 v3.26.0       // Database migrations
    github.com/shopspring/decimal v1.4.0      // Precise decimal math
    github.com/stripe/stripe-go/v83           // Future payment gateway
)
```

---

## Payment Flow

### **On-Ramp Sequence Diagram**

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Wallet as Wallet Backend
    participant DB as PostgreSQL
    participant MPesa as M-Pesa API
    participant Hedera as Hedera Network

    User->>Frontend: Request on-ramp (KES → USDC)
    Frontend->>Wallet: POST /onramp/initiate
    Note right of Frontend: {phone, amount_ksh, hedera_account_id}

    Wallet->>Wallet: Calculate USDC amount<br/>(amount_ksh / 129.15)
    Wallet->>MPesa: Initiate STK Push
    Note right of Wallet: Send payment prompt to phone

    MPesa-->>Wallet: STK Response<br/>{CheckoutRequestID, ResponseCode}

    alt ResponseCode == "0" (Success)
        Wallet->>DB: INSERT transaction<br/>status: 'initiated'
        DB-->>Wallet: Transaction created
        Wallet-->>Frontend: {stk_push_response, transaction}
        Frontend-->>User: Payment prompt sent to phone

        User->>MPesa: Approve payment on phone<br/>(Enter M-Pesa PIN)

        MPesa->>Wallet: POST /webhooks/mpesa
        Note right of MPesa: Payment confirmation webhook

        Wallet->>Wallet: Parse callback data

        alt ResultCode == 0 (Payment Success)
            Wallet->>DB: UPDATE transaction<br/>status: 'confirmed'<br/>receipt_number: XXX
            Wallet->>Hedera: Transfer USDC to user account
            Note right of Wallet: TODO: Implement USDC transfer
            Hedera-->>Wallet: Transaction ID
            Wallet->>DB: UPDATE transaction<br/>status: 'settled'<br/>hedera_tx_id: YYY
            Wallet-->>MPesa: 200 OK
            Wallet-->>User: USDC credited to wallet
        else ResultCode != 0 (Payment Failed)
            Wallet->>DB: UPDATE transaction<br/>status: 'failed'
            Wallet-->>MPesa: 200 OK
            Wallet-->>User: Payment failed notification
        end
    else ResponseCode != "0" (STK Failed)
        Wallet-->>Frontend: {error: "failed to initiate STK push"}
        Frontend-->>User: Error: Unable to send payment prompt
    end
```

### **Transaction State Machine**

```
┌──────────┐
│  Pending │ (Initial state, not used currently)
└──────────┘
      │
      ▼
┌──────────┐
│ Initiated│ ← STK Push successful
└──────────┘
      │
      ├──────────┐
      │          │
      ▼          ▼
┌──────────┐  ┌──────────┐
│Confirmed │  │  Failed  │ ← Payment rejected/timeout
└──────────┘  └──────────┘
      │
      ▼
┌──────────┐
│ Settled  │ ← USDC transferred on Hedera
└──────────┘
```

---

## API Reference

### **Base URL**

```
Production: https://api.nhx.finance
Development: http://localhost:8080
```

### **Endpoints**

#### **1. Health Check**

Check service availability.

```http
GET /health
```

**Response**

```
Status: 200 OK
Body: OK
```

---

#### **2. Initiate On-Ramp**

Trigger M-Pesa STK Push for KES → USDC conversion.

```http
POST /onramp/initiate
Content-Type: application/json
```

**Request Body**

```json
{
  "phone": "254712345678",
  "amount_ksh": 1000.0,
  "hedera_account_id": "0.0.123456"
}
```

**Response (Success)**

```json
{
  "stk_push_response": {
    "MerchantRequestID": "29115-34620561-1",
    "CheckoutRequestID": "ws_CO_191220191020363925",
    "ResponseCode": "0",
    "ResponseDescription": "Success. Request accepted for processing",
    "CustomerMessage": "Success. Request accepted for processing"
  },
  "transaction": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "phone": "254712345678",
    "hedera_account_id": "0.0.123456",
    "type": "onramp",
    "amount_ksh": 1000.0,
    "amount_usdc": 7.74,
    "exchange_rate": 129.15,
    "status": "initiated",
    "mpesa_checkout_id": "ws_CO_191220191020363925",
    "created_at": "2025-10-30T12:34:56Z",
    "updated_at": "2025-10-30T12:34:56Z"
  }
}
```

**Response (Error)**

```json
{
  "error": "failed to initiate STK push"
}
```

---

#### **3. M-Pesa Webhook**

Receive payment confirmations from M-Pesa (called by Safaricom).

```http
POST /webhooks/mpesa
Content-Type: application/json
```

**Request Body (Successful Payment)**

```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "29115-34620561-1",
      "CheckoutRequestID": "ws_CO_191220191020363925",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "CallbackMetadata": {
        "Item": [
          {
            "Name": "Amount",
            "Value": 1000.0
          },
          {
            "Name": "MpesaReceiptNumber",
            "Value": "NLJ7RT61SV"
          },
          {
            "Name": "TransactionDate",
            "Value": 20191219102115
          },
          {
            "Name": "PhoneNumber",
            "Value": 254712345678
          }
        ]
      }
    }
  }
}
```

**Request Body (Failed Payment)**

```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "29115-34620561-1",
      "CheckoutRequestID": "ws_CO_191220191020363925",
      "ResultCode": 1032,
      "ResultDesc": "Request cancelled by user"
    }
  }
}
```

**Response**

```json
{
  "transaction": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "confirmed",
    "mpesa_receipt_number": "NLJ7RT61SV"
  }
}
```

---

## Database Schema

### **Transactions Table**

Stores all on-ramp and off-ramp transactions.

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) NOT NULL,
    hedera_account_id VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL,                    -- 'onramp' | 'offramp'
    amount_ksh DECIMAL(15,2) NOT NULL,
    amount_usdc DECIMAL(15,6) NOT NULL,
    exchange_rate DECIMAL(10,4) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- State machine
    mpesa_checkout_id VARCHAR(50),                -- M-Pesa reference
    mpesa_receipt_number VARCHAR(50),             -- Final M-Pesa receipt
    hedera_tx_id VARCHAR(50),                     -- Hedera transaction ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_type CHECK (type IN ('onramp', 'offramp')),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'initiated', 'confirmed', 'settled', 'failed'))
);

CREATE INDEX idx_transactions_mpesa_checkout ON transactions(mpesa_checkout_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_hedera_account ON transactions(hedera_account_id);
```

### **Webhooks Table**

Audit log of all M-Pesa webhook events.

```sql
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source VARCHAR(50) NOT NULL,                  -- 'mpesa', 'stripe', etc.
    event_type VARCHAR(50),
    payload JSONB NOT NULL,                       -- Raw webhook data
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhooks_source ON webhooks(source);
CREATE INDEX idx_webhooks_processed ON webhooks(processed);
```

---

## Getting Started

### **Prerequisites**

- **Go**: 1.24.1 or higher
- **PostgreSQL**: 16 or higher
- **Docker & Docker Compose**: Latest version (for containerized deployment)
- **M-Pesa Credentials**: Safaricom Daraja API access
- **Hedera Account**: Testnet account with USDC balance

### **Local Development Setup**

1. **Clone the repository**

   ```bash
   git clone https://github.com/nhx-finance/wallet.git
   cd wallet
   ```

2. **Install dependencies**

   ```bash
   go mod download
   ```

3. **Set up PostgreSQL**

   ```bash
   # Using Docker
   docker run --name nhx-postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=nhx_wallet \
     -p 5432:5432 \
     -d postgres:16
   ```

4. **Configure environment variables**

   Create a `.env` file:

   ```env
   # Database
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/nhx_wallet?sslmode=disable

   # Hedera
   OPERATOR_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
   OPERATOR_KEY=302e020100300506032b657004220420YOUR_PRIVATE_KEY

   # M-Pesa (Safaricom Daraja)
   MPESA_CONSUMER_KEY=your_consumer_key
   MPESA_CONSUMER_SECRET=your_consumer_secret
   MPESA_SHORTCODE=174379
   MPESA_PASSKEY=your_passkey
   MPESA_CALLBACK_URL=https://your-domain.com/webhooks/mpesa

   # Application
   PORT=8080
   DEFAULT_EXCHANGE_RATE=129.15
   ```

5. **Run database migrations**

   The application automatically runs migrations on startup using embedded migration files.

6. **Start the server**

   ```bash
   go run main.go --port 8080
   ```

   Server will start on `http://localhost:8080`

### **Development with Docker Compose**

```bash
# Start all services (database + backend)
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

---

## Configuration

### **Environment Variables**

| Variable                | Description                           | Default | Required |
| ----------------------- | ------------------------------------- | ------- | -------- |
| `DATABASE_URL`          | PostgreSQL connection string          | -       | ✅       |
| `OPERATOR_ACCOUNT_ID`   | Hedera operator account ID            | -       | ✅       |
| `OPERATOR_KEY`          | Hedera operator private key (Ed25519) | -       | ✅       |
| `MPESA_CONSUMER_KEY`    | M-Pesa API consumer key               | -       | ✅       |
| `MPESA_CONSUMER_SECRET` | M-Pesa API consumer secret            | -       | ✅       |
| `MPESA_SHORTCODE`       | M-Pesa business shortcode             | -       | ✅       |
| `MPESA_PASSKEY`         | M-Pesa Lipa Na M-Pesa passkey         | -       | ✅       |
| `MPESA_CALLBACK_URL`    | Webhook URL for M-Pesa callbacks      | -       | ✅       |
| `PORT`                  | HTTP server port                      | 8080    | ❌       |
| `DEFAULT_EXCHANGE_RATE` | KES to USDC exchange rate             | 129.15  | ❌       |

### **Database Connection Pooling**

PostgreSQL connection is managed using `pgx/v5` with the following defaults:

```go
// internal/stores/postgres.go
config, err := pgxpool.ParseConfig(databaseURL)
config.MaxConns = 25              // Maximum connections
config.MinConns = 5               // Minimum idle connections
config.MaxConnLifetime = 1 * time.Hour
config.MaxConnIdleTime = 30 * time.Minute
```

---

## Deployment

### **Production Deployment with Docker**

1. **Build and start containers**

   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

2. **View logs**

   ```bash
   docker-compose -f docker-compose.prod.yml logs --tail=50 -f backend
   ```

3. **Database access**

   ```bash
   docker exec -it nhx-wallet-prod-db psql -U postgres -d postgres
   ```

4. **Update deployment**

   ```bash
   git pull
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

### **Docker Compose Configuration**

**Production** (`docker-compose.prod.yml`):

```yaml
version: "3.8"

services:
  db:
    image: postgres:16-alpine
    container_name: nhx-wallet-prod-db
    environment:
      POSTGRES_DB: nhx_wallet
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - nhx-network

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: nhx-wallet-prod-backend
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgres://postgres:${DB_PASSWORD}@db:5432/nhx_wallet?sslmode=disable
      OPERATOR_ACCOUNT_ID: ${OPERATOR_ACCOUNT_ID}
      OPERATOR_KEY: ${OPERATOR_KEY}
    depends_on:
      - db
    networks:
      - nhx-network

volumes:
  postgres_data:

networks:
  nhx-network:
    driver: bridge
```

### **Dockerfile**

```dockerfile
FROM golang:1.24.1-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o wallet main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates

WORKDIR /root/
COPY --from=builder /app/wallet .
COPY --from=builder /app/.env .

EXPOSE 8080
CMD ["./wallet"]
```

---

## Security

### **API Security**

- **Input Validation**: All request bodies validated before processing
- **SQL Injection Prevention**: Parameterized queries using pgx
- **Webhook Verification**: Validate M-Pesa webhook signatures (implement in production)
- **Rate Limiting**: Recommended for production (not implemented yet)

### **Secrets Management**

- **Environment Variables**: Sensitive data stored in `.env` (never committed)
- **Hedera Private Key**: Ed25519 key stored securely, never logged
- **M-Pesa Credentials**: API keys protected via environment variables

### **Database Security**

- **Encrypted Connections**: SSL mode for PostgreSQL in production
- **Least Privilege**: Database user with minimal required permissions
- **Regular Backups**: Automated backup strategy for transaction data

### **Best Practices**

- **HTTPS Only**: Production API served over TLS
- **CORS Configuration**: Restrict origins in production
- **Logging**: Sanitize logs to avoid leaking sensitive data
- **Error Messages**: Generic errors to clients, detailed logs server-side

---

## Monitoring

### **Health Check Endpoint**

```bash
curl http://localhost:8080/health
# Response: OK
```

### **Logging**

Structured logging with Go's standard logger:

```go
app.Logger.Printf("Transaction created: %s, amount: %.2f KES", txID, amount)
app.Logger.Printf("Webhook received: source=%s, processed=%t", source, processed)
```

### **Database Monitoring**

```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Transaction statistics
SELECT
    status,
    COUNT(*) as count,
    SUM(amount_ksh) as total_ksh,
    SUM(amount_usdc) as total_usdc
FROM transactions
GROUP BY status;

-- Failed transactions
SELECT * FROM transactions WHERE status = 'failed' ORDER BY created_at DESC;
```

### **Recommended Monitoring Tools**

- **Application Monitoring**: Prometheus + Grafana
- **Log Aggregation**: ELK Stack or Loki
- **Error Tracking**: Sentry
- **Uptime Monitoring**: UptimeRobot or Pingdom

---

## Performance Considerations

- **Connection Pooling**: Reuse database connections (25 max, 5 min)
- **Indexing**: Optimized queries with indexes on foreign keys and status fields
- **Asynchronous Processing**: Webhook handling doesn't block main request flow
- **Graceful Shutdown**: Proper cleanup of resources on SIGTERM

---

## Roadmap

- [ ] Complete Hedera USDC transfer implementation
- [ ] Off-ramp functionality (USDC → M-Pesa)
- [ ] Webhook signature verification
- [ ] Rate limiting and DDoS protection
- [ ] Admin dashboard for transaction monitoring
- [ ] Multiple exchange rate sources
- [ ] Automated reconciliation with M-Pesa statements

---

## Contributing

We welcome contributions! Please follow Go best practices and maintain test coverage.

---

## License

This project is licensed under the MIT License.

---

## Support

For technical support:

- **GitHub Issues**: [github.com/nhx-finance/wallet/issues](https://github.com/nhx-finance/wallet/issues)
- **Email**: dev@nhx.finance

---

**Built with 🔒 for secure fiat-crypto conversions**
