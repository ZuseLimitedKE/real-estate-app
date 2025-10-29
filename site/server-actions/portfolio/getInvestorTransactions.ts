"use server";

import { AuthError, requireRole } from "@/auth/utils";
import { Errors, MyError } from "@/constants/errors";
import { InvestorModel } from "@/db/models/investor";
import { PROPERTIES_COLLECTION } from "@/db/collections";
import { ObjectId } from "mongodb";
import { InvestorTransactions, InvestorProperties } from "@/types/portfolio";

export default async function getInvestorTransactions(): Promise<InvestorTransactions[]> {
    try {
        const payload = await requireRole("investor");
        
        // Get investor's properties to map to transactions
        const properties = await InvestorModel.getPropertiesOwned(payload.userId);
        
        if (!properties.length) {
            return [];
        }

        // Get transactions from properties (purchase history)
        const transactions: InvestorTransactions[] = [];
        
        for (const property of properties) {
            // Find the property document to get purchase details
            const propertyDoc = await PROPERTIES_COLLECTION.findOne({
                "property_owners.owner_id": new ObjectId(payload.userId)
            });

            if (propertyDoc && propertyDoc.property_owners) {
                const ownerRecord = propertyDoc.property_owners.find(
                    (owner: any) => owner.owner_id?.toString() === payload.userId
                );

                if (ownerRecord) {
                    transactions.push({
                        time: ownerRecord.purchase_time,
                        amount: ownerRecord.amount_owned,
                        property_name: property.property_name,
                        type: "purchase" as const
                    });
                }
            }
        }

        // Sort by most recent first
        return transactions.sort((a, b) => b.time.getTime() - a.time.getTime());
    } catch (err) {
        console.error("Error getting investor transactions", { error: err });
        if (err instanceof AuthError) {
            throw new MyError(Errors.UNAUTHORIZED);
        }
        throw new MyError("Could not get investor transactions", { cause: err });
    }
}