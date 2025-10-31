package routes

import (
	"github.com/go-chi/chi/v5"
	"github.com/nhx-finance/wallet/internal/app"
)

func SetUpRoutes(app *app.Application) *chi.Mux {
	r := chi.NewRouter()

	r.Get("/health", app.HealthCheck)
	r.Post("/onramp/initiate", app.TransactionHandler.HandleInitiatePayment)
	r.Post("/webhooks/mpesa", app.WebhookHandler.HandleWebhook)

	return r
}


