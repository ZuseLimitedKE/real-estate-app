import { Collection, ObjectId } from "mongodb";
import { Properties } from "../collections";
import client from "../connection";
import { Errors, MyError } from "@/constants/errors";
import { PropertyType } from "@/constants/properties";
import { InvestorProperties } from "@/types/portfolio";
import { PurchaseTransactionModel, PurchaseTransaction } from "./purchase-transaction";

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

    static async updatePropertyOwnership(investorID: string, investor_address: string, propertyID: string, amount: number, pricePerToken: number, transactionHash: string, transactionType: 'primary' | 'secondary' = 'primary') {
        try {
            const collection = await this.getPropertiesCollection();
            const property = await collection.findOne({ _id: new ObjectId(propertyID) });

            if (!property) {
                throw new MyError(Errors.PROPERTY_NOT_EXIST);
            }

            const oldPropertyOwners = property.property_owners ?? [];
            const purchaseTime = new Date();

            const alreadyOwner = oldPropertyOwners.find((o) => o.owner_id?.equals(new ObjectId(investorID)));
            if (alreadyOwner) {
                alreadyOwner.amount_owned += amount;
                // Update purchase time to latest purchase
            alreadyOwner.purchase_time = purchaseTime;
                await collection.updateOne({ _id: new ObjectId(propertyID) }, {
                    $set: {
                        property_owners: oldPropertyOwners
                    }
                });
            } else {
                const newPropertyOwners = [...oldPropertyOwners, {
                    owner_id: new ObjectId(investorID),
                    owner_address: investor_address,
                    amount_owned: amount,
                    purchase_time: purchaseTime
                }];

                await collection.updateOne({ _id: new ObjectId(propertyID) }, {
                    $set: {
                        property_owners: newPropertyOwners
                    }
                });
            }

            // Create purchase transaction record
        const totalAmount = amount * pricePerToken;
        await PurchaseTransactionModel.createTransaction({
            investor_id: new ObjectId(investorID),
            investor_address: investor_address,
            property_id: new ObjectId(propertyID),
            token_address: property.token_address || "N/A",
            amount: amount,
            price_per_token: pricePerToken,
            total_amount: totalAmount,
            transaction_hash: transactionHash,
            transaction_type: transactionType,
            purchase_time: purchaseTime
        });


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
                        property_id: property._id?.toString(),
                        property_name: property.name,
                        token_address: property.token_address ?? "N/A",
                        amount: investorOwnershipDetails.amount_owned,
                        property_type: 'single',
                        images: property.images || [],
                        documents: this.transformDocuments(property.documents),
                        location: property.location?.address || "Location not specified",
                        property_value: property.property_value || 0,
                        proposed_rent: property.proposedRentPerMonth || 0,
                        total_fractions: property.totalFractions || 0,
                        purchase_time: investorOwnershipDetails.purchase_time
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
                                property_id: property._id?.toString(),
                                property_name: `${property.name} - ${unit.name}`,
                                token_address: unit.token_details.address,
                                amount: investorOwnershipDetails.fractions_owned,
                                property_type: 'apartment',
                                unit_id: unit.id,
                                images: unit.images || property.images || [],
                                documents: this.transformDocuments(property.documents),
                                location: property.location?.address || "Location not specified",
                                property_value: property.property_value || 0,
                                proposed_rent: unit.proposedRentPerMonth || 0,
                                total_fractions: unit.token_details.total_fractions || 0,
                                purchase_time: investorOwnershipDetails.purchase_time
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

    // Helper method to transform documents to match the Document interface
private static transformDocuments(documents: any[] | undefined): any[] {
    if (!documents || !Array.isArray(documents)) {
        return [];
    }
    
    return documents.map((doc, index) => ({
        id: doc._id?.toString() || `doc-${index}`,
        name: doc.name || "Document",
        type: doc.type || "unknown",
        url: doc.url || "#",
        uploadDate: doc.uploadDate || new Date().toISOString(),
        size: doc.size || "Unknown",
        _id: doc._id
    }));
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
    static async getPropertyIDByTokenID(tokenID: string): Promise<string | null> {
        try{
            const collection = await this.getPropertiesCollection();
            const property = await collection.findOne({ token_address: tokenID });
            if (!property) {
                return null;
            }
            return property._id?.toString() || null;
        }
        catch(error){
            console.error(`Could not get property id by token id ${tokenID}`, error);
            if (error instanceof MyError) {
                throw error;
            }
            throw new MyError("Could not get property id by token id", { cause: error });
        }
    }
}
