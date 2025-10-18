"use server";
import { AuthError, requireRole } from "@/auth/utils";
import { Errors, MyError } from "@/constants/errors";
import { AgencyModel } from "@/db/models/agency";
import { EditPropertyDetails } from "@/types/edit_property";
import { ObjectId } from "mongodb";

export async function getEditPropertyDetails(_id: string): Promise<EditPropertyDetails> {
  try {
    const payload = await requireRole("agency");
    if (!ObjectId.isValid(_id))  {
      throw new MyError("Invalid property id");
    }

    const property = await AgencyModel.getEditPropertyDetails(new ObjectId(_id), payload.userId);
    return property;
  } catch(err) {
    console.error(err, `Error getting details for editing apartment ${_id}`)
    if (err instanceof AuthError) {
      throw new MyError(Errors.UNAUTHORIZED, {cause: err});
    }

    throw new MyError(Errors.NOT_GET_PROPERTY, {cause: err});
  }
}
