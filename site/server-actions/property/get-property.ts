"use server";

import { requireAnyRole } from "@/auth/utils";
import { Errors, MyError } from "@/constants/errors";
import { AuthError } from "@/auth/utils";
import database from "@/db";

export async function GetProperties() {
  try {
    const properties = await database.GetProperties();
    return properties;
  } catch (err) {
    console.error(err);
    throw new MyError(Errors.NOT_GET_PROPERTIES);
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
    return agencyProperties;
  } catch (err) {
    if (err instanceof AuthError) {
      throw new MyError(Errors.UNAUTHORIZED, { cause: err });
    }
    console.error(err);
    throw new MyError(Errors.NOT_GET_AGENCY_PROPERTIES, { cause: err });
  }
}
