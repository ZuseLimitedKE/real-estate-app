import { Collection } from "mongodb";
import { Properties } from "../collections";
import client from "../connection";
import { DashboardProperties } from "@/types/agent_dashboard";
import { Errors, MyError } from "@/constants/errors";

const PAGE_SIZE = 10;

export class AgencyModel {
    private static propertiesCollection: Collection<Properties> | null = null;

    private static async getPropertiesCollection(): Promise<Collection<Properties>> {
        if (!this.propertiesCollection) {
            const db = client.db("real-estate-app");
            this.propertiesCollection = db.collection<Properties>("properties");
        }

        return this.propertiesCollection;
    }

    static async getDashboardProperties(agencyID: string, page: number): Promise<DashboardProperties[]> {
        try {
            const collection = await this.getPropertiesCollection();
            const cursor = collection.find({ agencyId: agencyID}).limit(PAGE_SIZE).skip((page - 1) * PAGE_SIZE);
            const dashboardProperties: DashboardProperties[] = [];

            for await (const property of cursor) {
                const details: {title: string, value: string}[] = [];

                if (property.amenities.bedrooms) {
                    details.push({title: "Bedrooms", value: property.amenities.bedrooms.toString()});
                } 
                if (property.amenities.bathrooms) {
                    details.push({title: "Bathrooms", value: property.amenities.bathrooms.toString()});
                }
                if (property.amenities.swimming_pool) {
                    details.push({title: "Swimming pool", value: "available"});
                }
                if (property.amenities.gym) {
                    details.push({title: "Gym", value: "avaialble"});
                }


                dashboardProperties.push({
                    id: property._id.toString(),
                    image: property.images[0],
                    name: property.name,
                    status: property.property_status,
                    location: property.location.address,
                    details,
                    rent: property.proposedRentPerMonth
                })
            }

            return dashboardProperties;
        } catch(err) {
            console.error(`Error getting properties for agency ${agencyID} from db`);
            throw new MyError(Errors.NOT_GET_AGENCY_PROPERTIES);
        }
    }
}