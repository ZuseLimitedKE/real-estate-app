import { Collection, ObjectId } from "mongodb";
import { Properties } from "../collections";
import client from "../connection";
import { Errors, MyError } from "@/constants/errors";
import { PropertyType } from "@/constants/properties";
import { InvestorProperties } from "@/types/portfolio";

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

    static async updatePropertyOwnership(investorID: string, investor_address: string, propertyID: string, amount: number) {
        try {
            const collection = await this.getPropertiesCollection();
            const property = await collection.findOne({ _id: new ObjectId(propertyID) });

            if (!property) {
                throw new MyError(Errors.PROPERTY_NOT_EXIST);
            }

            const oldPropertyOwners = property.property_owners ?? [];
            const newPropertyOwners = [...oldPropertyOwners, {
                owner_id: new ObjectId(investorID),
                owner_address: investor_address,
                amount_owned: amount,
                purchase_time: new Date()
            }];

            await collection.updateOne({_id: new ObjectId(propertyID)}, {$set: {
                property_owners: newPropertyOwners
            }});
        } catch (err) {
            console.error("Error updating property ownership in DB", err);
            if (err instanceof MyError) {
                throw err;
            }
            throw new MyError("Could not update property ownership", { cause: err });
        }
    }

    static async getPropertiesOwned(investorID: string): Promise<InvestorProperties[]> {
        try {
            const collection = await this.getPropertiesCollection();
            const cursor = collection.find();
            const investorObjId = new ObjectId(investorID);
            const properties: InvestorProperties[] = [];

            // Query for SINGLE properties owned by investor
            const singleProperties = await collection.find({
                type: PropertyType.SINGLE,
                "property_owners.owner_id": investorObjId
            }).toArray();

            for (const property of singleProperties) {
                const investorOwnershipDetails = property.property_owners?.find(
                    (o) => o.owner_id?.equals(investorObjId)
                );
                if (investorOwnershipDetails) {
                    properties.push({
                        property_name: property.name,
                        token_address: property.token_address ?? "N/A",
                        amount: investorOwnershipDetails.amount_owned
                    });
                }
            }

            // Query for APARTMENT properties with units owned by investor
            const apartmentProperties = await collection.find({
                type: PropertyType.APARTMENT,
                "apartmentDetails.units.owner.owner_id": investorObjId
            }).toArray();

            for (const property of apartmentProperties) {
                if (property.apartmentDetails) {
                    for (const unit of property.apartmentDetails.units) {
                        const investorOwnershipDetails = unit.owner?.find(
                            (o) => o.owner_id?.equals(investorObjId)
                        );
                        if (investorOwnershipDetails) {
                            properties.push({
                                property_name: `${property.name} - ${unit.name}`,
                                token_address: unit.token_details.address,
                                amount: investorOwnershipDetails.fractions_owned
                            });
                        }
                    }
                }
            }

            return properties;
        } catch (err) {
            console.error("Error getting properties owned by investor from db", err);
            throw new MyError("Error getting properties owned by investor from database", { cause: err });
        }
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