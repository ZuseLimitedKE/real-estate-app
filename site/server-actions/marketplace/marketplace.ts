'use server';

import { revalidatePath } from 'next/cache';
import { MongoClient, Collection } from 'mongodb';
import client from '@/db/connection';
import {
    SignedOrderSchema,
    TradeSchema,
    EscrowBalanceSchema,
    MarketDataSchema,
    CreateOrderRequestSchema,
    OrderQuerySchema,
    type SignedOrder,
    type Trade,
    type EscrowBalance,
    type MarketData,
    type Order,
} from '@/types/marketplace';
import {
    generateOrderHash,
    canOrdersMatch,
    calculateTradeParams,
    isOrderExpired,
    generateTradeId,
    calculateMarketStats,
} from './utils';

function getCollections() {
    const db = client.db('real-estate-app');
    return {
        orders: db.collection<SignedOrder>('marketplace_orders'),
        trades: db.collection<Trade>('marketplace_trades'),
        escrowBalances: db.collection<EscrowBalance>('escrow_balances'),
        marketData: db.collection<MarketData>('market_data'),
    };
}

export async function initMarketplaceIndexes() {
    const { orders, trades, escrowBalances, marketData } = getCollections();

    try {
        await orders.createIndexes([
            { key: { orderHash: 1 }, unique: true },
            { key: { 'order.maker': 1, status: 1 } },
            { key: { 'order.propertyToken': 1, 'order.orderType': 1, status: 1 } },
            { key: { 'order.expiry': 1 } },
            { key: { 'order.pricePerShare': 1 } },
            { key: { createdAt: -1 } },
        ]);

        await trades.createIndexes([
            { key: { buyOrderHash: 1, sellOrderHash: 1 }, unique: true },
            { key: { propertyToken: 1, status: 1 } },
            { key: { buyer: 1 } },
            { key: { seller: 1 } },
            { key: { createdAt: -1 } },
            { key: { settledAt: -1 } },
        ]);

        await escrowBalances.createIndexes([
            { key: { userAddress: 1, tokenAddress: 1 }, unique: true },
            { key: { lastUpdated: -1 } },
        ]);

        await marketData.createIndexes([
            { key: { propertyToken: 1 }, unique: true },
            { key: { updatedAt: -1 } },
        ]);

        console.log('Marketplace indexes created successfully');
        return { success: true };
    } catch (error) {
        console.error('Error creating marketplace indexes:', error);
        return { success: false, error: String(error) };
    }
}

export async function createOrder(
    orderData: typeof CreateOrderRequestSchema['_input']['orderData'],
    signature: string,
    makerAddress: string
) {
    try {
        const validatedRequest = CreateOrderRequestSchema.parse({
            orderData,
            signature,
        });

        const completeOrder: Order = {
            ...validatedRequest.orderData,
            maker: makerAddress,
        };

        // Generate order hash
        const orderHash = generateOrderHash(completeOrder);

        // Check if order already exists
        const { orders } = getCollections();
        const existingOrder = await orders.findOne({ orderHash });
        if (existingOrder) {
            return { success: false, error: 'Order already exists' };
        }

        // Create signed order
        const signedOrder: SignedOrder = {
            order: completeOrder,
            signature: validatedRequest.signature,
            orderHash,
            status: 'ACTIVE',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Validate with schema
        const validatedOrder = SignedOrderSchema.parse(signedOrder);

        // Insert order
        const result = await orders.insertOne(validatedOrder);

        // Update market data
        await updateMarketDataForToken(completeOrder.propertyToken);

        revalidatePath('/marketplace');

        return {
            success: true,
            orderHash,
            insertedId: result.insertedId
        };
    } catch (error) {
        console.error('Error creating order:', error);
        return { success: false, error: String(error) };
    }
}

// Get orders with filtering and pagination
export async function getOrders(query: typeof OrderQuerySchema['_input'] = {}) {
    try {
        const validatedQuery = OrderQuerySchema.parse(query);
        const { orders } = getCollections();

        // Build MongoDB filter
        const filter: any = {};

        if (validatedQuery.propertyToken) {
            filter['order.propertyToken'] = validatedQuery.propertyToken;
        }

        if (validatedQuery.orderType) {
            filter['order.orderType'] = validatedQuery.orderType;
        }

        if (validatedQuery.maker) {
            filter['order.maker'] = validatedQuery.maker;
        }

        if (validatedQuery.status) {
            filter.status = validatedQuery.status;
        }

        if (validatedQuery.minPrice || validatedQuery.maxPrice) {
            filter['order.pricePerShare'] = {};
            if (validatedQuery.minPrice) {
                filter['order.pricePerShare'].$gte = validatedQuery.minPrice;
            }
            if (validatedQuery.maxPrice) {
                filter['order.pricePerShare'].$lte = validatedQuery.maxPrice;
            }
        }

        // Execute query with pagination
        const [orderList, total] = await Promise.all([
            orders.find(filter)
                .sort({ createdAt: -1 })
                .skip(validatedQuery.offset)
                .limit(validatedQuery.limit)
                .toArray(),
            orders.countDocuments(filter)
        ]);

        return {
            success: true,
            data: {
                orders: orderList,
                total,
                limit: validatedQuery.limit,
                offset: validatedQuery.offset,
                hasMore: validatedQuery.offset + validatedQuery.limit < total,
            }
        };
    } catch (error) {
        console.error('Error getting orders:', error);
        return { success: false, error: String(error) };
    }
}

export async function getOrderbook(propertyToken: string, limit: number = 20) {
    try {
        const { orders } = getCollections();

        // Get active buy orders (sorted by price DESC)
        const buyOrders = await orders.find({
            'order.propertyToken': propertyToken,
            'order.orderType': 'BUY',
            status: 'ACTIVE',
            'order.expiry': { $gt: Math.floor(Date.now() / 1000) }
        })
            .sort({ 'order.pricePerShare': -1 })
            .limit(limit)
            .toArray();

        // Get active sell orders (sorted by price ASC)
        const sellOrders = await orders.find({
            'order.propertyToken': propertyToken,
            'order.orderType': 'SELL',
            status: 'ACTIVE',
            'order.expiry': { $gt: Math.floor(Date.now() / 1000) }
        })
            .sort({ 'order.pricePerShare': 1 })
            .limit(limit)
            .toArray();

        return {
            success: true,
            data: {
                bids: buyOrders,
                asks: sellOrders,
                spread: sellOrders.length > 0 && buyOrders.length > 0
                    ? (BigInt(sellOrders[0].order.pricePerShare) - BigInt(buyOrders[0].order.pricePerShare)).toString()
                    : '0'
            }
        };
    } catch (error) {
        console.error('Error getting orderbook:', error);
        return { success: false, error: String(error) };
    }
}

// Cancel an order
export async function cancelOrder(orderHash: string, makerAddress: string) {
    try {
        const { orders } = getCollections();

        const result = await orders.updateOne(
            {
                orderHash,
                'order.maker': makerAddress,
                status: 'ACTIVE'
            },
            {
                $set: {
                    status: 'CANCELLED',
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return { success: false, error: 'Order not found or not cancellable' };
        }

        revalidatePath('/marketplace');
        return { success: true };
    } catch (error) {
        console.error('Error cancelling order:', error);
        return { success: false, error: String(error) };
    }
}

// Find matching orders for a given order
export async function findMatches(targetOrderHash: string) {
    try {
        const { orders } = getCollections();

        const targetOrder = await orders.findOne({ orderHash: targetOrderHash });
        if (!targetOrder || targetOrder.status !== 'ACTIVE') {
            return { success: false, error: 'Target order not found or not active' };
        }

        // Find opposite type orders for the same property token
        const oppositeType = targetOrder.order.orderType === 'BUY' ? 'SELL' : 'BUY';

        const potentialMatches = await orders.find({
            'order.propertyToken': targetOrder.order.propertyToken,
            'order.orderType': oppositeType,
            status: 'ACTIVE',
            'order.expiry': { $gt: Math.floor(Date.now() / 1000) },
            orderHash: { $ne: targetOrderHash }
        }).toArray();

        // Filter for actual matches
        const matches = potentialMatches.filter(order => {
            if (targetOrder.order.orderType === 'BUY') {
                return canOrdersMatch(targetOrder.order, order.order);
            } else {
                return canOrdersMatch(order.order, targetOrder.order);
            }
        });

        // Sort matches by best price
        matches.sort((a, b) => {
            const priceA = BigInt(a.order.pricePerShare);
            const priceB = BigInt(b.order.pricePerShare);

            if (oppositeType === 'SELL') {
                // For sell orders, lower price is better
                return priceA < priceB ? -1 : priceA > priceB ? 1 : 0;
            } else {
                // For buy orders, higher price is better
                return priceA > priceB ? -1 : priceA < priceB ? 1 : 0;
            }
        });

        return { success: true, data: matches };
    } catch (error) {
        console.error('Error finding matches:', error);
        return { success: false, error: String(error) };
    }
}

// Create a trade record (called when settlement occurs)
export async function createTrade(
    buyOrderHash: string,
    sellOrderHash: string,
    txHash?: string
) {
    try {
        const { orders, trades } = getCollections();

        // Get both orders
        const [buyOrder, sellOrder] = await Promise.all([
            orders.findOne({ orderHash: buyOrderHash }),
            orders.findOne({ orderHash: sellOrderHash })
        ]);

        if (!buyOrder || !sellOrder) {
            return { success: false, error: 'Orders not found' };
        }

        if (!canOrdersMatch(buyOrder.order, sellOrder.order)) {
            return { success: false, error: 'Orders cannot be matched' };
        }

        // Calculate trade parameters
        const { tradeAmount, pricePerShare, totalValue } = calculateTradeParams(
            buyOrder.order,
            sellOrder.order
        );

        // Create trade record
        const trade: Trade = {
            buyOrderHash,
            sellOrderHash,
            propertyToken: buyOrder.order.propertyToken,
            buyer: buyOrder.order.maker,
            seller: sellOrder.order.maker,
            tradeAmount,
            pricePerShare,
            totalValue,
            txHash,
            status: txHash ? 'CONFIRMED' : 'PENDING',
            createdAt: new Date(),
            settledAt: txHash ? new Date() : undefined,
        };

        const validatedTrade = TradeSchema.parse(trade);

        // Insert trade
        const result = await trades.insertOne(validatedTrade);

        // Update order remaining amounts if confirmed
        if (txHash) {
            await Promise.all([
                orders.updateOne(
                    { orderHash: buyOrderHash },
                    {
                        $set: {
                            'order.remainingAmount': (BigInt(buyOrder.order.remainingAmount) - BigInt(tradeAmount)).toString(),
                            updatedAt: new Date()
                        }
                    }
                ),
                orders.updateOne(
                    { orderHash: sellOrderHash },
                    {
                        $set: {
                            'order.remainingAmount': (BigInt(sellOrder.order.remainingAmount) - BigInt(tradeAmount)).toString(),
                            updatedAt: new Date()
                        }
                    }
                )
            ]);

            // Mark orders as filled if no remaining amount
            if (BigInt(buyOrder.order.remainingAmount) === BigInt(tradeAmount)) {
                await orders.updateOne(
                    { orderHash: buyOrderHash },
                    { $set: { status: 'FILLED' } }
                );
            }

            if (BigInt(sellOrder.order.remainingAmount) === BigInt(tradeAmount)) {
                await orders.updateOne(
                    { orderHash: sellOrderHash },
                    { $set: { status: 'FILLED' } }
                );
            }
        }

        // Update market data
        await updateMarketDataForToken(buyOrder.order.propertyToken);

        revalidatePath('/marketplace');

        return { success: true, tradeId: result.insertedId };
    } catch (error) {
        console.error('Error creating trade:', error);
        return { success: false, error: String(error) };
    }
}

// Get trades with filtering
export async function getTrades(
    propertyToken?: string,
    userAddress?: string,
    limit: number = 50,
    offset: number = 0
) {
    try {
        const { trades } = getCollections();

        const filter: any = { status: 'CONFIRMED' };

        if (propertyToken) {
            filter.propertyToken = propertyToken;
        }

        if (userAddress) {
            filter.$or = [
                { buyer: userAddress },
                { seller: userAddress }
            ];
        }

        const [tradeList, total] = await Promise.all([
            trades.find(filter)
                .sort({ settledAt: -1 })
                .skip(offset)
                .limit(limit)
                .toArray(),
            trades.countDocuments(filter)
        ]);

        return {
            success: true,
            data: {
                trades: tradeList,
                total,
                limit,
                offset,
                hasMore: offset + limit < total,
            }
        };
    } catch (error) {
        console.error('Error getting trades:', error);
        return { success: false, error: String(error) };
    }
}

// Update escrow balance
export async function updateEscrowBalance(
    userAddress: string,
    tokenAddress: string,
    balance: string
) {
    try {
        const { escrowBalances } = getCollections();

        const escrowBalance: EscrowBalance = {
            userAddress,
            tokenAddress,
            balance,
            lastUpdated: new Date(),
        };

        const validatedBalance = EscrowBalanceSchema.parse(escrowBalance);

        const result = await escrowBalances.replaceOne(
            { userAddress, tokenAddress },
            validatedBalance,
            { upsert: true }
        );

        return { success: true, modifiedCount: result.modifiedCount };
    } catch (error) {
        console.error('Error updating escrow balance:', error);
        return { success: false, error: String(error) };
    }
}

// Get escrow balances for a user
export async function getEscrowBalances(userAddress: string) {
    try {
        const { escrowBalances } = getCollections();

        const balances = await escrowBalances.find({ userAddress }).toArray();

        return { success: true, data: balances };
    } catch (error) {
        console.error('Error getting escrow balances:', error);
        return { success: false, error: String(error) };
    }
}

// Update market data for a property token
export async function updateMarketDataForToken(propertyToken: string) {
    try {
        const { trades, orders, marketData } = getCollections();

        // Get recent trades for volume and price data
        const recentTrades = await trades.find({
            propertyToken,
            status: 'CONFIRMED',
            settledAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }).sort({ settledAt: -1 }).toArray();

        // Get current best bid and ask
        const [bestBid, bestAsk] = await Promise.all([
            orders.findOne({
                'order.propertyToken': propertyToken,
                'order.orderType': 'BUY',
                status: 'ACTIVE',
                'order.expiry': { $gt: Math.floor(Date.now() / 1000) }
            }, { sort: { 'order.pricePerShare': -1 } }),
            orders.findOne({
                'order.propertyToken': propertyToken,
                'order.orderType': 'SELL',
                status: 'ACTIVE',
                'order.expiry': { $gt: Math.floor(Date.now() / 1000) }
            }, { sort: { 'order.pricePerShare': 1 } })
        ]);

        // Calculate market statistics
        const stats = calculateMarketStats(recentTrades);

        const marketDataUpdate: MarketData = {
            propertyToken,
            lastPrice: recentTrades[0]?.pricePerShare,
            volume24h: stats.volume,
            priceChange24h: stats.priceChange,
            highestBid: bestBid?.order.pricePerShare,
            lowestAsk: bestAsk?.order.pricePerShare,
            totalBuyVolume: recentTrades
                .filter(t => t.buyer !== t.seller)
                .reduce((sum, t) => (BigInt(sum) + BigInt(t.totalValue)).toString(), '0'),
            totalSellVolume: recentTrades
                .filter(t => t.buyer !== t.seller)
                .reduce((sum, t) => (BigInt(sum) + BigInt(t.totalValue)).toString(), '0'),
            updatedAt: new Date(),
        };

        const validatedMarketData = MarketDataSchema.parse(marketDataUpdate);

        await marketData.replaceOne(
            { propertyToken },
            validatedMarketData,
            { upsert: true }
        );

        return { success: true };
    } catch (error) {
        console.error('Error updating market data:', error);
        return { success: false, error: String(error) };
    }
}

// Get market data for a property token
export async function getMarketData(propertyToken: string) {
    try {
        const { marketData } = getCollections();

        const data = await marketData.findOne({ propertyToken });

        return { success: true, data };
    } catch (error) {
        console.error('Error getting market data:', error);
        return { success: false, error: String(error) };
    }
}

// Get user's order history
export async function getUserOrderHistory(
    userAddress: string,
    limit: number = 50,
    offset: number = 0
) {
    try {
        const { orders } = getCollections();

        const [userOrders, total] = await Promise.all([
            orders.find({ 'order.maker': userAddress })
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(limit)
                .toArray(),
            orders.countDocuments({ 'order.maker': userAddress })
        ]);

        return {
            success: true,
            data: {
                orders: userOrders,
                total,
                limit,
                offset,
                hasMore: offset + limit < total,
            }
        };
    } catch (error) {
        console.error('Error getting user order history:', error);
        return { success: false, error: String(error) };
    }
}

// Clean up expired orders
export async function cleanupExpiredOrders() {
    try {
        const { orders } = getCollections();
        const now = Math.floor(Date.now() / 1000);

        const result = await orders.updateMany(
            {
                status: 'ACTIVE',
                'order.expiry': { $lt: now }
            },
            {
                $set: {
                    status: 'EXPIRED',
                    updatedAt: new Date()
                }
            }
        );

        console.log(`Expired ${result.modifiedCount} orders`);
        return { success: true, expiredCount: result.modifiedCount };
    } catch (error) {
        console.error('Error cleaning up expired orders:', error);
        return { success: false, error: String(error) };
    }
}

// Get trading statistics for a user
export async function getUserTradingStats(userAddress: string, days: number = 30) {
    try {
        const { trades } = getCollections();
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const userTrades = await trades.find({
            $or: [{ buyer: userAddress }, { seller: userAddress }],
            status: 'CONFIRMED',
            settledAt: { $gte: cutoff }
        }).toArray();

        const totalVolume = userTrades.reduce((sum, trade) =>
            (BigInt(sum) + BigInt(trade.totalValue)).toString(), '0'
        );

        const buyTrades = userTrades.filter(t => t.buyer === userAddress);
        const sellTrades = userTrades.filter(t => t.seller === userAddress);

        const buyVolume = buyTrades.reduce((sum, trade) =>
            (BigInt(sum) + BigInt(trade.totalValue)).toString(), '0'
        );

        const sellVolume = sellTrades.reduce((sum, trade) =>
            (BigInt(sum) + BigInt(trade.totalValue)).toString(), '0'
        );

        return {
            success: true,
            data: {
                totalTrades: userTrades.length,
                totalVolume,
                buyTrades: buyTrades.length,
                sellTrades: sellTrades.length,
                buyVolume,
                sellVolume,
                period: `${days} days`,
            }
        };
    } catch (error) {
        console.error('Error getting user trading stats:', error);
        return { success: false, error: String(error) };
    }
}

// Batch update order statuses (useful for blockchain sync)
export async function batchUpdateOrderStatuses(updates: Array<{
    orderHash: string;
    status: 'ACTIVE' | 'FILLED' | 'CANCELLED' | 'EXPIRED';
    remainingAmount?: string;
}>) {
    try {
        const { orders } = getCollections();

        const bulkOps = updates.map(update => ({
            updateOne: {
                filter: { orderHash: update.orderHash },
                update: {
                    $set: {
                        status: update.status,
                        ...(update.remainingAmount && { 'order.remainingAmount': update.remainingAmount }),
                        updatedAt: new Date(),
                    }
                }
            }
        }));

        const result = await orders.bulkWrite(bulkOps);

        return {
            success: true,
            modifiedCount: result.modifiedCount,
            matchedCount: result.matchedCount
        };
    } catch (error) {
        console.error('Error batch updating order statuses:', error);
        return { success: false, error: String(error) };
    }
}