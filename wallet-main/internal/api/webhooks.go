package api

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/nhx-finance/wallet/internal/stores"
	"github.com/nhx-finance/wallet/internal/utils"
)

type WebhookHandler struct {
	WebhookStore stores.WebhookStore
	TransactionStore stores.TransactionStore
	Logger *log.Logger
}

func NewWebhookHandler(webhookStore stores.WebhookStore, transactionStore stores.TransactionStore, logger *log.Logger) *WebhookHandler {
	return &WebhookHandler{
		WebhookStore: webhookStore,
		TransactionStore: transactionStore,
		Logger: logger,
	}
}

type SuccessfulRequest struct {
	Body struct {
		StkCallback struct {
			MerchantRequestID string `json:"MerchantRequestID"`
			CheckoutRequestID string `json:"CheckoutRequestID"`
			ResultCode        int    `json:"ResultCode"`
			ResultDesc        string `json:"ResultDesc"`
			CallbackMetadata  struct {
				Item []struct {
					Name  string      `json:"Name"`
					Value any `json:"Value"`
				} `json:"Item"`
			} `json:"CallbackMetadata"`
		} `json:"stkCallback"`
	} `json:"Body"`
}

type FailedRequest struct {
	Body struct {
		StkCallback struct {
			MerchantRequestID string `json:"MerchantRequestID"`
			CheckoutRequestID string `json:"CheckoutRequestID"`
			ResultCode        int    `json:"ResultCode"`
			ResultDesc        string `json:"ResultDesc"`
		} `json:"stkCallback"`
	} `json:"Body"`
}

func (wh *WebhookHandler) HandleWebhook(w http.ResponseWriter, r *http.Request) {
	var callback SuccessfulRequest
	err := json.NewDecoder(r.Body).Decode(&callback)
	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "invalid request body"})
		wh.Logger.Printf("failed to decode successful request: %v", err)
		return
	}

	if callback.Body.StkCallback.ResultCode != 0 {
		wh.Logger.Printf("failed to process successful request: %v", callback.Body)
		txn, err := wh.TransactionStore.UpdateTransactionByMpesaCheckoutID(callback.Body.StkCallback.CheckoutRequestID, "failed", callback.Body.StkCallback.ResultDesc)
		if err != nil {
			wh.Logger.Printf("failed to update transaction: %v", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to update transaction"})
			return
		}
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": callback.Body.StkCallback.ResultDesc, "transaction": txn})
		return
	}

	receiptNumber := callback.Body.StkCallback.CallbackMetadata.Item[1].Value.(string)
	txn, err := wh.TransactionStore.UpdateTransactionByMpesaCheckoutID(callback.Body.StkCallback.CheckoutRequestID, "confirmed", receiptNumber)
	if err != nil {
		wh.Logger.Printf("failed to update transaction: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to update transaction"})
		return
	}
	// TODO: Initiate Hedera transaction on another goroutine

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"transaction": txn})
}