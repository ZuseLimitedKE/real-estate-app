import { ObjectId } from "mongodb";
import client from "./connection";
const databaseName = "real-estate-app";
const agenciesCollection = "agencies";
const propertiesCollection = "properties";
const database = client.db(databaseName);
export interface Properties {
  _id?: ObjectId;
  totalFractions: number;
  description: string;
  proposedRentPerMonth: number;
  tenant?: {
    address: string;
    rentDate: Date;
    rentAmount: number;
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
    url: string;
  }[];
  agencyId: string;
  serviceFeePercent: number;
  token_address: string;
  name: string;
  property_status: string;
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
}
export interface Agencies {
  _id?: ObjectId;
  name: string;
  location: string;
  listed_properties: string[];
  approvalStatus: "approved" | "suspended" | "not reviewed";
  address: string;
  managementPricePercentage: number;
  createdAt: Date;
  updatedAt: Date;
}
export const AGENCIES_COLLECTION =
  database.collection<Agencies>(agenciesCollection);
export const PROPERTIES_COLLECTION =
  database.collection<Properties>(propertiesCollection);
