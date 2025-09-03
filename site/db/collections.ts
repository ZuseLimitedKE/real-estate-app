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
  tenant: {
    address: string;
    rentDate: Date;
    rentAmount: number;
  } | null;
  time_listed_on_site: number; // timestamp
  property_value: number;
  gross_property_size: number;
  location: {
    coordinates: {
      lat: number;
      lng: number;
    };
    country: string;
    city: string;
    address: string;
  };
  images: string[];
  agencyId: string;
  serviceFeePercent: number;
  token_address: string;
  name: string;
  price: number;
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
}
export const AGENCIES_COLLECTION =
  database.collection<Agencies>(agenciesCollection);
export const PROPERTIES_COLLECTION =
  database.collection<Properties>(propertiesCollection);
