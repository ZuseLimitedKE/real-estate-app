import { AuthError, requireRole } from "@/auth/utils";
import { MyError } from "@/constants/errors";
import { InvestorModel } from "@/db/models/investor";
import realEstateManagerContract from "@/smartcontract/registerContract";
import { MongoError } from "mongodb";

export default async function getPropertyTokensForAdmin(property_id: string): Promise<number> {
    try {
        const payload = await requireRole("investor");

        // Get token of property (assume its a single apartment for now)
        const tokenID = await InvestorModel.getTokenIDOfProperty(property_id);
        
        // Get token balance of admin account
        const tokenBalance = await realEstateManagerContract.getPropertyTokensBalanceInAdmin(tokenID);
        return tokenBalance;
    } catch(err) {
        console.error(err);
        if (err instanceof MongoError) {
            throw new MyError("Could not get data from database", {cause: err});
        } else if (err instanceof AuthError) {
            throw new MyError("You need to be an investor to invest in property", {cause: err});
        }

        throw new MyError("Could not get property token balance of admin account", {cause: err});
    }
}