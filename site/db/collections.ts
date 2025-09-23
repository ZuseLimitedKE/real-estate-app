import { ObjectId } from "mongodb";
import client from "./connection";
const databaseName = "real-estate-app";
const propertiesCollection = "properties";
const database = client.db(databaseName);
export interface Properties {
  _id?: ObjectId;
  totalFractions: number;
  type: string;
  description: string;
  proposedRentPerMonth: number;
  tenant?: {
    address: string;
    rentDate: number; //1-31
    rentAmount: number;
    name: string;
    email: string;
    number: string;
    payments: {
      date: Date;
      amount: number;
      status: string;
    }[];
    joinDate: Date;
  };
  time_listed_on_site: number; // timestamp
  property_value: number;
  gross_property_size: number;
  location: {
    coordinates: {
      lat: number;
      lng: number;
    };
    address: string;
  };
  images: string[];
  documents: {
    name: string;
    type: string;
    size: string;
    url: string;
  }[];
  agencyId: string;
  serviceFeePercent: number;
  token_address: string;
  name: string;
  property_status: "pending" | "approved" | "rejected";
  amenities: {
    bedrooms?: number | null;
    bathrooms?: number | null;
    parking_spaces?: number | null;
    balconies?: number | null;
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
  property_owners: {
    owner_address: string;
    amount_owned: number;
    purchase_time: Date;
  }[];
  secondary_market_listings: {
    lister_address: string;
    amount_listed: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
  //FIXME:Minor spelling error
  appartmentDetails?: {
    units: {
      name: string;
      tenant?: {
        name: string;
        rent: number;
        paymentHistory: {
          date: Date;
          amount: number;
          status: string;
        }[];
        joinDate: Date;
      };
    }[];
    floors: number;
    parkingSpace: number;
  };
}
export const PROPERTIES_COLLECTION =
  database.collection<Properties>(propertiesCollection);
