package payments

import (
	"context"
	"log"
	"math"
	"net/http"
	"os"

	"github.com/nhx-finance/wallet/internal/utils"
	"github.com/stripe/stripe-go/v83"
)



type StripeHandler struct {
	StripeClient *stripe.Client
}

func NewStripeHandler(stripeClient *stripe.Client) *StripeHandler {
	return &StripeHandler{
		StripeClient: stripeClient,
	}
}

func (sh *StripeHandler) AccountBalance(w http.ResponseWriter, r *http.Request){
	params := &stripe.BalanceRetrieveParams{}
	balance, err := sh.StripeClient.V1Balance.Retrieve(r.Context(), params)
	if err != nil {
		log.Printf("failed to get account balance: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to get account balance"})
		return
	}
	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"balance": balance})
}

func (sh *StripeHandler) CreateCheckoutSession(email string, asset string, quantity float64, imageURL string, accountID string) (*stripe.CheckoutSession, error) {
	price, err := utils.GetAssetPrice(asset)
	if err != nil {
		return nil, err
	}
	params := &stripe.CheckoutSessionCreateParams{
		SuccessURL: stripe.String(os.Getenv("SUCCESS_URL")),
		LineItems: []*stripe.CheckoutSessionCreateLineItemParams{
			{
				PriceData: &stripe.CheckoutSessionCreateLineItemPriceDataParams{
					Currency: stripe.String("usd"),
					ProductData: &stripe.CheckoutSessionCreateLineItemPriceDataProductDataParams{
                        Name: stripe.String("nh" + string(asset)),
						Images: []*string{stripe.String(imageURL)},
						Description: stripe.String("nh" + string(asset) +" purchase Payment"),
                    },
					UnitAmount: stripe.Int64(int64(math.Ceil(100 * price))),
				},
				Quantity: stripe.Int64(int64(quantity)),
			},
		},
		Mode: stripe.String("payment"),
		Metadata: map[string]string{
			"account_id": accountID,
		},
		CancelURL: stripe.String(os.Getenv("CANCEL_URL")),
	}

	session, err := sh.StripeClient.V1CheckoutSessions.Create(context.Background(), params)
	if err != nil {
		log.Printf("failed to create checkout session: %v", err)
		return nil, err
	}

	return session, nil
}

func (sh *StripeHandler) RetrieveCheckoutSession(sessionID string) (*stripe.CheckoutSession, error) {
	params := &stripe.CheckoutSessionRetrieveParams{}

	session, err := sh.StripeClient.V1CheckoutSessions.Retrieve(context.TODO(), sessionID, params)
	if err != nil {
		log.Printf("failed to retrieve checkout session: %v", err)
		return nil, err
	}

	return session, nil
}