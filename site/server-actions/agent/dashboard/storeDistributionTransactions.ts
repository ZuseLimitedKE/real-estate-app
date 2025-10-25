"use server"
import { MyError } from "@/constants/errors";
import { AgencyModel } from "@/db/models/agency";
import { DistributionHistory, StoreDistributionTransactionDetails } from "@/types/property_details";

// Stores the distribution history and returns details of what was stored
export default async function storeDistributionTransactions(data: StoreDistributionTransactionDetails): Promise<DistributionHistory> {
    try {
        // Fill needed details
        const history: DistributionHistory = {
            id: crypto.randomUUID(),
            date: new Date(),
            amount: data.totalDistributed,
            investorCount: data.args.length,
            status: 'completed',
            distributions: data.args.map((a) => {
                return({
                    amount: a.sentAmount,
                    walletAddress: a.investorAddress,
                    txHash: a.transaction
                });
            })
        };

        await AgencyModel.appendDistributionHistory(history, data.propertyID);
        return history;
    } catch(err) {
        console.error("Error storing distribution transactions", err);
        throw new MyError("Could not store distribution transactions", {cause: err});
    }
}