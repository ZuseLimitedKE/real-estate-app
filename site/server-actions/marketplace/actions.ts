'use server'
import { MarketplaceService } from "./marketplace";
import {MarketPlaceContract} from "@/smartcontract/marketplace";

export const createOrder = MarketplaceService.createOrder.bind(MarketplaceService);
export const getOrders = MarketplaceService.getOrders.bind(MarketplaceService);
export const getOrderbook = MarketplaceService.getOrderbook.bind(MarketplaceService);
export const cancelOrder = MarketplaceService.cancelOrder.bind(MarketplaceService);
export const findMatches = MarketplaceService.findMatches.bind(MarketplaceService);
export const createTrade = MarketplaceService.createTrade.bind(MarketplaceService);
export const getTrades = MarketplaceService.getTrades.bind(MarketplaceService);
export const updateEscrowBalance = MarketplaceService.updateEscrowBalance.bind(MarketplaceService);
export const getEscrowBalances = MarketplaceService.getEscrowBalances.bind(MarketplaceService);
export const updateMarketDataForToken = MarketplaceService.updateMarketDataForToken.bind(MarketplaceService);
export const getMarketData = MarketplaceService.getMarketData.bind(MarketplaceService);
export const getUserOrderHistory = MarketplaceService.getUserOrderHistory.bind(MarketplaceService);
export const cleanupExpiredOrders = MarketplaceService.cleanupExpiredOrders.bind(MarketplaceService);
export const getUserTradingStats = MarketplaceService.getUserTradingStats.bind(MarketplaceService);
export const batchUpdateOrderStatuses = MarketplaceService.batchUpdateOrderStatuses.bind(MarketplaceService);
export const associateTokentoContract = MarketPlaceContract.associateTokentoContract.bind(MarketPlaceContract);