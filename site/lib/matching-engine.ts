import { MongoClient, Collection } from 'mongodb';
import client from '@/db/connection';
import { type SignedOrder, type Order, type Trade, SignedOrderSchema, TradeSchema, } from '@/types/marketplace';
import { canOrdersMatch, calculateTradeParams, generateTradeId, isOrderExpired, } from '@/lib/utils/marketplace';
import { createTrade, cleanupExpiredOrders } from '@/server-actions/marketplace/marketplace';

interface MatchingResult {
  matches: Array<{
    buyOrder: SignedOrder;
    sellOrder: SignedOrder;
    tradeParams: {
      tradeAmount: string;
      pricePerShare: string;
      totalValue: string;
    };
  }>;
  unmatched: SignedOrder[];
}

export class MatchingEngine {
  private static collections: {
    orders: Collection<SignedOrder>;
    trades: Collection<Trade>;
  } | null = null;

  private static async getCollections() {
    if (!this.collections) {
      const db = client.db('real-estate-app');
      this.collections = {
        orders: db.collection<SignedOrder>('marketplace_orders'),
        trades: db.collection<Trade>('marketplace_trades'),
      };


      await this.initializeIndexes();
    }
    return this.collections;
  }


  private static async initializeIndexes() {
    if (!this.collections) {
      throw new Error('Collections not initialized');
    }

    const { orders, trades } = this.collections;

    try {
      await Promise.all([
        orders.createIndexes([
          { key: { orderHash: 1 }, unique: true },
          { key: { 'order.maker': 1, status: 1 } },
          { key: { 'order.propertyToken': 1, 'order.orderType': 1, status: 1 } },
          { key: { 'order.propertyToken': 1, status: 1, 'order.expiry': 1, 'order.remainingAmount': 1 } },
          { key: { 'order.expiry': 1 } },
          { key: { 'order.pricePerShare': 1 } },
          { key: { createdAt: -1 } },
          { key: { status: 1, 'order.expiry': 1, 'order.remainingAmount': 1 } },
        ]),

        trades.createIndexes([
          { key: { buyOrderHash: 1, sellOrderHash: 1 }, unique: true },
          { key: { propertyToken: 1, status: 1 } },
          { key: { buyer: 1 } },
          { key: { seller: 1 } },
          { key: { createdAt: -1 } },
          { key: { settledAt: -1 } },
          { key: { createdAt: 1, status: 1 } },
        ])
      ]);

      console.log('Matching engine indexes created successfully');
    } catch (error) {
      console.error('Error creating matching engine indexes:', error);
      throw error;
    }
  }

  /**
   * Find all possible matches for a given property token
   */
  async findMatches(propertyToken: string, maxMatches: number = 100): Promise<MatchingResult> {
    try {
      const { orders: ordersCollection } = await MatchingEngine.getCollections();

      // Get all active orders for this property token
      const activeOrders = await ordersCollection.find({
        'order.propertyToken': propertyToken,
        status: 'ACTIVE',
        'order.expiry': { $gt: Math.floor(Date.now() / 1000) },
        'order.remainingAmount': { $gt: '0' }
      }).toArray();

      // Separate buy and sell orders
      const buyOrders = activeOrders.filter((order: SignedOrder) => order.order.orderType === 'BUY');
      const sellOrders = activeOrders.filter((order: SignedOrder) => order.order.orderType === 'SELL');

      // Sort orders by price (buy orders desc, sell orders asc for optimal matching)
      buyOrders.sort((a: SignedOrder, b: SignedOrder) => {
        const priceA = BigInt(a.order.pricePerShare);
        const priceB = BigInt(b.order.pricePerShare);
        return priceA > priceB ? -1 : priceA < priceB ? 1 : 0;
      });

      sellOrders.sort((a: SignedOrder, b: SignedOrder) => {
        const priceA = BigInt(a.order.pricePerShare);
        const priceB = BigInt(b.order.pricePerShare);
        return priceA < priceB ? -1 : priceA > priceB ? 1 : 0;
      });

      const matches: MatchingResult['matches'] = [];
      const processedOrders = new Set<string>();
      let matchCount = 0;

      // Find matches using a greedy approach
      for (const buyOrder of buyOrders) {
        if (processedOrders.has(buyOrder.orderHash) || matchCount >= maxMatches) {
          break;
        }

        for (const sellOrder of sellOrders) {
          if (processedOrders.has(sellOrder.orderHash) || matchCount >= maxMatches) {
            continue;
          }

          if (canOrdersMatch(buyOrder.order, sellOrder.order)) {
            const tradeParams = calculateTradeParams(buyOrder.order, sellOrder.order);

            matches.push({
              buyOrder,
              sellOrder,
              tradeParams,
            });

            // Update remaining amounts for further matching
            const newBuyRemaining = (BigInt(buyOrder.order.remainingAmount) - BigInt(tradeParams.tradeAmount)).toString();
            const newSellRemaining = (BigInt(sellOrder.order.remainingAmount) - BigInt(tradeParams.tradeAmount)).toString();

            buyOrder.order.remainingAmount = newBuyRemaining;
            sellOrder.order.remainingAmount = newSellRemaining;

            // Mark as processed if fully filled
            if (newBuyRemaining === '0') {
              processedOrders.add(buyOrder.orderHash);
            }
            if (newSellRemaining === '0') {
              processedOrders.add(sellOrder.orderHash);
            }

            matchCount++;
            continue; // Move to next buy order
          }
        }
      }

      // Get unmatched orders (those with remaining amounts > 0 and not processed)
      const unmatched = activeOrders.filter((order: SignedOrder) =>
        !processedOrders.has(order.orderHash) &&
        BigInt(order.order.remainingAmount) > BigInt(0)
      );

      return {
        matches,
        unmatched,
      };
    } catch (error) {
      console.error('Error in findMatches:', error);
      throw error;
    }
  }

  /**
   * Execute trades for matched orders
   */
  async executeMatches(
    matches: MatchingResult['matches'],
    onChainSettlement: (buyOrder: SignedOrder, sellOrder: SignedOrder) => Promise<string>
  ): Promise<Array<{ success: boolean; tradeId?: any; error?: string; txHash?: string }>> {
    const results = [];

    for (const match of matches) {
      try {
        // Call on-chain settlement function
        const txHash = await onChainSettlement(match.buyOrder, match.sellOrder);

        // Create trade record
        const tradeResult = await createTrade(
          match.buyOrder.orderHash,
          match.sellOrder.orderHash,
          txHash
        );

        results.push({
          success: tradeResult.success,
          tradeId: tradeResult.tradeId,
          txHash,
          error: tradeResult.error,
        });

      } catch (error) {
        console.error('Error executing match:', error);
        results.push({
          success: false,
          error: String(error),
        });
      }
    }

    return results;
  }

  /**
   * Run matching engine for all active property tokens
   */
  async runMatchingCycle(): Promise<{
    processedTokens: number;
    totalMatches: number;
    totalTrades: number;
    errors: string[];
  }> {
    console.log('🔄 Starting matching engine cycle...');

    const errors: string[] = [];
    let processedTokens = 0;
    let totalMatches = 0;
    let totalTrades = 0;

    try {
      // Clean up expired orders first
      await cleanupExpiredOrders();

      // Get all unique property tokens with active orders
      const { orders: ordersCollection } = await MatchingEngine.getCollections();
      const activeTokens = await ordersCollection.distinct('order.propertyToken', {
        status: 'ACTIVE',
        'order.expiry': { $gt: Math.floor(Date.now() / 1000) },
        'order.remainingAmount': { $gt: '0' }
      });

      console.log(`📊 Found ${activeTokens.length} property tokens with active orders`);

      for (const propertyToken of activeTokens) {
        try {
          console.log(`🏠 Processing token: ${propertyToken}`);

          const matchResult = await this.findMatches(propertyToken);
          processedTokens++;
          totalMatches += matchResult.matches.length;

          if (matchResult.matches.length > 0) {
            console.log(`✨ Found ${matchResult.matches.length} matches for ${propertyToken}`);

            // In a real implementation, you would call your on-chain settlement here
            // For now, we'll simulate the settlement
            const mockSettlement = async (buyOrder: SignedOrder, sellOrder: SignedOrder) => {
              // Simulate blockchain transaction
              await new Promise(resolve => setTimeout(resolve, 100));
              return `0x${Math.random().toString(16).substr(2, 64)}`;
            };

            const executionResults = await this.executeMatches(matchResult.matches, mockSettlement);
            const successfulTrades = executionResults.filter(r => r.success).length;
            totalTrades += successfulTrades;

            console.log(`✅ Executed ${successfulTrades}/${matchResult.matches.length} trades for ${propertyToken}`);
          }

        } catch (error) {
          const errorMsg = `Error processing token ${propertyToken}: ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }

    } catch (error) {
      const errorMsg = `Error in matching cycle: ${error}`;
      console.error(errorMsg);
      errors.push(errorMsg);
    }

    console.log(`🏁 Matching cycle completed:
      - Processed tokens: ${processedTokens}
      - Total matches found: ${totalMatches}
      - Total trades executed: ${totalTrades}
      - Errors: ${errors.length}`);

    return {
      processedTokens,
      totalMatches,
      totalTrades,
      errors,
    };
  }

  /**
   * Get matching statistics
   */
  async getMatchingStats(hours: number = 24) {
    try {
      const { trades: tradesCollection } = await MatchingEngine.getCollections();
      const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);

      const recentTrades = await tradesCollection.find({
        createdAt: { $gte: cutoff },
        status: 'CONFIRMED'
      }).toArray();

      const totalVolume = recentTrades.reduce((sum: string, trade: Trade) =>
        (BigInt(sum) + BigInt(trade.totalValue)).toString(), '0'
      );

      const uniqueTokens = new Set(recentTrades.map((trade: Trade) => trade.propertyToken)).size;
      const uniqueUsers = new Set([
        ...recentTrades.map((trade: Trade) => trade.buyer),
        ...recentTrades.map((trade: Trade) => trade.seller)
      ]).size;

      return {
        period: `${hours} hours`,
        totalTrades: recentTrades.length,
        totalVolume,
        uniqueTokens,
        uniqueUsers,
        averageTradeSize: recentTrades.length > 0
          ? (BigInt(totalVolume) / BigInt(recentTrades.length)).toString()
          : '0',
      };
    } catch (error) {
      console.error('Error getting matching stats:', error);
      throw error;
    }
  }

  /**
   * Simulate order matching without execution (for testing)
   */
  async simulateMatching(propertyToken: string): Promise<{
    potentialMatches: number;
    totalVolume: string;
    priceRange: { min: string; max: string };
    details: MatchingResult;
  }> {
    try {
      const matchResult = await this.findMatches(propertyToken);

      const totalVolume = matchResult.matches.reduce((sum, match) =>
        (BigInt(sum) + BigInt(match.tradeParams.totalValue)).toString(), '0'
      );

      const prices = matchResult.matches.map(match => BigInt(match.tradeParams.pricePerShare));
      const minPrice = prices.length > 0 ? Math.min(...prices.map(p => Number(p))).toString() : '0';
      const maxPrice = prices.length > 0 ? Math.max(...prices.map(p => Number(p))).toString() : '0';

      return {
        potentialMatches: matchResult.matches.length,
        totalVolume,
        priceRange: { min: minPrice, max: maxPrice },
        details: matchResult,
      };
    } catch (error) {
      console.error('Error in simulateMatching:', error);
      throw error;
    }
  }
}

// Singleton instance
export const matchingEngine = new MatchingEngine();

// Utility function to run matching engine periodically
export function startMatchingEngine(intervalMinutes: number = 5) {
  console.log(`🚀 Starting matching engine with ${intervalMinutes}-minute intervals`);

  // Run immediately
  matchingEngine.runMatchingCycle().catch(console.error);

  // Schedule periodic runs
  const interval = setInterval(() => {
    matchingEngine.runMatchingCycle().catch(console.error);
  }, intervalMinutes * 60 * 1000);

  // Return cleanup function
  return () => {
    console.log('⏹️ Stopping matching engine');
    clearInterval(interval);
  };
}

export default MatchingEngine;