
import { MongoClient, Collection, WithId } from 'mongodb';
import client from '@/db/connection';
import { SignedOrderSchema, TradeSchema, EscrowBalanceSchema, MarketDataSchema, CreateOrderRequestSchema, OrderQuerySchema, type SignedOrder, type Trade, type EscrowBalance, type MarketData, type Order, MatchingOrder  } from '@/types/marketplace';
import { generateOrderHash, canOrdersMatch, calculateTradeParams, isOrderExpired, generateTradeId, calculateMarketStats, } from '@/lib/utils/marketplace';
import { startMatchingEngine } from '@/lib/matching-engine';
export class MarketplaceService {
    private static collections: {
        orders: Collection<SignedOrder>;
        trades: Collection<Trade>;
        escrowBalances: Collection<EscrowBalance>;
        marketData: Collection<MarketData>;
    } | null = null;

    /**
     * Get MongoDB collections with lazy initialization and index creation
     */
    private static async getCollections() {
        if (!this.collections) {
            const db = client.db('real-estate-app');
            this.collections = {
                orders: db.collection<SignedOrder>('marketplace_orders'),
                trades: db.collection<Trade>('marketplace_trades'),
                escrowBalances: db.collection<EscrowBalance>('escrow_balances'),
                marketData: db.collection<MarketData>('market_data'),
            };

            // Initialize indexes when collections are first accessed
            await this.initializeIndexes();
        }
        return this.collections;
    }

    /**
     * Initialize all marketplace indexes
     */
    private static async initializeIndexes() {
        if (!this.collections) {
            throw new Error('Collections not initialized');
        }

        const { orders, trades, escrowBalances, marketData } = this.collections;

        try {
            await Promise.all([
                orders.createIndexes([
                    { key: { orderHash: 1 }, unique: true },
                    { key: { 'order.maker': 1, status: 1 } },
                    { key: { 'order.propertyToken': 1, 'order.orderType': 1, status: 1 } },
                    { key: { 'order.expiry': 1 } },
                    { key: { 'order.pricePerShare': 1 } },
                    { key: { createdAt: -1 } },
                ]),

                trades.createIndexes([
                    { key: { buyOrderHash: 1, sellOrderHash: 1 }, unique: true },
                    { key: { propertyToken: 1, status: 1 } },
                    { key: { buyer: 1 } },
                    { key: { seller: 1 } },
                    { key: { createdAt: -1 } },
                    { key: { settledAt: -1 } },
                ]),

                escrowBalances.createIndexes([
                    { key: { userAddress: 1, tokenAddress: 1 }, unique: true },
                    { key: { lastUpdated: -1 } },
                ]),

                marketData.createIndexes([
                    { key: { propertyToken: 1 }, unique: true },
                    { key: { updatedAt: -1 } },
                ])
            ]);

            console.log('Marketplace indexes created successfully');
        } catch (error) {
            console.error('Error creating marketplace indexes:', error);
            throw error;
        }
    }
    /**
     * Create a new order in the marketplace
     * @param orderData Order data
     * @param signature Order signature
     * @param makerAddress Address of the order maker
     * @returns Result of the order creation
     */
    static async createOrder(
        orderData: typeof CreateOrderRequestSchema['_input']['orderData'],
        signature: string,
        makerAddress: string
    ) {
        try {
            console.log('Creating order for maker:', makerAddress);
            console.log('Order data:', orderData);
            const parsed = CreateOrderRequestSchema.safeParse({ orderData, signature });
            if (!parsed.success) {
                return { success: false, error: 'Invalid order data or signature' };
            }
            const validatedRequest = parsed.data;

            const completeOrder: Order = {
                ...validatedRequest.orderData,
                maker: makerAddress,
            };

            // Generate order hash
            const orderHash = generateOrderHash(completeOrder);

            // Check if order already exists
            const { orders } = await this.getCollections();
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
            // await this.updateMarketDataForToken(completeOrder.propertyToken);
            await startMatchingEngine(1); // Start matching engine if not already running
            console.log(`Order ${orderHash} created successfully`);
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

    /**
     * Get orders with filtering and pagination
     */
    static async getOrders(query: typeof OrderQuerySchema['_input'] = {}) {
        try {
            const validatedQuery = OrderQuerySchema.parse(query);
            const { orders } = await this.getCollections();

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

    /**
     * Get orderbook for a property token
     */
    static async getOrderbook(propertyToken: string, limit: number = 20) {
        try {
            const { orders } = await this.getCollections();

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
                        ? (parseFloat(sellOrders[0].order.pricePerShare) - parseFloat(buyOrders[0].order.pricePerShare)).toString()
                        : '0'
                }
            };
        } catch (error) {
            console.error('Error getting orderbook:', error);
            return { success: false, error: String(error) };
        }
    }

    /**
     * Cancel an order
     */
    static async cancelOrder(orderHash: string, makerAddress: string) {
        try {
            const { orders } = await this.getCollections();

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

            return { success: true };
        } catch (error) {
            console.error('Error cancelling order:', error);
            return { success: false, error: String(error) };
        }
    }

    /**
     * Find matching orders for a given order
     * @param targetOrderHash Hash of the order to find matches for
     * @returns Orders that can potentially match
     */
    static async findMatches(targetOrderHash: string): Promise<{data: MatchingOrder[], success: boolean} | { error: string, success: false }> {
        try {
            const { orders } = await this.getCollections();

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
            const matches = potentialMatches.filter((order: SignedOrder) => {
                if (targetOrder.order.orderType === 'BUY') {
                    return canOrdersMatch(targetOrder.order, order.order);
                } else {
                    return canOrdersMatch(order.order, targetOrder.order);
                }
            });

            // Sort matches by best price
            matches.sort((a: SignedOrder, b: SignedOrder) => {
                const priceA = parseFloat(a.order.pricePerShare);
                const priceB = parseFloat(b.order.pricePerShare);

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

    /**
     * Create a trade record (called when settlement occurs)
     */
    static async createTrade(
        buyOrderHash: string,
        sellOrderHash: string,
        txHash?: string
    ) {
        try {
            const { orders, trades } = await this.getCollections();

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
                                'order.remainingAmount': (parseFloat(buyOrder.order.remainingAmount) - parseFloat(tradeAmount)).toString(),
                                updatedAt: new Date()
                            }
                        }
                    ),
                    orders.updateOne(
                        { orderHash: sellOrderHash },
                        {
                            $set: {
                                'order.remainingAmount': (parseFloat(sellOrder.order.remainingAmount) - parseFloat(tradeAmount)).toString(),
                                updatedAt: new Date()
                            }
                        }
                    )
                ]);

                // Mark orders as filled if no remaining amount
                if (parseFloat(buyOrder.order.remainingAmount) === parseFloat(tradeAmount)) {
                    await orders.updateOne(
                        { orderHash: buyOrderHash },
                        { $set: { status: 'FILLED' } }
                    );
                }

                if (parseFloat(sellOrder.order.remainingAmount) === parseFloat(tradeAmount)) {
                    await orders.updateOne(
                        { orderHash: sellOrderHash },
                        { $set: { status: 'FILLED' } }
                    );
                }
            }

            // Update market data
            // await this.updateMarketDataForToken(buyOrder.order.propertyToken);


            return { success: true, tradeId: result.insertedId };
        } catch (error) {
            console.error('Error creating trade:', error);
            return { success: false, error: String(error) };
        }
    }

    /**
     * Get trades with filtering
     */
    static async getTrades(
        propertyToken?: string,
        userAddress?: string,
        limit: number = 50,
        offset: number = 0
    ) {
        try {
            const { trades } = await this.getCollections();

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

    /**
     * Update escrow balance
     */
    static async updateEscrowBalance(
        userAddress: string,
        tokenAddress: string,
        balance: string
    ) {
        try {
            const { escrowBalances } = await this.getCollections();

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

    /**
     * Get escrow balances for a user
     */
    static async getEscrowBalances(userAddress: string) {
        try {
            const { escrowBalances } = await this.getCollections();

            const balances = await escrowBalances.find({ userAddress }).toArray();

            return { success: true, data: balances };
        } catch (error) {
            console.error('Error getting escrow balances:', error);
            return { success: false, error: String(error) };
        }
    }

    /**
     * Update market data for a property token
     */
    static async updateMarketDataForToken(propertyToken: string) {
        try {
            const { trades, orders, marketData } = await this.getCollections();

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
                highestBid: '9',
                lowestAsk: '9',
                totalBuyVolume: recentTrades
                    .filter((t: Trade) => t.buyer !== t.seller)
                    .reduce((sum: string, t: Trade) => (parseFloat(sum) + parseFloat(t.totalValue)).toString(), '0'),
                totalSellVolume: recentTrades
                    .filter((t: Trade) => t.buyer !== t.seller)
                    .reduce((sum: string, t: Trade) => (parseFloat(sum) + parseFloat(t.totalValue)).toString(), '0'),
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

    /**
     * Get market data for a property token
     */
    static async getMarketData(propertyToken: string) {
        try {
            const { marketData } = await this.getCollections();

            const data = await marketData.findOne({ propertyToken });

            return { success: true, data };
        } catch (error) {
            console.error('Error getting market data:', error);
            return { success: false, error: String(error) };
        }
    }

    /**
     * Get user's order history
     */
    static async getUserOrderHistory(
        userAddress: string,
        limit: number = 50,
        offset: number = 0
    ) {
        try {
            const { orders } = await this.getCollections();

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

    /**
     * Clean up expired orders
     */
    static async cleanupExpiredOrders() {
        try {
            const { orders } = await this.getCollections();
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

    /**
     * Get trading statistics for a user
     */
    static async getUserTradingStats(userAddress: string, days: number = 30) {
        try {
            const { trades } = await this.getCollections();
            const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

            const userTrades = await trades.find({
                $or: [{ buyer: userAddress }, { seller: userAddress }],
                status: 'CONFIRMED',
                settledAt: { $gte: cutoff }
            }).toArray();

            const totalVolume = userTrades.reduce((sum: string, trade: Trade) =>
                (parseFloat(sum) + parseFloat(trade.totalValue)).toString(), '0'
            );

            const buyTrades = userTrades.filter((t: Trade) => t.buyer === userAddress);
            const sellTrades = userTrades.filter((t: Trade) => t.seller === userAddress);

            const buyVolume = buyTrades.reduce((sum: string, trade: Trade) =>
                (parseFloat(sum) + parseFloat(trade.totalValue)).toString(), '0'
            );

            const sellVolume = sellTrades.reduce((sum: string, trade: Trade) =>
                (parseFloat(sum) + parseFloat(trade.totalValue)).toString(), '0'
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

    /**
     * Batch update order statuses (useful for blockchain sync)
     */
    static async batchUpdateOrderStatuses(updates: Array<{
        orderHash: string;
        status: 'ACTIVE' | 'FILLED' | 'CANCELLED' | 'EXPIRED';
        remainingAmount?: string;
    }>) {
        try {
            const { orders } = await this.getCollections();

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
}
