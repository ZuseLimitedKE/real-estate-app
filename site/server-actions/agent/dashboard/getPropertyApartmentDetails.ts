"use server";
import { AuthError, requireRole } from "@/auth/utils";
import { Errors, MyError } from "@/constants/errors";
import { AgencyModel } from "@/db/models/agency";
import { ObjectId } from "mongodb";

export async function getPropertyApartmentDetails(_id: string) {
  try {
    const payload = await requireRole("agency");
    if (!ObjectId.isValid(_id)) {
      throw new MyError("Invalid property id");
    }
    const property = await AgencyModel.getProperty(
      new ObjectId(_id),
      payload.userId,
    );
    return property.apartmentDetails || null;
  } catch (err) {
    console.error(err);
    if (err instanceof AuthError) {
      throw new MyError(Errors.UNAUTHORIZED, { cause: err });
    }
    throw new MyError(Errors.NOT_GET_PROPERTY, { cause: err });
  }
}
