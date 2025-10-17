import { Collection, ObjectId } from "mongodb";
import { Properties } from "../collections";
import client from "../connection";
import {
  AgentDashboardTenantsData,
  AgentProperty,
  AgentPropertyTenants,
  AMENITIES,
  DashboardProperties,
} from "@/types/agent_dashboard";
import { Errors, MyError } from "@/constants/errors";
import { RESULT_PAGE_SIZE } from "@/constants/pagination";
import { AgencyStatistics } from "@/server-actions/agent/dashboard/getStatistics";
import { PropertyType } from "@/constants/properties";
import { title } from "process";

function getNumMonthsBetweenDates(startDate: Date, endDate: Date): number {
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth(); // 0-indexed (0 for Jan, 1 for Feb, etc.)

  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth();

  let monthDifference = (endYear - startYear) * 12 + (endMonth - startMonth);
  return Math.abs(monthDifference);
}

export class AgencyModel {
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

  static async getAgentStatistics(agencyID: string): Promise<AgencyStatistics> {
    try {
      const collection = await this.getPropertiesCollection();
      const cursor = collection.find({ agencyId: agencyID });

      let totalProperties = 0;
      let activeTenants = 0;
      let totalSpaces = 0;
      let totalEarnings = 0;

      for await (const property of cursor) {
        totalProperties += 1;
        if (property.tenant) {
          activeTenants += 1;
          totalSpaces += 1;
          totalEarnings +=
            property.tenant.rentAmount *
            getNumMonthsBetweenDates(property.tenant.joinDate, new Date());
        } else if (property.apartmentDetails) {
          activeTenants += property.apartmentDetails.units.filter(
            (u) => u.tenant,
          ).length;
          totalSpaces += property.apartmentDetails.units.length;
          for (const unit of property.apartmentDetails.units) {
            if (unit.tenant) {
              totalEarnings +=
                unit.tenant.rent *
                getNumMonthsBetweenDates(unit.tenant.joinDate, new Date());
            }
          }
        } else {
          totalSpaces += 1;
        }
      }

      return {
        totalProperties,
        activeTenants,
        occupancyRate:
          totalSpaces === 0 || activeTenants === 0
            ? 0
            : (activeTenants / totalSpaces) * 100,
        totalEarnings,
      };
    } catch (err) {
      console.error("Could not get statistics for agency", err);
      throw new MyError(Errors.NOT_GET_AGENT_DASHBOARD_STATISTICS, {
        cause: err,
      });
    }
  }
  static async getProperty(_id: ObjectId, agencyId: string) {
    try {
      const collection = await this.getPropertiesCollection();
      const property = await collection.findOne({
        _id: _id,
        agencyId: agencyId,
      });
      if (!property) {
        throw new MyError("Property does not exist");
      }
      return property;
    } catch (err) {
      console.error(err);
      throw new MyError(Errors.NOT_GET_PROPERTY, { cause: err });
    }
  }
  static async getPropertyFromID(
    agencyID: string,
    propertyID: string,
  ): Promise<AgentProperty | null> {
    try {
      const collection = await this.getPropertiesCollection();
      if (!ObjectId.isValid(propertyID)) {
        return null;
      }
      const property = await collection.findOne({
        agencyId: agencyID,
        _id: new ObjectId(propertyID),
      });
      if (!property) {
        return null;
      }

      let monthlyRevenue = 0;
      let occupied = 0;
      if (property.apartmentDetails) {
        occupied = property.apartmentDetails.units.filter(
          (s) => s.tenant,
        ).length;
        for (const unit of property.apartmentDetails.units) {
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
      if (property.apartmentDetails) {
        for (const unit of property.apartmentDetails.units) {
          if (unit.tenant) {
            tenants.push({
              name: unit.tenant.name,
              paymentHistory: unit.tenant.paymentHistory,
              rent: unit.tenant.rent,
              joinDate: unit.tenant.joinDate,
              unit: unit.name,
            });
          }
        }
      } else if (property.tenant) {
        tenants.push({
          name: property.tenant.name,
          paymentHistory: property.tenant.payments,
          rent: property.tenant.rentAmount,
          joinDate: property.tenant.joinDate,
          unit: property.name,
        });
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
            units: property.apartmentDetails
              ? property.apartmentDetails.units.length
              : undefined,
            floors: property.apartmentDetails
              ? property.apartmentDetails.floors
              : undefined,
            parkingSpace: property.apartmentDetails
              ? property.apartmentDetails.parkingSpace
              : undefined,
            createdAt: property.createdAt,
          },
          occupancy: property.apartmentDetails
            ? {
              occupied: property.apartmentDetails.units.filter(
                (s) => s.tenant,
              ).length,
              monthlyRevenue: monthlyRevenue,
              totalUnits: property.apartmentDetails.units.length,
              rate: (occupied / property.apartmentDetails.units.length) * 100,
            }
            : undefined,
          about: property.description,
          amenities,
        },
        financials: {
          propertyValue: property.property_value,
          expectedYield:
            ((monthlyRevenue * 12) / property.property_value) * 100,
          monthlyRevenue: monthlyRevenue,
          annualRevenue: monthlyRevenue * 12,
          roi:
            ((monthlyRevenue * 12 * NUM_YEARS_INVESTMENT -
              property.property_value) /
              property.property_value) *
            100,
        },
        documents: property.documents,
        tenants,
      };
    } catch (err) {
      console.error(
        `Could not get property ${propertyID} for agent ${agencyID}`,
        err,
      );
      throw new MyError(Errors.NOT_GET_PROPERTY, { cause: err });
    }
  }
  static async updateProperty(
    _id: ObjectId,
    agencyId: string,
    data: Partial<Properties>,
  ) {
    try {
      const collection = await this.getPropertiesCollection();
      const result = await collection.findOneAndUpdate(
        {
          _id: _id,
          agencyId: agencyId,
        },
        {
          $set: {
            ...data,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" },
      );
      if (!result) {
        throw new MyError("Property does not exist");
      }
      return result;
    } catch (err) {
      console.error(err);
      throw new MyError(Errors.NOT_UPDATE_PROPERTY, { cause: err });
    }
  }
  // Delete a property associated with an agency
  static async deleteAgencyProperty(
    _id: ObjectId,
    agencyId: string,
  ): Promise<boolean> {
    try {
      const collection = await this.getPropertiesCollection();
      const deletedDocument = await collection.findOneAndDelete({
        _id: _id,
        agencyId: agencyId,
      });

      return !!deletedDocument;
    } catch (err) {
      console.error(err);
      throw new MyError(Errors.NOT_DELETE_PROPERTY, { cause: err });
    }
  }

  static async getTenantsProperties(
    agencyID: string,
    page: number,
  ): Promise<{ tenants: AgentDashboardTenantsData[]; totalPages: number }> {
    try {
      const collection = await this.getPropertiesCollection();
      const cursor = collection.find({ agencyId: agencyID });
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
              number: property.tenant.number,
            },
            leaseInfo: {
              property: property.location.address,
              initialDate: property.createdAt,
            },
            paymentHistory: property.tenant.payments,
          });
        } else if (property.apartmentDetails) {
          for (const unit of property.apartmentDetails.units) {
            if (unit.tenant) {
              tenants.push({
                name: unit.tenant.name,
                property: property.name,
                rent: unit.tenant.rent,
                status: property.property_status,
                contactInfo: {
                  email: unit.tenant.email,
                  number: unit.tenant.number,
                },
                leaseInfo: {
                  property: property.location.address,
                  initialDate: property.createdAt,
                },
                paymentHistory: unit.tenant.paymentHistory,
              });
            }
          }
        }
      }

      const startNumber = (page - 1) * RESULT_PAGE_SIZE;
      return {
        tenants: tenants.slice(startNumber, startNumber + RESULT_PAGE_SIZE),
        totalPages: Math.ceil(tenants.length / RESULT_PAGE_SIZE),
      };
    } catch (err) {
      console.error(`Error getting tenants for agent ${agencyID} properties`);
      throw new MyError(Errors.NOT_GET_AGENCY_TENANTS, { cause: err });
    }
  }

  static _getDetailsFromAmenities(amenities: Properties["amenities"]): { title: string, value: string }[] {
    const details = [];
    if (amenities) {
      if (amenities.bedrooms) {
        details.push({
          title: AMENITIES.BEDROOM,
          value: amenities.bedrooms.toString(),
        });
      }
      if (amenities.bathrooms) {
        details.push({
          title: AMENITIES.BATHROOM,
          value: amenities.bathrooms.toString(),
        });
      }
      if (amenities.parking_spaces) {
        details.push({
          title: AMENITIES.PARKING,
          value: amenities.parking_spaces.toString(),
        });
      }
      if (amenities.balconies) {
        details.push({
          title: AMENITIES.BALCONY,
          value: amenities.balconies.toString(),
        });
      }
      if (amenities.swimming_pool) {
        details.push({ title: AMENITIES.SWIMMING, value: "available" });
      }
      if (amenities.gym) {
        details.push({ title: AMENITIES.FITNESS, value: "available" });
      }
      if (amenities.air_conditioning) {
        details.push({ title: AMENITIES.AIR_CONDITIONING, value: "available" });
      }
      if (amenities.heating) {
        details.push({ title: AMENITIES.HEATING, value: "available" });
      }
      if (amenities.laundry_in_unit) {
        details.push({ title: AMENITIES.LAUNDRY, value: "available" });
      }
      if (amenities.dishwasher) {
        details.push({ title: AMENITIES.DISHWASHER, value: "available" });
      }
      if (amenities.fireplace) {
        details.push({ title: AMENITIES.FIREPLACE, value: "available" });
      }
      if (amenities.storage_space) {
        details.push({ title: AMENITIES.STORAGE, value: "available" });
      }
      if (amenities.pet_friendly) {
        details.push({ title: AMENITIES.PET_FRIENDLY, value: "available" });
      }
      if (amenities.security_system) {
        details.push({ title: AMENITIES.SECURITY, value: "available" });
      }
      if (amenities.elevator) {
        details.push({ title: AMENITIES.ELEVATOR, value: "available" });
      }
      if (amenities.garden_yard) {
        details.push({ title: AMENITIES.GARDEN, value: "available" });
      }
    }
    return details;
  }

  static async getDashboardProperties(
    agencyID: string,
    page: number,
  ): Promise<{ properties: DashboardProperties[]; totalPages: number }> {
    try {
      const collection = await this.getPropertiesCollection();
      const cursor = collection
        .find({ agencyId: agencyID })
        .limit(RESULT_PAGE_SIZE)
        .skip((page - 1) * RESULT_PAGE_SIZE);
      const dashboardProperties: DashboardProperties[] = [];

      // The data gotten for each type of property should be different
      for await (const property of cursor) {
        if (property.type === PropertyType.APARTMENT && property.apartmentDetails) {
          dashboardProperties.push({
            apartment: {
              id: property._id.toString(),
              name: property.name,
              status: property.property_status,
              location: property.location.address,
              unit_templates: property.apartmentDetails.unitTemplates.map((template) => {
                return ({
                  image: template.images && template.images.length > 0 ? template.images[0] : null,
                  name: template.name,
                  rent: template.proposedRentPerMonth,
                  numUnits: property.apartmentDetails?.units && property.apartmentDetails.units.length > 0 ? property.apartmentDetails.units.filter((u) => u.templateId === template.id).length : 0,
                  details: this._getDetailsFromAmenities(template.amenities),
                });
              })
            }
          })
        } else if (property.type === PropertyType.SINGLE) {
          dashboardProperties.push({
            single: {
              id: property._id.toString(),
              image: property.images && property.images.length > 0 ? property.images[0] : null,
              name: property.name,
              status: property.property_status,
              location: property.location.address,
              rent: property.proposedRentPerMonth ?? 0,
              details: this._getDetailsFromAmenities(property.amenities),
            }
          })
        }
      }

      const totalProperties = await collection.countDocuments({
        agencyId: agencyID,
      });
      const totalPages = Math.ceil(totalProperties / RESULT_PAGE_SIZE);

      return { properties: dashboardProperties, totalPages };
    } catch (err) {
      console.error(`Error getting properties for agency ${agencyID} from db`);
      throw new MyError(Errors.NOT_GET_AGENCY_PROPERTIES, { cause: err });
    }
  }
}
