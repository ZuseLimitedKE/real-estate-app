import { z } from 'zod';

const BaseOrderSchema = z.object({
  maker: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  propertyToken: z.string(),
  remainingAmount: z.string(),
  pricePerShare: z.string(),
  expiry: z.number().int().positive("Expiry must be a positive timestamp"),
  nonce: z.string().regex(/^\d+$/, "Nonce must be a valid integer string"),
});

export const BuyOrderSchema = BaseOrderSchema.extend({
  orderType: z.literal('BUY'),
});

export const SellOrderSchema = BaseOrderSchema.extend({
  orderType: z.literal('SELL'),
});

export const OrderSchema = z.union([BuyOrderSchema, SellOrderSchema]);

export const SignedOrderSchema = z.object({
  order: OrderSchema,
  signature: z.string(),
  orderHash: z.string(),
  status: z.enum(['ACTIVE', 'FILLED', 'CANCELLED', 'EXPIRED']).default('ACTIVE'),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const TradeSchema = z.object({
  buyOrderHash: z.string(),
  sellOrderHash: z.string(),
  propertyToken: z.string(),
  buyer: z.string(),
  seller: z.string(),
  tradeAmount: z.string(),
  pricePerShare: z.string(),
  totalValue: z.string(),
  txHash: z.string().optional(),
  blockNumber: z.number().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'FAILED']).default('PENDING'),
  createdAt: z.date().default(() => new Date()),
  settledAt: z.date().optional(),
});

export const EscrowBalanceSchema = z.object({
  userAddress: z.string(),
  tokenAddress: z.string(),
  balance: z.string(),
  lastUpdated: z.date().default(() => new Date()),
});

export const CreateOrderRequestSchema = z.object({
  orderData: z.union([
    BuyOrderSchema.omit({ maker: true }),
    SellOrderSchema.omit({ maker: true })
  ]),
  signature: z.string(),
});

export const OrderQuerySchema = z.object({
  propertyToken: z.string().optional(),
  orderType: z.enum(['BUY', 'SELL']).optional(),
  maker: z.string().optional(),
  status: z.enum(['ACTIVE', 'FILLED', 'CANCELLED', 'EXPIRED']).optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

export const MarketDataSchema = z.object({
  propertyToken: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  lastPrice: z.string().regex(/^\d+$/).optional(),
  volume24h: z.string().regex(/^\d+$/).default('0'),
  priceChange24h: z.string().regex(/^-?\d+$/).default('0'),
  highestBid: z.string().regex(/^\d+$/).optional(),
  lowestAsk: z.string().regex(/^\d+$/).optional(),
  totalBuyVolume: z.string().regex(/^\d+$/).default('0'),
  totalSellVolume: z.string().regex(/^\d+$/).default('0'),
  updatedAt: z.date().default(() => new Date()),
});
export interface WithId<T> {
  id: string;
  data: T;
}

export interface MatchingOrder {
  order: {
    maker: string;
    propertyToken: string;
    remainingAmount: string;
    pricePerShare: string;
    expiry: number;
    nonce: string;
    orderType: "BUY" | "SELL";
  };
  signature: string;
  orderHash: string;
  status: "ACTIVE" | "FILLED" | "CANCELLED" | "EXPIRED";
  createdAt: Date;
  updatedAt: Date;
}
export type BuyOrder = z.infer<typeof BuyOrderSchema>;
export type SellOrder = z.infer<typeof SellOrderSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type SignedOrder = z.infer<typeof SignedOrderSchema>;
export type Trade = z.infer<typeof TradeSchema>;
export type EscrowBalance = z.infer<typeof EscrowBalanceSchema>;
export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;
export type OrderQuery = z.infer<typeof OrderQuerySchema>;
export type MarketData = z.infer<typeof MarketDataSchema>;