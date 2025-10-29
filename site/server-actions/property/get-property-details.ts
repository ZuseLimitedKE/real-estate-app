"use server";

import { requireAnyRole } from "@/auth/utils";
import { Errors, MyError } from "@/constants/errors";
import { PROPERTIES_COLLECTION } from "@/db/collections";
import { ObjectId } from "mongodb";

export async function getPropertyDetails(propertyId: string) {
    try {
        await requireAnyRole("investor", "agency", "admin");
        
        if (!ObjectId.isValid(propertyId)) {
            throw new MyError("Invalid property ID");
        }

        const property = await PROPERTIES_COLLECTION.findOne({ 
            _id: new ObjectId(propertyId) 
        });

        if (!property) {
            throw new MyError("Property not found");
        }

        return {
            id: property._id?.toString(),
            name: property.name,
            images: property.images || [],
            documents: property.documents || [],
            location: property.location,
            property_value: property.property_value,
            proposedRentPerMonth: property.proposedRentPerMonth,
            totalFractions: property.totalFractions,
            amenities: property.amenities,
            description: property.description
        };
    } catch (err) {
        console.error("Error getting property details:", err);
        if (err instanceof MyError) {
            throw err;
        }
        throw new MyError("Failed to get property details");
    }
}