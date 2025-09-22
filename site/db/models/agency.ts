import { Collection, ObjectId } from "mongodb";
import { Properties } from "../collections";
import client from "../connection";
import { AgentDashboardTenantsData, AgentProperty, AgentPropertyTenants, AMENITIES, DashboardProperties } from "@/types/agent_dashboard";
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

    static async getPropertyFromID(agencyID: string, propertyID: string): Promise<AgentProperty | null> {
        try {
            const collection = await this.getPropertiesCollection();
            const property = await collection.findOne({ agencyId: agencyID, _id: new ObjectId(propertyID) });
            if (!property) {
                return null;
            }

            let monthlyRevenue = 0;
            let occupied = 0;
            if (property.appartmentDetails) {
                occupied = property.appartmentDetails.units.filter((s) => s.tenant).length;
                for (const unit of property.appartmentDetails.units) {
                    monthlyRevenue += unit.tenant?.rent ?? 0;
                }
            }
            const amenities: AMENITIES[] = [];

            if (property.amenities.parking_spaces) {
                amenities.push(AMENITIES.PARKING);
            }
            if (property.amenities.swimming_pool) {
                amenities.push(AMENITIES.SWIMMING);
            }
            if (property.amenities.gym) {
                amenities.push(AMENITIES.FITNESS);
            }
            if (property.amenities.air_conditioning) {
                amenities.push(AMENITIES.AIR_CONDITIONING);
            }
            if (property.amenities.heating) {
                amenities.push(AMENITIES.HEATING);
            }
            if (property.amenities.laundry_in_unit) {
                amenities.push(AMENITIES.LAUNDRY);
            }
            if (property.amenities.dishwasher) {
                amenities.push(AMENITIES.DISHWASHER);
            }
            if (property.amenities.fireplace) {
                amenities.push(AMENITIES.FIREPLACE);
            }
            if (property.amenities.storage_space) {
                amenities.push(AMENITIES.STORAGE);
            }
            if (property.amenities.pet_friendly) {
                amenities.push(AMENITIES.PET_FRIENDLY);
            }
            if (property.amenities.security_system) {
                amenities.push(AMENITIES.SECURITY);
            }
            if (property.amenities.elevator) {
                amenities.push(AMENITIES.ELEVATOR);
            }
            if (property.amenities.garden_yard) {
                amenities.push(AMENITIES.GARDEN);
            }

            const NUM_YEARS_INVESTMENT = 5;

            const tenants: AgentPropertyTenants[] = [];
            if (property.appartmentDetails) {
                for (const unit of property.appartmentDetails.units) {
                    if (unit.tenant) {
                        tenants.push({
                            name: unit.tenant.name,
                            paymentHistory: unit.tenant.paymentHistory,
                            rent: unit.tenant.rent,
                            joinDate: unit.tenant.joinDate,
                            unit: unit.name
                        })
                    }
                }
            } else if (property.tenant) {
                tenants.push({
                    name: property.tenant.name,
                    paymentHistory: property.tenant.payments,
                    rent: property.tenant.rentAmount,
                    joinDate: property.tenant.joinDate,
                    unit: property.name
                })
            }

            return {
                name: property.name,
                address: property.location.address,
                status: property.property_status,
                images: property.images,
                overview: {
                    propertyDetails: {
                        type: property.type,
                        size: property.gross_property_size,
                        units: property.appartmentDetails ? property.appartmentDetails.units.length : undefined,
                        floors: property.appartmentDetails ? property.appartmentDetails.floors : undefined,
                        parkingSpace: property.appartmentDetails ? property.appartmentDetails.parkingSpace : undefined,
                        createdAt: property.createdAt
                    },
                    occupancy: property.appartmentDetails ? {
                        occupied: property.appartmentDetails.units.filter((s) => s.tenant).length,
                        monthlyRevenue: monthlyRevenue,
                        totalUnits: property.appartmentDetails.units.length,
                        rate: (occupied / property.appartmentDetails.units.length) * 100
                    } : undefined,
                    about: property.description,
                    amenities
                },
                financials: {
                    propertyValue: property.property_value,
                    expectedYield: (monthlyRevenue * 12 / property.property_value) * 100,
                    monthlyRevenue: monthlyRevenue,
                    annualRevenue: monthlyRevenue * 12,
                    roi: (((monthlyRevenue * 12 * NUM_YEARS_INVESTMENT) - property.property_value) / property.property_value) * 100
                },
                documents: property.documents,
                tenants 
            }
        } catch (err) {
            console.error(`Could not get property ${propertyID} for agent ${agencyID}`, err);
            throw new MyError(Errors.NOT_GET_PROPERTY);
        }
    }

    static async getTenantsProperties(agencyID: string, page: number): Promise<AgentDashboardTenantsData[]> {
        try {
            const collection = await this.getPropertiesCollection();
            const cursor = collection.find({ agencyId: agencyID }).limit(RESULT_PAGE_SIZE).skip((page - 1) * RESULT_PAGE_SIZE);
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
        } catch (err) {
            console.error(`Error getting tenants for agent ${agencyID} properties`);
            throw new MyError(Errors.NOT_GET_AGENCY_TENANTS);
        }
    }

    static async getDashboardProperties(agencyID: string, page: number): Promise<DashboardProperties[]> {
        try {
            const collection = await this.getPropertiesCollection();
            const cursor = collection.find({ agencyId: agencyID }).limit(RESULT_PAGE_SIZE).skip((page - 1) * RESULT_PAGE_SIZE);
            const dashboardProperties: DashboardProperties[] = [];

            for await (const property of cursor) {
                const details: { title: string, value: string }[] = [];

                if (property.amenities.bedrooms) {
                    details.push({ title: "Bedrooms", value: property.amenities.bedrooms.toString() });
                }
                if (property.amenities.bathrooms) {
                    details.push({ title: "Bathrooms", value: property.amenities.bathrooms.toString() });
                }
                if (property.amenities.swimming_pool) {
                    details.push({ title: "Swimming pool", value: "available" });
                }
                if (property.amenities.gym) {
                    details.push({ title: "Gym", value: "avaialble" });
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
        } catch (err) {
            console.error(`Error getting properties for agency ${agencyID} from db`);
            throw new MyError(Errors.NOT_GET_AGENCY_PROPERTIES);
        }
    }
}