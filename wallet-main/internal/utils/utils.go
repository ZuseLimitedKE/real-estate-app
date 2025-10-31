package utils

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/shopspring/decimal"
)

const (
	DefaultExchangeRate = 134.3421
)

type Envelope map[string]any

func WriteJSON(w http.ResponseWriter, status int, data Envelope) error {
	js, err := json.MarshalIndent(data, "", "\t")
	if err != nil {
		return err
	}

	js = append(js, '\n')
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_, err = w.Write(js)
	if err != nil {
		return err
	}
	return nil
}

func ReadParamID(r *http.Request, key string) (string, error) {
	idParam := chi.URLParam(r, key)
	if idParam == "" {
		return "", errors.New("id parameter is required")
	}
	return idParam, nil
}

func GetAssetPrice(asset string) (float64, error) {
	exchangeRate, _ := GetUSDCKSHExchangeRate()
	assets := map[string]float64{
		"USDC": 1.0,
		"KCB": decimal.NewFromFloat(57.00).Div(decimal.NewFromFloat(exchangeRate)).Round(6).InexactFloat64(),
		"SCOM": decimal.NewFromFloat(27.95).Div(decimal.NewFromFloat(exchangeRate)).Round(6).InexactFloat64(),
		"EQTY": decimal.NewFromFloat(59.50).Div(decimal.NewFromFloat(exchangeRate)).Round(6).InexactFloat64(),
		"HAFR": decimal.NewFromFloat(1.13).Div(decimal.NewFromFloat(exchangeRate)).Round(6).InexactFloat64(),
		"KEGN": decimal.NewFromFloat(9.12).Div(decimal.NewFromFloat(exchangeRate)).Round(6).InexactFloat64(),
		"KQ": decimal.NewFromFloat(3.85).Div(decimal.NewFromFloat(exchangeRate)).Round(6).InexactFloat64(),
	}
	return assets[asset], nil
}

func GetUSDCKSHExchangeRate() (float64, error) {
	// TODO: Implement actual exchange rate fetching
	return DefaultExchangeRate, nil
}