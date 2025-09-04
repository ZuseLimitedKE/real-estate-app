import {
  AGENCIES_COLLECTION,
  Agencies,
  PROPERTIES_COLLECTION,
  Properties,
} from "./collections";
import { MyError, Errors } from "@/constants/errors";
class MongoDatabase {
  async AddProperty(args: Properties) {
    try {
      const now = new Date();
      const doc = { ...args, createdAt: args.createdAt ?? now, updatedAt: now };
      await PROPERTIES_COLLECTION.insertOne(doc as Properties);
    } catch (err) {
      console.error("Error adding property", { cause: err });
      throw new MyError(Errors.NOT_ADD_PROPERTY);
    }
  }
  async GetProperties(): Promise<Properties[]> {
    try {
      //TODO: Pagination
      const properties = await PROPERTIES_COLLECTION.find({}).toArray();
      return properties;
    } catch (err) {
      console.error("Error fetching properties", { cause: err });
      throw new MyError(Errors.NOT_GET_PROPERTIES);
    }
  }
  async AddAgency(args: Agencies) {
    try {
      await AGENCIES_COLLECTION.insertOne(args);
    } catch (err) {
      console.error("Error adding agency", { cause: err });
      throw new MyError(Errors.NOT_ADD_AGENCY);
    }
  }
  async GetAgencies(): Promise<Agencies[]> {
    try {
      const agencies = await AGENCIES_COLLECTION.find({}).toArray();
      return agencies;
    } catch (err) {
      console.error("Error fetching agencies", { cause: err });
      throw new MyError(Errors.NOT_GET_AGENCIES);
    }
  }
}
const database = new MongoDatabase();
export default database;
