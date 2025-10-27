import { Collection, ObjectId } from "mongodb";
import { Properties } from "../collections";
import client from "../connection";
import { Errors, MyError } from "@/constants/errors";
import { PropertyType } from "@/constants/properties";

export class InvestorModel {
    private static propertiesCollection: Collection<Properties> | null = null;

    private static async getPropertiesCollection(): Promise<
        Collection<Properties>
    > {
        if (!this.propertiesCollection) {
            const db = client.db("real-estate-app");
            this.propertiesCollection = db.collection<Properties>("properties");
        }

        return this.propertiesCollection;
    }

    static async getTokenIDOfProperty(property_id: string): Promise<string> {
        try {
            const collection = await this.getPropertiesCollection();

            // Handling only single property for now
            const property = await collection.findOne({ _id: new ObjectId(property_id) });
            if (!property) {
                throw new MyError(Errors.PROPERTY_NOT_EXIST);
            }

            if (property.type === PropertyType.SINGLE) {
                if (!property.token_address) {
                    throw new MyError("Property not tokenized")
                }

                return property.token_address;
            } else {
                throw new MyError("Not yet implemented");
            }
        } catch (err) {
            console.error(`Could not get token id of property ${property_id}`, err);
            if (err instanceof MyError) {
                throw err;
            }
            throw new MyError("Could not get token address of property");
        }
    }
}