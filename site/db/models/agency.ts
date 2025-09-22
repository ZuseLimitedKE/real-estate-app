import { Collection } from "mongodb";
import { Properties } from "../collections";
import client from "../connection";
import { AgentDashboardTenantsData, DashboardProperties } from "@/types/agent_dashboard";
import { Errors, MyError } from "@/constants/errors";
import { RESULT_PAGE_SIZE } from "@/constants/pagination";

export class AgencyModel {
    private static propertiesCollection: Collection<Properties> | null = null;

    private static async getPropertiesCollection(): Promise<Collection<Properties>> {
        if (!this.propertiesCollection) {
            const db = client.db("real-estate-app");
            this.propertiesCollection = db.collection<Properties>("properties");
        }

        return this.propertiesCollection;
    }

    static async getTenantsProperties(agencyID: string, page: number): Promise<AgentDashboardTenantsData[]> {
        try {
            const collection = await this.getPropertiesCollection();
            const cursor = collection.find({agencyId: agencyID}).limit(RESULT_PAGE_SIZE).skip((page - 1) * RESULT_PAGE_SIZE);
            const tenants: AgentDashboardTenantsData[] = [];

            for await (const property of cursor) {
                if (property.tenant) {
                    tenants.push({
                        name: property.tenant.name,
                        property: property.name,
                        rent: property.tenant.rentAmount,
                        status: property.property_status,
                        contactInfo: {
                            email: property.tenant.email,
                            number: property.tenant.number
                        },
                        leaseInfo: {
                            property: property.location.address,
                            initialDate: property.createdAt
                        },
                        paymentHistory: property.tenant.payments
                    })
                }
            }

            return tenants;
        } catch(err) {
            console.error(`Error getting tenants for agent`, agencyID, ` properties`);
            throw new MyError(Errors.NOT_GET_AGENCY_TENANTS);
        }
    }

    static async getDashboardProperties(agencyID: string, page: number): Promise<DashboardProperties[]> {
        try {
            const collection = await this.getPropertiesCollection();
            const cursor = collection.find({ agencyId: agencyID}).limit(RESULT_PAGE_SIZE).skip((page - 1) * RESULT_PAGE_SIZE);
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