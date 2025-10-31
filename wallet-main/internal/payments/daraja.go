package payments

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"
)

type STKPushResponse struct {
	MerchantRequestID string `json:"MerchantRequestID"`
	CheckoutRequestID string `json:"CheckoutRequestID"`
	ResponseCode string `json:"ResponseCode"`
	ResponseDescription string `json:"ResponseDescription"`
	CustomerMessage string `json:"CustomerMessage"`
}

type AuthorizationResponse struct {
	AccessToken string `json:"access_token"`
	ExpiresIn string `json:"expires_in"`
}


func InitiateSTKPush(phone string, amountKSH float64, hederaAccountID string) (*STKPushResponse, error) {
	url := os.Getenv("STK_PUSH_URL")
	if url == "" {
		return nil, errors.New("STK_PUSH_URL is not set")
	}
	businessShortCode := os.Getenv("BUSINESS_SHORT_CODE")
	if businessShortCode == "" {
		return nil, errors.New("BUSINESS_SHORT_CODE is not set")
	}
	consumerKey := os.Getenv("CONSUMER_KEY")
	if consumerKey == "" {
		return nil, errors.New("CONSUMER_KEY is not set")
	}
	consumerSecret := os.Getenv("CONSUMER_SECRET")
	if consumerSecret == "" {
		return nil, errors.New("CONSUMER_SECRET is not set")
	}
	passKey := os.Getenv("PASS_KEY")
	if passKey == "" {
		return nil, errors.New("PASS_KEY is not set")
	}
	callbackURL := os.Getenv("CALLBACK_URL")
	if callbackURL == "" {
		return nil, errors.New("CALLBACK_URL is not set")
	}

	businessShortCodeInt, err := strconv.ParseInt(businessShortCode, 10, 64)
	if err != nil {
		return nil, errors.New("BUSINESS_SHORT_CODE must be a valid integer")
	}
	phoneInt, err := strconv.ParseInt(phone, 10, 64)
	if err != nil {
		return nil, errors.New("phone number must be a valid integer")
	}

	method := "POST"
	timestamp := time.Now().Format("YYYYMMDDHHmmss")
	password := base64.StdEncoding.EncodeToString([]byte(businessShortCode + passKey + timestamp))
	payloadData := map[string]any{
		"BusinessShortCode": businessShortCodeInt,
		"Password": password,
		"Timestamp": timestamp,
		"TransactionType": "CustomerPayBillOnline",
		"Amount": int(amountKSH),
		"PartyA": phoneInt,
		"PartyB": businessShortCodeInt,
		"PhoneNumber": phoneInt,
		"CallBackURL": callbackURL,
		"AccountReference": "NHXWALLET",
		"TransactionDesc": "USDC Purchase",
	}
	
	payloadBytes, err := json.Marshal(payloadData)
	if err != nil {
		log.Println("failed to marshal payload", err)
		return nil, err
	}
	payload := bytes.NewReader(payloadBytes)
	client := &http.Client{}
	httpReq, err := http.NewRequest(method, url, payload)
	if err != nil {
		log.Println("failed to create HTTP request", err)
		return nil, err
	}

	accessToken, err := getAccessToken()
	if err != nil {
		log.Println("failed to get access token", err)
		return nil, err
	}
	httpReq.Header.Add("Content-Type", "application/json")
	httpReq.Header.Add("Authorization", "Bearer " + accessToken.AccessToken)
	
	res, err := client.Do(httpReq)
	if err != nil {
		log.Println("failed to do HTTP request", err)
		return nil, err
	}
	defer res.Body.Close()
	
	bodyBytes, err := io.ReadAll(res.Body)
	if err != nil {
		log.Println("failed to read response body", err)
		return nil, err
	}
	
	log.Println("STK push response status code: ", res.StatusCode)
	
	var stkResp STKPushResponse
	if err := json.Unmarshal(bodyBytes, &stkResp); err != nil {
		log.Println("failed to decode STK push response", err)
		return nil, err
	}
	
	return &stkResp, nil
}

func getAccessToken() (*AuthorizationResponse, error) {
	url := os.Getenv("AUTHORIZATION_URL")
	if url == "" {
		return nil, errors.New("AUTHORIZATION_URL is not set")
	}
	consumerKey := os.Getenv("CONSUMER_KEY")
	if consumerKey == "" {
		return nil, errors.New("CONSUMER_KEY is not set")
	}
	consumerSecret := os.Getenv("CONSUMER_SECRET")
	if consumerSecret == "" {
		return nil, errors.New("CONSUMER_SECRET is not set")
	}

	encodedCredentials := base64.StdEncoding.EncodeToString([]byte(consumerKey + ":" + consumerSecret))

	httpReq, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	httpReq.Header.Add("Authorization", "Basic " + encodedCredentials)
	httpReq.Header.Add("Content-Type", "application/json")

	client := &http.Client{}

	res, err := client.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	var authResp AuthorizationResponse
	if err := json.NewDecoder(res.Body).Decode(&authResp); err != nil {
		return nil, err
	}
	
	return &authResp, nil
}