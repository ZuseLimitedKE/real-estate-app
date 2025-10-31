package app

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	hiero "github.com/hiero-ledger/hiero-sdk-go/v2/sdk"
	"github.com/joho/godotenv"
	"github.com/nhx-finance/wallet/internal/api"
	"github.com/nhx-finance/wallet/internal/stores"
	"github.com/nhx-finance/wallet/migrations"
)

type Application struct {
	Logger *log.Logger
	DB *sql.DB
	HieroClient *hiero.Client
	TransactionHandler *api.TransactionHandler
	WebhookHandler *api.WebhookHandler
}

func loadEnvironmentVariables() {
	err := godotenv.Load()

	if err != nil {
		fmt.Println("No .env file found (using environment variables from system)")
	} else {
		fmt.Println("Environment variables loaded from .env file")
	}
}



func NewApplication() (*Application, error) {
	loadEnvironmentVariables()
	accountID, err := hiero.AccountIDFromString(os.Getenv("OPERATOR_ACCOUNT_ID"))
	if err != nil {
		panic(err)
	}

	privateKey, err := hiero.PrivateKeyFromStringEd25519(os.Getenv("OPERATOR_KEY"))
	if err != nil {
		panic(err)
	}

	client := hiero.ClientForTestnet()

	client.SetOperator(accountID, privateKey)
	logger := log.New(os.Stdout, "", log.Ldate|log.Ltime|log.Lshortfile)

	pgDB, err := stores.Open()
	if err != nil {
		return nil, err
	}
	err = stores.MigrateFS(pgDB, migrations.FS, ".")
	if err != nil {
		panic(err)
	}

	// stores
	transactionStore := stores.NewPostgresTransactionStore(pgDB)
	webhookStore := stores.NewPostgresWebhookStore(pgDB)

	// handlers
	transactionHandler := api.NewTransactionHandler(transactionStore, client, logger)
	webhookHandler := api.NewWebhookHandler(webhookStore, transactionStore, logger)

	app := &Application{
		Logger: logger,
		HieroClient: client,
		DB: pgDB,
		TransactionHandler: transactionHandler,
		WebhookHandler: webhookHandler,
	}

	return app, nil
}

func (app *Application) HealthCheck(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}