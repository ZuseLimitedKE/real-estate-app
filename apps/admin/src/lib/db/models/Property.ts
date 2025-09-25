import { Collection, ObjectId } from "mongodb";
import client from "../connection";

export interface Property {
  _id?: ObjectId;
  name: string;
  description: string;
  property_value: number;
  gross_property_size: number;
  proposedRentPerMonth: number;
  serviceFeePercent: number;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  images: string[];
  documents: {
    name: string;
    url: string;
  }[];
  agencyId: string;
  token_address: string;
  property_status: "pending" | "approved" | "rejected";
  amenities: {
    bedrooms?: number;
    bathrooms?: number;
    parking_spaces?: number;
    swimming_pool?: boolean;
    gym?: boolean;
    air_conditioning?: boolean;
    heating?: boolean;
    laundry_in_unit?: boolean;
    dishwasher?: boolean;
    fireplace?: boolean;
    storage_space?: boolean;
    pet_friendly?: boolean;
    security_system?: boolean;
    elevator?: boolean;
    garden_yard?: boolean;
  };
  property_owners: Array<{
    owner_address: string;
    amount_owned: number;
    purchase_time: Date;
  }>;
  secondary_market_listings: Array<{
    lister_address: string;
    amount_listed: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export class PropertyModel {
  private static collection: Collection<Property> | null = null;

  private static async getCollection(): Promise<Collection<Property>> {
    if (!this.collection) {
      const db = client.db("real-estate-app");
      this.collection = db.collection<Property>("properties");
    }
    return this.collection;
  }

  static async findByStatus(status: "pending" | "approved" | "rejected", limit: number = 50, skip: number = 0): Promise<Property[]> {
    const collection = await this.getCollection();
    return await collection
      .find({ property_status: status })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .toArray();
  }

  static async findById(id: string): Promise<Property | null> {
    const collection = await this.getCollection();
    if (!ObjectId.isValid(id)) return null;
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  static async updateStatus(id: string, status: "approved" | "rejected"): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          property_status: status,
          updatedAt: new Date() 
        } 
      }
    );
    return result.modifiedCount > 0;
  }

  static async getPropertyStats() {
    const collection = await this.getCollection();
    
    const stats = await collection
      .aggregate([
        {
          $group: {
            _id: "$property_status",
            count: { $sum: 1 },
            totalValue: { $sum: "$property_value" },
            avgValue: { $avg: "$property_value" }
          }
        }
      ])
      .toArray();

    return stats;
  }

  static async countProperties(): Promise<number> {
    const collection = await this.getCollection();
    return await collection.countDocuments();
  }

  static async getRecentProperties(limit: number = 10): Promise<Property[]> {
    const collection = await this.getCollection();
    return await collection
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }
}