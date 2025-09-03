import {
  AGENCIES_COLLECTION,
  Agencies,
  PROPERTIES_COLLECTION,
  Properties,
} from "./collections";
import { MyError, Errors } from "@/constants/errors";
export class MongoDatabase {
  async AddProperty(args: Properties) {
    try {
      await PROPERTIES_COLLECTION.insertOne(args);
    } catch (err) {
      console.error("Error adding property", err);
      throw new MyError(Errors.NOT_ADD_PROPERTY);
    }
  }
  async GetProperties(): Promise<Properties[]> {
    try {
      //TODO: Pagination
      const properties = await PROPERTIES_COLLECTION.find({}).toArray();
      return properties;
    } catch (err) {
      console.error("Error fetching properties", err);
      throw new MyError(Errors.NOT_GET_PROPERTIES);
    }
  }
  async AddAgency(args: Agencies) {
    try {
      await AGENCIES_COLLECTION.insertOne(args);
    } catch (err) {
      console.error("Error adding agency", err);
      throw new MyError(Errors.NOT_ADD_AGENCY);
    }
  }
  async GetAgencies(): Promise<Agencies[]> {
    try {
      const agencies = await AGENCIES_COLLECTION.find({}).toArray();
      return agencies;
    } catch (err) {
      console.error("Error fetching agencies", err);
      throw new MyError(Errors.NOT_GET_AGENCIES);
    }
  }
}
