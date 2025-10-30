"use server";

import { AuthError, requireRole } from "@/auth/utils";
import { Errors, MyError } from "@/constants/errors";
import { PROPERTIES_COLLECTION, Properties } from "@/db/collections";
import { ObjectId } from "mongodb";
import { DistributionHistory } from "@/types/property_details";

interface InvestorDistribution {
  id: string;
  propertyId: string;
  propertyName: string;
  unitName?: string;
  date: Date;
  amount: number;
  transactionHash: string;
  status: 'completed' | 'pending' | 'failed';
  totalDistribution: number;
  investorCount: number;
}

export async function getInvestorDistributionsByAddress(walletAddress: string): Promise<InvestorDistribution[]> {
  try {
    if (!walletAddress) {
      throw new MyError("Wallet address is required");
    }

    console.log("🔍 Fetching distributions for wallet:", walletAddress);

    // Get all properties
    const properties = await PROPERTIES_COLLECTION.find({}).toArray();
    console.log(`📊 Found ${properties.length} properties to search`);

    const distributions: InvestorDistribution[] = [];

    // Process all properties to find distributions for this investor
    properties.forEach(property => {
      // Process single property distributions
      if (property.distribution_transactions && Array.isArray(property.distribution_transactions)) {
        property.distribution_transactions.forEach((distTx: DistributionHistory) => {
          if (distTx.distributions && Array.isArray(distTx.distributions)) {
            const investorDistribution = distTx.distributions.find(
              dist => dist.walletAddress && dist.walletAddress.toLowerCase() === walletAddress.toLowerCase()
            );

            if (investorDistribution) {
              console.log("✅ Found distribution for investor:", {
                property: property.name,
                amount: investorDistribution.amount,
                wallet: investorDistribution.walletAddress
              });

              distributions.push({
                id: distTx.id || `dist-${property._id}-${distTx.date.getTime()}`,
                propertyId: property._id!.toString(),
                propertyName: property.name,
                date: distTx.date,
                amount: investorDistribution.amount,
                transactionHash: investorDistribution.txHash,
                status: distTx.status,
                totalDistribution: distTx.amount,
                investorCount: distTx.investorCount
              });
            }
          }
        });
      }

      // Process apartment units distributions
      if (property.apartmentDetails?.units && Array.isArray(property.apartmentDetails.units)) {
        property.apartmentDetails.units.forEach(unit => {
          if (unit.distribution_transactions && Array.isArray(unit.distribution_transactions)) {
            unit.distribution_transactions.forEach((distTx: DistributionHistory) => {
              if (distTx.distributions && Array.isArray(distTx.distributions)) {
                const investorDistribution = distTx.distributions.find(
                  dist => dist.walletAddress && dist.walletAddress.toLowerCase() === walletAddress.toLowerCase()
                );

                if (investorDistribution) {
                  console.log("✅ Found unit distribution for investor:", {
                    property: property.name,
                    unit: unit.name,
                    amount: investorDistribution.amount,
                    wallet: investorDistribution.walletAddress
                  });

                  distributions.push({
                    id: distTx.id || `unit-dist-${property._id}-${unit.id}-${distTx.date.getTime()}`,
                    propertyId: property._id!.toString(),
                    propertyName: property.name,
                    unitName: unit.name,
                    date: distTx.date,
                    amount: investorDistribution.amount,
                    transactionHash: investorDistribution.txHash,
                    status: distTx.status,
                    totalDistribution: distTx.amount,
                    investorCount: distTx.investorCount
                  });
                }
              }
            });
          }
        });
      }
    });

    console.log(`🎯 Total distributions found: ${distributions.length}`);
    
    // Sort by date, most recent first
    return distributions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (err) {
    console.error("Error getting investor distributions by address:", err);
    throw new MyError("Could not get investor distributions", { cause: err });
  }
}