import { Collection, ObjectId } from "mongodb";
import { Properties } from "../collections";
import client from "../connection";
import {
  AgentDashboardTenantsData,
  AgentProperty,
  PropertyTenant,
  AMENITIES,
  DashboardProperties,
  ApartmentUnitTemplate,
  ApartmentUnit,
} from "@/types/agent_dashboard";
import { Errors, MyError } from "@/constants/errors";
import { RESULT_PAGE_SIZE } from "@/constants/pagination";
import { AgencyStatistics } from "@/server-actions/agent/dashboard/getStatistics";
import { PropertyType } from "@/constants/properties";
import { EditPropertyDetails } from "@/types/edit_property";
import { DistributePropertyInvestor, DistributionHistory } from "@/types/property_details";

const NUM_YEARS_INVESTMENT = 5;

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
                unit.tenant.rent_amount *
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

  // This implementation is only for single properties
  static async getPropertyInvestors(single_property_id: string): Promise<DistributePropertyInvestor[]> {
    try {
      const collection = await this.getPropertiesCollection();
      const cursor = collection.find({_id: new ObjectId(single_property_id)});
      const investors: DistributePropertyInvestor[] = [];

      for await (const prop of cursor) {
        if (prop.property_owners) {
          for (const owner of prop.property_owners) {
            investors.push({
              walletAddress: owner.owner_address,
              shares: owner.amount_owned,
              percentage: prop.totalFractions ? (owner.amount_owned / prop.totalFractions!) * 100 : 0,
            })
          }
        }
      }

      return investors;
    } catch(err) {
      console.error("Could not get property investors from database", err);
      throw new MyError("Could not get property investors from database");
    }
  }

  // Append distribution history
  static async appendDistributionHistory(history: DistributionHistory, single_property_id: string) {
    try {
      const collection = await this.getPropertiesCollection();
      const property = await collection.findOne({_id: new ObjectId(single_property_id)})
      if (!property) {
        throw new MyError("Property does not exist");
      }
      const oldHistory = property.distribution_transactions ?? [];
      const newHistory = [...oldHistory, history];
      
      await collection.updateOne({_id: new ObjectId(single_property_id)}, {$set: {
        distribution_transactions: newHistory
      }});
    } catch(err) {
      console.error("Error appending distribution history", err);

      if (err instanceof MyError) {
        throw err;
      }
      throw new MyError("Could not append distribution history in database", {cause: err});
    }
  }

  static async getDistributionHistory(property_id: string, unitID?: string): Promise<DistributionHistory[]> {
    try {
      const collection = await this.getPropertiesCollection();
      const property = await collection.findOne({_id: new ObjectId(property_id)});

      if (!property) {
        throw new MyError("Property does not exist");
      }

      if (unitID) {
        if (!property.apartmentDetails) {
          throw new MyError("Property is not an apartment");
        }

        const unit = property.apartmentDetails.units.find((u) => u.id === unitID);
        if (!unit) {
          throw new MyError("Unit does not exist");
        }

        return unit.distribution_transactions ?? [];
      }

      return property.distribution_transactions ?? [];
    } catch(err) {
      console.error("Error getting distribution history for property from db", err);

      if (err instanceof MyError) {
        throw err;
      }

      throw new MyError("Error getting distribution history for property in db", {cause: err});
    }
  }

  static async getEditPropertyDetails(_id: ObjectId, agencyID: string): Promise<EditPropertyDetails> {
    try {
      const collection = await this.getPropertiesCollection();
      const property = await collection.findOne({
        _id: _id,
        agencyId: agencyID
      });

      if (!property) {
        throw new MyError("Property does not exist");
      }

      if (property.type === PropertyType.SINGLE) {
        return {
          single_property_details: {
            tenant: property.tenant && {
              rentAmount: property.tenant?.rentAmount,
              rentDate: property.tenant?.rentDate,
              name: property.tenant?.name,
              number: property?.tenant?.number,
              address: property?.tenant?.address,
              joinDate: property?.tenant?.joinDate,
              email: property?.tenant?.email
            },
            payments: property?.tenant?.payments ?? []
          }
        }
      } else if (property.type === PropertyType.APARTMENT && property.apartmentDetails) {
        return {
          apartment_details: {
            templates: property.apartmentDetails?.unitTemplates,
            num_floors: property.apartmentDetails?.floors,
            parking_spaces: property.apartmentDetails?.parkingSpace,
            units: property.apartmentDetails.units.map((u) => {
              return ({
                id: u.id,
                token_details: u.token_details,
                secondary_market_listings: u.secondary_market_listings,
                owner: u.owner,
                name: u.name,
                templateID: u.templateId,
                floor: u.floor,
                tenant: u.tenant && {
                  rentAmount: u.tenant?.rent_amount,
                  rentDate: u.tenant?.rent_date,
                  name: u.tenant?.name,
                  number: u?.tenant?.number,
                  address: u?.tenant?.address,
                  joinDate: u?.tenant?.joinDate,
                  email: u?.tenant?.email
                },
                payments: u.tenant?.paymentHistory ?? []
              });
            })
          }
        }
      } else {
        throw new MyError("Invalid property");
      }
    } catch (err) {
      console.error("Error getting edit property details", err);
      throw new MyError(Errors.NOT_GET_PROPERTY, { cause: err });
    }
  }

  static _getListOfAmenities(amenities: Properties["amenities"]): AMENITIES[] {
    const amenitiesList: AMENITIES[] = [];
    if (amenities) {
      if (amenities.parking_spaces) {
        amenitiesList.push(AMENITIES.PARKING);
      }
      if (amenities.swimming_pool) {
        amenitiesList.push(AMENITIES.SWIMMING);
      }
      if (amenities.gym) {
        amenitiesList.push(AMENITIES.FITNESS);
      }
      if (amenities.air_conditioning) {
        amenitiesList.push(AMENITIES.AIR_CONDITIONING);
      }
      if (amenities.heating) {
        amenitiesList.push(AMENITIES.HEATING);
      }
      if (amenities.laundry_in_unit) {
        amenitiesList.push(AMENITIES.LAUNDRY);
      }
      if (amenities.dishwasher) {
        amenitiesList.push(AMENITIES.DISHWASHER);
      }
      if (amenities.fireplace) {
        amenitiesList.push(AMENITIES.FIREPLACE);
      }
      if (amenities.storage_space) {
        amenitiesList.push(AMENITIES.STORAGE);
      }
      if (amenities.pet_friendly) {
        amenitiesList.push(AMENITIES.PET_FRIENDLY);
      }
      if (amenities.security_system) {
        amenitiesList.push(AMENITIES.SECURITY);
      }
      if (amenities.elevator) {
        amenitiesList.push(AMENITIES.ELEVATOR);
      }
      if (amenities.garden_yard) {
        amenitiesList.push(AMENITIES.GARDEN);
      }
    }

    return amenitiesList;
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

      // Getting details for apartments
      if (property.type === PropertyType.APARTMENT && property.apartmentDetails) {
        let totalOccupants = 0;
        let totalUnits = property.apartmentDetails.units.length;
        let unitTemplates: ApartmentUnitTemplate[] = [];

        for (const template of property.apartmentDetails.unitTemplates) {
          const units: ApartmentUnit[] = [];

          const unitsForTemplate = property.apartmentDetails.units.filter((u) => u.templateId === template.id);
          for (const unit of unitsForTemplate) {
            const monthlyRevenue = unit.tenant ? unit.tenant.rent_amount : template.proposedRentPerMonth || 0;
            const unitValue = template.unitValue || 0;
            units.push({
              id: unit.id,
              name: unit.name,
              tenant: unit.tenant && {
                name: unit.tenant.name,
                rent: unit.tenant.rent_amount,
                joinDate: unit.tenant.joinDate,
                paymentHistory: unit.tenant.paymentHistory,
              },
              financials: {
                unitValue: unitValue,
                expectedYield: monthlyRevenue === 0 || unitValue === 0 ? 0 : ((monthlyRevenue * 12) / unitValue) * 100,
                roi: monthlyRevenue === 0 || unitValue === 0 ? 0 : (((monthlyRevenue * 12 * NUM_YEARS_INVESTMENT) - unitValue) / unitValue) * 100,
                monthlyRevenue: monthlyRevenue,
                annualRevenue: monthlyRevenue * 12,
              },
            })
          }

          unitTemplates.push({
            name: template.name,
            images: template.images,
            overview: {
              size: template.gross_size,
              amenities: this._getListOfAmenities(template.amenities),
            },
            units: units
          })
        }


        return {
          apartment_property: {
            id: property._id.toString(),
            name: property.name,
            address: property.location.address,
            status: property.property_status,
            createdAt: property.createdAt,
            occupancyRate: totalUnits === 0 || totalOccupants === 0 ? 0 : totalOccupants / totalUnits * 100,
            numTenants: totalOccupants,
            about: property.description,
            documents: property.documents ?? [],
            unitTemplates
          }
        }
      } else if (property.type === PropertyType.SINGLE) {
        // Getting property details for single properties
        const monthlyRevenue = property.tenant?.rentAmount ?? property.proposedRentPerMonth ?? 0;
        const propertyValue = property.property_value ?? 0;
        return {
          single_property: {
            id: property._id.toString(),
            name: property.name,
            address: property.location.address,
            status: property.property_status,
            images: property.images ?? [],
            overview: {
              occupancy: {
                occupied: property.tenant ? 1 : 0,
                monthlyRevenue: property.tenant ? property.tenant.rentAmount : 0,
              },
              propertyDetails: {
                size: property.gross_property_size ?? 0,
                parkingSpace: property.amenities?.parking_spaces ?? 0,
                createdAt: property.createdAt,
              },
              about: property.description,
              amenities: this._getListOfAmenities(property.amenities),
            },
            financials: {
              propertyValue: propertyValue,
              monthlyRevenue: monthlyRevenue,
              annualRevenue: monthlyRevenue * 12,
              expectedYield: monthlyRevenue === 0 || propertyValue === 0 ? 0 : ((monthlyRevenue * 12) / propertyValue) * 100,
              roi: monthlyRevenue === 0 || propertyValue === 0 ? 0 : (((monthlyRevenue * 12 * NUM_YEARS_INVESTMENT) - propertyValue) / propertyValue) * 100,
            },
            tenant: property.tenant && {
              name: property.tenant.name,
              rent: property.tenant.rentAmount,
              joinDate: property.tenant.joinDate,
              paymentHistory: property.tenant.payments,
            },
            documents: property.documents ?? [],
          }
        }
      } else {
        console.log(`Unknown property type when getting property from ID: ${propertyID}`, property);
        return null;
      }
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
    data: EditPropertyDetails,
  ) {
    try {
      const collection = await this.getPropertiesCollection();

      if (data.single_property_details) {
        const tenantData = data.single_property_details.tenant ? {
          address: data.single_property_details.tenant?.address,
          rentDate: data.single_property_details.tenant?.rentDate,
          rentAmount: data.single_property_details.tenant?.rentAmount,
          name: data.single_property_details.tenant?.name,
          email: data.single_property_details.tenant?.email,
          number: data.single_property_details.tenant?.number,
          payments: data.single_property_details.payments.map((p) => {
            return ({
              date: p.date,
              amount: p.amount,
              status: p.status
            })
          }),
          joinDate: data.single_property_details.tenant?.joinDate ?? new Date(),
        } : undefined;

        const result = await collection.findOneAndUpdate(
          {
            _id: _id,
            agencyId: agencyId,
          },
          {
            $set: {
              tenant: tenantData,
              updatedAt: new Date(),
            },
          },
          { returnDocument: "after" },
        );
        if (!result) {
          throw new MyError("Property does not exist");
        }
        return result;
      } else if (data.apartment_details) {
        const result = await collection.findOneAndUpdate(
          {
            _id: _id,
            agencyId: agencyId,
          },
          {
            $set: {
              apartmentDetails: {
                unitTemplates: data.apartment_details.templates,
                floors: data.apartment_details.num_floors,
                parkingSpace: data.apartment_details.parking_spaces,
                units: data.apartment_details.units.map((u) => {
                  return ({
                    id: u.id,
                    secondary_market_listings: u.secondary_market_listings,
                    token_details: u.token_details,
                    owner: u.owner,
                    templateId: u.templateID,
                    name: u.name,
                    floor: u.floor,
                    tenant: u.tenant ? {
                      ...u.tenant,
                      rent_amount: u.tenant.rentAmount,
                      rent_date: u.tenant.rentDate,
                      paymentHistory: u.payments
                    } : undefined,

                  });
                })
              },
              
              updatedAt: new Date(),
            },
          },
          { returnDocument: "after" },
        );
        if (!result) {
          throw new MyError("Property does not exist");
        }
        return result;
      } else {
        throw new MyError("Invalid property data");
      }

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
        if (property.type === PropertyType.APARTMENT && property.apartmentDetails) {
          // Loop through each unit in the apartment
          for (const unit of property.apartmentDetails.units) {
            if (unit.tenant) {
              tenants.push({
                name: unit.tenant.name,
                property: `${property.name} - ${unit.name}`,
                rent: unit.tenant.rent_amount,
                status: property.property_status,
                contactInfo: {
                  email: unit.tenant.email,
                  number: unit.tenant.number,
                },
                leaseInfo: {
                  property: property.location.address,
                  initialDate: property.createdAt
                },
                paymentHistory: unit.tenant.paymentHistory
              });
            }
          }
        } else if (property.type === PropertyType.SINGLE) {
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
          }
        } else {
          console.log("Unknown property type for tenant extraction", property);
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
