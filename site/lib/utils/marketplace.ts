import { keccak256, toBytes, encodePacked } from 'viem';
import type { Order, SignedOrder, Trade } from "@/types/marketplace";
import "dotenv/config";
const ENVIRONMENT = process.env.ENVIRONMENT || 'TESTNET';
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT;
if (!CONTRACT_ADDRESS) {
    throw new Error('MARKETPLACE_CONTRACT environment variable is not set');
}
// EIP-712 Domain for order signing
export const EIP712_DOMAIN = {
    name: 'AtriaMarketPlace',
    version: '1.0.0',
    chainId: ENVIRONMENT === "TESTNET" ? 296 : 295,
    verifyingContract: CONTRACT_ADDRESS,
} as const;

// EIP-712 Types for orders
export const EIP712_TYPES = {
    BuyOrder: [
        { name: 'maker', type: 'address' },
        { name: 'propertyToken', type: 'address' },
        { name: 'remainingAmount', type: 'uint256' },
        { name: 'pricePerShare', type: 'uint256' },
        { name: 'expiry', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
    ],
    SellOrder: [
        { name: 'maker', type: 'address' },
        { name: 'propertyToken', type: 'address' },
        { name: 'remainingAmount', type: 'uint256' },
        { name: 'pricePerShare', type: 'uint256' },
        { name: 'expiry', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
    ],
} as const;

/**
 * Generate a unique order hash for tracking
 * This creates a deterministic hash from order parameters
 */
export function generateOrderHash(order: Order): string {
    try {
        const encoded = encodePacked(
            ['address', 'address', 'uint256', 'uint256', 'uint256', 'uint256', 'string'],
            [
                order.maker as `0x${string}`,
                order.propertyToken as `0x${string}`,
                BigInt(Number(order.remainingAmount)),
                BigInt(Number(order.pricePerShare) * 10**6),
                BigInt(order.expiry),
                BigInt(order.nonce),
                order.orderType,
            ]
        );

        return keccak256(encoded);
    } catch (error) {
        console.error('Error generating order hash:', error);
        throw new Error('Failed to generate order hash');
    }
}

/**
 * Check if two orders can be matched
 * Returns true if orders are compatible for trading
 */
export function canOrdersMatch(buyOrder: Order, sellOrder: Order): boolean {
    // Basic validation - order types must be opposite
    if (buyOrder.orderType !== 'BUY' || sellOrder.orderType !== 'SELL') {
        return false;
    }

    // Must be for the same property token
    if (buyOrder.propertyToken !== sellOrder.propertyToken) {
        return false;
    }

    // Check if orders are not expired
    const now = Math.floor(Date.now() / 1000);
    if (buyOrder.expiry < now || sellOrder.expiry < now) {
        return false;
    }

    // Check if buy price >= sell price (economic condition for match)
    if (parseFloat(buyOrder.pricePerShare) < parseFloat(sellOrder.pricePerShare)) {
        return false;
    }

    // Check if both orders have remaining amount
    if (parseFloat(buyOrder.remainingAmount) === 0 || parseFloat(sellOrder.remainingAmount) === 0) {
        return false;
    }

    return true;
}

/**
 * Calculate trade parameters for matched orders
 * Returns the trade amount, price, and total value
 */
export function calculateTradeParams(buyOrder: Order, sellOrder: Order): {
    tradeAmount: string;
    pricePerShare: string;
    totalValue: string;
} {
    if (!canOrdersMatch(buyOrder, sellOrder)) {
        throw new Error('Orders cannot be matched');
    }

    // Trade amount is minimum of both remaining amounts
    const buyAmount = parseFloat(buyOrder.remainingAmount);
    const sellAmount = parseFloat(sellOrder.remainingAmount);
    const tradeAmount = buyAmount < sellAmount ? buyAmount : sellAmount;

    // Price is typically the maker's price (seller's price in this case)
    // This is the standard practice in orderbook matching
    const pricePerShare = sellOrder.pricePerShare;

    // Total value calculation
    const totalValue = (tradeAmount * parseFloat(pricePerShare)).toString();

    return {
        tradeAmount: tradeAmount.toString(),
        pricePerShare,
        totalValue,
    };
}

/**
 * Check if an order is expired
 */
export function isOrderExpired(order: Order): boolean {
    const now = Math.floor(Date.now() / 1000);
    return order.expiry < now;
}

/**
 * Calculate order fulfillment percentage
 */
export function getOrderFulfillmentPercentage(
    originalAmount: string,
    remainingAmount: string
): number {
    const original = parseFloat(originalAmount);
    const remaining = parseFloat(remainingAmount);

    if (original === 0) return 0;

    const filled = original - remaining;
    return Number((filled * (10000)) / original);
}

/**
 * Generate trade ID from order hashes
 * Creates a unique identifier for each trade
 */
export function generateTradeId(buyOrderHash: string, sellOrderHash: string): string {
    try {
        const combined = encodePacked(
            ['bytes32', 'bytes32'],
            [buyOrderHash as `0x${string}`, sellOrderHash as `0x${string}`]
        );
        return keccak256(combined);
    } catch (error) {
        console.error('Error generating trade ID:', error);
        throw new Error('Failed to generate trade ID');
    }
}

/**
 * Validate order signature format
 */
export function isValidSignature(signature: string): boolean {
    return /^0x[a-fA-F0-9]{130}$/.test(signature);
}

/**
 * Get order type display string
 */
export function getOrderTypeDisplay(orderType: 'BUY' | 'SELL'): string {
    return orderType === 'BUY' ? 'Buy' : 'Sell';
}

/**
 * Format price for display (converts from wei-like representation)
 */
export function formatPrice(pricePerShare: string, decimals: number = 6): string {
    const price = parseFloat(pricePerShare);
    const divisor = (10 ** decimals);
    const wholePart = price / divisor;
    const fractionalPart = price % divisor;

    if (fractionalPart === 0) {
        return wholePart.toString();
    }

    const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
    const trimmed = fractionalStr.replace(/0+$/, '');

    return `${wholePart}.${trimmed}`;
}

/**
 * Parse price from display format to wei-like representation
 */
export function parsePrice(displayPrice: string, decimals: number = 6): string {
    const parts = displayPrice.split('.');
    const wholePart = parseFloat(parts[0] || '0');

    let fractionalPart = 0;
    if (parts[1]) {
        const fractionalStr = parts[1].padEnd(decimals, '0').slice(0, decimals);
        fractionalPart = parseFloat(fractionalStr);
    }

    const divisor = (10 ** decimals);
    return (wholePart * divisor + fractionalPart).toString();
}

/**
 * Calculate market statistics from trades
 * Returns volume, price changes, and other market metrics
 */
export function calculateMarketStats(trades: Trade[], timeframe: number = 24 * 60 * 60 * 1000) {
    const now = Date.now();
    const cutoff = new Date(now - timeframe);

    // Filter trades within timeframe and confirmed status
    const recentTrades = trades.filter(trade =>
        trade.createdAt >= cutoff && trade.status === 'CONFIRMED'
    );

    if (recentTrades.length === 0) {
        return {
            volume: '0',
            priceChange: '0',
            high: '0',
            low: '0',
            average: '0',
            tradeCount: 0,
        };
    }

    // Calculate total volume
    const volumes = recentTrades.map(t => parseFloat(t.totalValue));
    const totalVolume = volumes.reduce((sum, vol) => sum + vol, 0);

    // Calculate price statistics
    const prices = recentTrades.map(t => parseFloat(t.pricePerShare));
    const highPrice = prices.reduce((max, price) => price > max ? price : max, 0);
    const lowPrice = prices.reduce((min, price) => price < min ? price : min, prices[0]);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    // Calculate price change (first vs last trade in timeframe)
    // Sort by timestamp to get chronological order
    const sortedTrades = [...recentTrades].sort((a, b) =>
        a.createdAt.getTime() - b.createdAt.getTime()
    );
    const firstPrice = parseFloat(sortedTrades[0].pricePerShare);
    const lastPrice = parseFloat(sortedTrades[sortedTrades.length - 1].pricePerShare);
    const priceChange = lastPrice - firstPrice;

    return {
        volume: totalVolume.toString(),
        priceChange: priceChange.toString(),
        high: highPrice.toString(),
        low: lowPrice.toString(),
        average: avgPrice.toString(),
        tradeCount: recentTrades.length,
    };
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(oldValue: string, newValue: string): number {
    const oldVal = parseFloat(oldValue);
    const newVal = parseFloat(newValue);

    if (oldVal === 0) return 0;

    const change = ((newVal - oldVal) * (10000)) / oldVal;
    return Number(change) / 100;
}

/**
 * Format volume for display (with K, M, B suffixes)
 */
export function formatVolume(volume: string, decimals: number = 6): string {
    const val = Number(parseFloat(volume)) / (10 ** decimals);

    if (val >= 1_000_000_000) {
        return `${(val / 1_000_000_000).toFixed(2)}B`;
    }
    if (val >= 1_000_000) {
        return `${(val / 1_000_000).toFixed(2)}M`;
    }
    if (val >= 1_000) {
        return `${(val / 1_000).toFixed(2)}K`;
    }
    return val.toFixed(2);
}

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Shorten address for display (0x1234...5678)
 */
export function shortenAddress(address: string, chars: number = 4): string {
    if (!isValidAddress(address)) return address;
    return `${address.substring(0, chars + 2)}...${address.substring(42 - chars)}`;
}

/**
 * Calculate time until expiry
 */
export function getTimeUntilExpiry(expiry: number): {
    expired: boolean;
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
    formatted: string;
} {
    const now = Math.floor(Date.now() / 1000);
    const secondsLeft = expiry - now;

    if (secondsLeft <= 0) {
        return {
            expired: true,
            seconds: 0,
            minutes: 0,
            hours: 0,
            days: 0,
            formatted: 'Expired',
        };
    }

    const days = Math.floor(secondsLeft / 86400);
    const hours = Math.floor((secondsLeft % 86400) / 3600);
    const minutes = Math.floor((secondsLeft % 3600) / 60);
    const seconds = secondsLeft % 60;

    let formatted = '';
    if (days > 0) formatted += `${days}d `;
    if (hours > 0 || days > 0) formatted += `${hours}h `;
    if (minutes > 0 || hours > 0 || days > 0) formatted += `${minutes}m`;
    if (days === 0 && hours === 0 && minutes < 5) formatted += ` ${seconds}s`;

    return {
        expired: false,
        seconds,
        minutes,
        hours,
        days,
        formatted: formatted.trim(),
    };
}