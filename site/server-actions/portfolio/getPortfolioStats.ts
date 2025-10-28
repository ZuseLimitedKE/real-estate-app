"use server";

import { AuthError, requireRole } from "@/auth/utils";
import { Errors, MyError } from "@/constants/errors";
import { InvestorModel } from "@/db/models/investor";
import { PurchaseTransactionModel } from "@/db/models/purchase-transaction";
import { PROPERTIES_COLLECTION } from "@/db/collections";
import { ObjectId } from "mongodb";
import { PortfolioStats } from "@/types/portfolio";

export default async function getPortfolioStats(): Promise<PortfolioStats> {
    try {
        const payload = await requireRole("investor");
        
        // Get real portfolio value from purchase transactions
        const totalInvested = await PurchaseTransactionModel.getInvestorPortfolioValue(payload.userId);

        const properties = await InvestorModel.getPropertiesOwned(payload.userId);
        
        let currentPortfolioValue = 0;
        let monthlyIncome = 0;
        const portfolioDiversity = {
            residential: 0,
            commercial: 0,
            industrial: 0
        };

        // Calculate current value and income from actual property data
        for (const property of properties) {
            const propertyDoc = await PROPERTIES_COLLECTION.findOne({
                $or: [
                    { "property_owners.owner_id": new ObjectId(payload.userId) },
                    { "apartmentDetails.units.owner.owner_id": new ObjectId(payload.userId) }
                ]
            });

            if (propertyDoc) {
                // Calculate current value based on token amount and current price
                // For now, using purchase price but will implement price appreciation later
                const currentValue = property.amount * 1.1; // assuming appreciation is 10%

                currentPortfolioValue += currentValue;
                
                // Calculate monthly income from rent (convert to USDC)
                if (propertyDoc.proposedRentPerMonth) {
                    const totalFractions = propertyDoc.totalFractions || 1;
                    const rentShare = (property.amount / totalFractions) * propertyDoc.proposedRentPerMonth;
                    // Convert KSh rent to USDC (approximate conversion rate)
                    const rentInUSDC = rentShare / 150; // Assuming 1 USDC = 150 KSh
                    monthlyIncome += rentInUSDC;
                }

                // Track diversity
                if (propertyDoc.type === "commercial") {
                    portfolioDiversity.commercial += currentValue;
                } else if (propertyDoc.type === "industrial") {
                    portfolioDiversity.industrial += currentValue;
                } else {
                    portfolioDiversity.residential += currentValue;
                }
            }
        }

        // Normalize diversity percentages
        const totalDiversity = portfolioDiversity.residential + portfolioDiversity.commercial + portfolioDiversity.industrial;
        if (totalDiversity > 0) {
            portfolioDiversity.residential = (portfolioDiversity.residential / totalDiversity) * 100;
            portfolioDiversity.commercial = (portfolioDiversity.commercial / totalDiversity) * 100;
            portfolioDiversity.industrial = (portfolioDiversity.industrial / totalDiversity) * 100;
        }

        const totalReturns = currentPortfolioValue - totalInvested;
        const projectedAnnualIncome = monthlyIncome * 12;

        return {
            totalInvested,
            currentPortfolioValue,
            totalReturns,
            monthlyIncome,
            projectedAnnualIncome,
            portfolioDiversity
        };
    } catch (err) {
        console.error("Error getting portfolio stats", { error: err });
        if (err instanceof AuthError) {
            throw new MyError(Errors.UNAUTHORIZED);
        }
        throw new MyError("Could not get portfolio statistics", { cause: err });
    }
}