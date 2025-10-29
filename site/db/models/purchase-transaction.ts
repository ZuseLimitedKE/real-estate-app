import { Collection, ObjectId } from "mongodb";
import client from "../connection";

export interface PurchaseTransaction {
  _id?: ObjectId;
  investor_id: ObjectId;
  investor_address: string;
  property_id: ObjectId;
  token_address: string;
  amount: number; // Number of tokens purchased
  price_per_token: number; // Price in USDC per token
  total_amount: number; // Total USDC spent (amount * price_per_token)
  transaction_hash: string;
  transaction_type: 'primary' | 'secondary'; // primary = from admin, secondary = from marketplace
  purchase_time: Date;
  created_at: Date;
}

export class PurchaseTransactionModel {
  private static collection: Collection<PurchaseTransaction> | null = null;

  private static async getCollection(): Promise<Collection<PurchaseTransaction>> {
    if (!this.collection) {
      const db = client.db("real-estate-app");
      this.collection = db.collection<PurchaseTransaction>("purchase_transactions");
      
      // Create indexes
      await this.collection.createIndex({ investor_id: 1 });
      await this.collection.createIndex({ property_id: 1 });
      await this.collection.createIndex({ transaction_hash: 1 }, { unique: true });
      await this.collection.createIndex({ purchase_time: -1 });
    }
    return this.collection;
  }

  static async createTransaction(transaction: Omit<PurchaseTransaction, '_id' | 'created_at'>): Promise<ObjectId> {
    const collection = await this.getCollection();
    
    const fullTransaction: PurchaseTransaction = {
      ...transaction,
      created_at: new Date()
    };

    const result = await collection.insertOne(fullTransaction);
    return result.insertedId;
  }

  static async getInvestorTransactions(investorId: string): Promise<PurchaseTransaction[]> {
    const collection = await this.getCollection();
    return await collection.find({
      investor_id: new ObjectId(investorId)
    }).sort({ purchase_time: -1 }).toArray();
  }

  static async getPropertyTransactions(propertyId: string): Promise<PurchaseTransaction[]> {
    const collection = await this.getCollection();
    return await collection.find({
      property_id: new ObjectId(propertyId)
    }).sort({ purchase_time: -1 }).toArray();
  }

  static async getInvestorPortfolioValue(investorId: string): Promise<number> {
    const collection = await this.getCollection();
    const transactions = await collection.find({
      investor_id: new ObjectId(investorId)
    }).toArray();

    return transactions.reduce((total, transaction) => {
      return total + transaction.total_amount;
    }, 0);
  }
}