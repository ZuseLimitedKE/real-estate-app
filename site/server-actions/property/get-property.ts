"use server";

import { requireAnyRole } from "@/auth/utils";
import { Errors, MyError } from "@/constants/errors";
import { AuthError } from "@/auth/utils";
import database from "@/db";
import { ObjectId } from "mongodb";

function serializeProperty(p: any) {
  const toIso = (d: any) => (d instanceof Date ? d.toISOString() : (d ?? null));
  const id =
    typeof p._id?.toString === "function" ? p._id.toString() : (p._id ?? null);
  return {
    ...p,
    _id: id,
    createdAt: toIso(p.createdAt),
    updatedAt: toIso(p.updatedAt),
    property_owners: Array.isArray(p.property_owners)
      ? p.property_owners.map((o: any) => ({
        ...o,
        purchase_time: toIso(o.purchase_time),
      }))
      : [],
  };
}

export async function GetProperties() {
  try {
    const properties = await database.GetProperties();
    return properties;
  } catch (err) {
    console.error(err);
    throw new MyError(Errors.NOT_GET_PROPERTIES);
  }
}
export async function GetProperty(_id: string) {
  try {
    if (!ObjectId.isValid(_id)) {
      throw new MyError("Invalid property id");
    }
    const propertyDetails = await database.GetProperty(new ObjectId(_id));
    return propertyDetails;
  } catch (err) {
    console.error(err);
    throw new MyError(Errors.NOT_GET_PROPERTY);
  }
}
export async function GetAgencyProperties(agencyId: string) {
  try {
    const user = await requireAnyRole("agency", "admin");
    if (user.role === "agency") {
      // Prevent agencies from reading other agencies' properties
      if (user.userId !== agencyId) {
        throw new AuthError(
          "Cannot access another agency's properties",
          "INSUFFICIENT_PERMISSIONS",
        );
      }
    }
    const agencyProperties = await database.GetAgencyProperties(agencyId);
    return agencyProperties.map(serializeProperty);
  } catch (err) {
    if (err instanceof AuthError) {
      throw new MyError(Errors.UNAUTHORIZED, { cause: err });
    }
    console.error(err);
    throw new MyError(Errors.NOT_GET_AGENCY_PROPERTIES, { cause: err });
  }
}
