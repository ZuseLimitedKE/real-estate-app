"use server";
import database from "@/db";
import { MyError, Errors } from "@/constants/errors";
import { MongoServerError } from "mongodb";
import { AuthError, requireAnyRole } from "@/auth/utils";
import { UserModel } from "@/db/models/user";
import { CreatePropertyType, PaymentStatus } from "@/types/property";
import { PropertyType } from "@/constants/properties";
import { Properties } from "@/db/collections";
import crypto from "crypto";
import realEstateManagerContract from "@/smartcontract/registerContract";

const INITIAL_FRACTION_PRICE = 100; // KES

export async function AddProperty(property: CreatePropertyType) {
  const tokenIDs: string[] = [];
  try {
    const payload = await requireAnyRole("admin", "agency");
    if (payload.role === "agency") {
      const agency = await UserModel.findById(payload.userId);
      if (agency?.status !== "APPROVED") {
        throw new AuthError("Your agency has not been approved yet");
      }
    }

    // Create property for apartments
    if (property.property_type === PropertyType.APARTMENT && property.apartment_property_details) {
      const unitTemplates = property.apartment_property_details.unit_templates.map((template) => {
        const templateID = crypto.randomUUID();
        return {
          id: templateID,
          amenities: {
            bedrooms: template.amenities?.bedrooms ?? undefined,
            bathrooms: template.amenities?.bathrooms ?? undefined,
            balconies: template.amenities?.balconies ?? undefined,
            gym: template.amenities?.gym ?? undefined,
            air_conditioning: template.amenities?.air_conditioning ?? undefined,
            heating: template.amenities?.heating ?? undefined,
            laundry_in_unit: template.amenities?.laundry_in_unit ?? undefined,
            dishwasher: template.amenities?.dishwasher ?? undefined,
            storage_space: template.amenities?.storage_space ?? undefined,
            security_system: template.amenities?.security_system ?? undefined,
            elevator: template.amenities?.elevator ?? undefined,
            pet_friendly: template.amenities?.pet_friendly ?? undefined,
            furnished: template.amenities?.furnished ?? undefined,
          },
          gross_size: template.gross_unit_size,
          unitValue: template.unit_value,
          images: template.images,
          name: template.name,
          proposedRentPerMonth: template.proposedRentPerMonth,
        }
      });

      const units = [];
      for await (const unit of property.apartment_property_details.units) {
        const template = unitTemplates.find((t) => t.name === unit.template_name);
        if (!template) {
          throw new MyError(`Template "${unit.template_name}" not found for unit "${unit.name}"`);
        }
        const unitID = crypto.randomUUID();
        const total_fractions = template.unitValue === 0 ? 0 : Math.ceil(template.unitValue / INITIAL_FRACTION_PRICE);

        // Getting appropriate unit symbol
        let propertySymbol = property.apartment_property_details.name.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
        if (propertySymbol.length < 3) {
          propertySymbol = property.apartment_property_details.name.slice(0, Math.min(3, property.apartment_property_details.name.length)).toUpperCase().padEnd(3, 'X').replace(/[^A-Z]/g, '');
        }
        propertySymbol += unit.name.slice(0, 2).toUpperCase().replace(/[^A-Z]/g, '');
        if (propertySymbol.length < 5) {
          propertySymbol = propertySymbol.padEnd(5, 'X');
        }

        let tokenID: string | null = null;
        try {
          const { tokenID: createdToken } = await realEstateManagerContract.register({
            tokenSymbol: propertySymbol,
            propertyName: `${property.apartment_property_details.name} - ${unit.name}`,
            numTokens: total_fractions
          });
          tokenID = createdToken;
          tokenIDs.push(tokenID);
        } catch (err) {
          await realEstateManagerContract.burnTokens(tokenIDs);
          throw new MyError("Error tokenizing apartment unit");
        }

        units.push({
          id: unitID,
          templateId: template.id,
          total_fractions: total_fractions,
          name: unit.name,
          floor: unit.floor,
          token_details: {
            address: tokenID,
            total_fractions: total_fractions,
          },
          secondary_market_listings: []
        });
      }

      const dbProperty: Properties = {
        type: property.property_type,
        description: property.apartment_property_details.description,
        time_listed_on_site: Date.now(),
        location: property.apartment_property_details.location,
        agencyId: payload.userId,
        serviceFeePercent: property.apartment_property_details.serviceFeePercent,
        name: property.apartment_property_details.name,
        property_status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
        apartmentDetails: {
          unitTemplates,
          parkingSpace: property.apartment_property_details.parking_spaces ?? 0,
          floors: property.apartment_property_details.floors,
          units, // Units will be added later by the agency
        },
        documents: property.apartment_property_details.documents
      }
      await database.AddProperty(dbProperty);
    } else if (property.property_type === PropertyType.SINGLE && property.single_property_details) {
      // Create for single property
      let payments: {
        date: Date,
        amount: number,
        status: string
      }[] = [];
      if (property.single_property_details.tenant) {
        payments = property.single_property_details.tenant.payments?.filter((p) => p !== undefined) ?? [];
      }

      const totalFractions = property.single_property_details.property_value != 0 ? Math.ceil(property.single_property_details.property_value / INITIAL_FRACTION_PRICE) : 0;
      let propertySymbol = property.single_property_details.name.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
      if (propertySymbol.length < 3) {
        propertySymbol = property.single_property_details.name.slice(0, Math.min(3, property.single_property_details.name.length)).toUpperCase().padEnd(3, 'X').replace(/[^A-Z]/g, '');
      }

      let tokenID: string | null = null;
      try {
        const { tokenID: createdToken } = await realEstateManagerContract.register({
          tokenSymbol: propertySymbol,
          propertyName: property.single_property_details.name,
          numTokens: totalFractions
        });

        tokenID = createdToken;
        tokenIDs.push(tokenID);
      } catch (err) {
        await realEstateManagerContract.burnTokens(tokenIDs);
        throw new MyError("Error tokenizing single property");
      }

      await database.AddProperty({
        ...property.single_property_details,
        type: property.property_type,
        tenant: property.single_property_details.tenant ? {
          ...property.single_property_details.tenant,
          payments: payments.map((p) => {
            return ({
              ...p,
              status: p.status as PaymentStatus
            })
          })
        } : undefined,
        totalFractions: totalFractions,
        token_address: tokenID,
        agencyId: payload.userId,
        property_status: "pending",
        time_listed_on_site: Date.now(),
        createdAt: property.single_property_details.createdAt || new Date(),
        updatedAt: property.single_property_details.updatedAt || new Date(),
      });
    }
  } catch (error) {
    if (tokenIDs.length > 0) {
      await realEstateManagerContract.burnTokens(tokenIDs);
      throw new MyError("Could not tokenize property");
    }
    if (error instanceof MongoServerError && error.code === 11000) {
      // Duplicate key error from Mongo
      throw new MyError("The property already exists");
    }
    if (error instanceof AuthError) {
      throw new MyError(error.message, { cause: error });
    }

    if (error instanceof MyError) {
      throw new MyError(error.message, { cause: error })
    }
    console.error("Error adding property", { cause: error });
    throw new MyError(Errors.NOT_ADD_PROPERTY);
  }
}
