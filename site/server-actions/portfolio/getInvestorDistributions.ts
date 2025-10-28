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

export default async function getInvestorDistributions(): Promise<InvestorDistribution[]> {
  try {
    const payload = await requireRole("investor");
    // For now, let's modify to accept wallet address as parameter
    
    throw new MyError("This function needs wallet address parameter. Please use the client-side version.");
  } catch (err) {
    console.error("Error getting investor distributions:", err);
    if (err instanceof AuthError) {
      throw new MyError(Errors.UNAUTHORIZED);
    }
    throw new MyError("Could not get investor distributions", { cause: err });
  }
}

// New function that accepts wallet address as parameter
export async function getInvestorDistributionsByAddress(walletAddress: string): Promise<InvestorDistribution[]> {
  try {
    if (!walletAddress) {
      throw new MyError("Wallet address is required");
    }

    // Get all properties (we'll filter in code since MongoDB query might be complex)
    const properties = await PROPERTIES_COLLECTION.find({}).toArray();

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

    // Sort by date, most recent first
    return distributions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (err) {
    console.error("Error getting investor distributions by address:", err);
    throw new MyError("Could not get investor distributions", { cause: err });
  }
}