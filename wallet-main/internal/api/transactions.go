package api

import (
	"encoding/json"
	"log"
	"net/http"

	hiero "github.com/hiero-ledger/hiero-sdk-go/v2/sdk"
	"github.com/nhx-finance/wallet/internal/payments"
	"github.com/nhx-finance/wallet/internal/stores"
	"github.com/nhx-finance/wallet/internal/utils"
)

type OnRampRequest struct {
	AmountKSH float64 `json:"amount_ksh"`
	Phone string `json:"phone"`
	HederaAccountID string `json:"hedera_account_id"`
}



type TransactionHandler struct {
	TransactionStore stores.TransactionStore
	HieroClient *hiero.Client
	Logger *log.Logger
}

func NewTransactionHandler (transactionStore stores.TransactionStore, hieroClient *hiero.Client, logger *log.Logger) *TransactionHandler {
	return &TransactionHandler{
		TransactionStore: transactionStore,
		HieroClient: hieroClient,
		Logger: logger,
	}
}

func (th *TransactionHandler) HandleInitiatePayment(w http.ResponseWriter, r *http.Request) {
	var req OnRampRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "invalid request body"})
		return
	}

	stkPushResp, err := payments.InitiateSTKPush(req.Phone, req.AmountKSH, req.HederaAccountID)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to initiate STK push"})
		return
	}

	if stkPushResp.ResponseCode != "0" {
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to initiate STK push"})
		return
	}

	tx := stores.Transaction{
		Phone: req.Phone,
		HederaAccountID: req.HederaAccountID,
		Type: "onramp",
		AmountKSH: req.AmountKSH,
		AmountUSDC: req.AmountKSH / utils.DefaultExchangeRate,
		ExchangeRate: utils.DefaultExchangeRate,
		Status: "initiated",
		MpesaCheckoutID: stkPushResp.CheckoutRequestID,
	}
	createdTx, err := th.TransactionStore.CreateTransaction(tx)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to create transaction"})
		th.Logger.Printf("failed to create transaction: %v", err)
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"stk_push_response": stkPushResp, "transaction": createdTx})
}

