"use server";

import { requireRole } from "@/auth/utils";
import { Errors, MyError } from "@/constants/errors";
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
    await requireRole("agency");
    const agencyProperties = await database.GetAgencyProperties(agencyId);
    return agencyProperties;
  } catch (err) {
    console.error(err);
    throw new MyError(Errors.NOT_GET_AGENCY_PROPERTIES);
  }
}
