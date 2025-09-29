"use server";

import { AuthError, requireRole } from "@/auth/utils";
import { Errors, MyError } from "@/constants/errors";
import { Properties } from "@/db/collections";
import { AgencyModel } from "@/db/models/agency";
import { ObjectId } from "mongodb";

export async function updateProperty(_id: string, data: Partial<Properties>) {
  try {
    const payload = await requireRole("agency");
    if (!ObjectId.isValid(_id)) {
      throw new MyError("Invalid property id");
    }
    const result = await AgencyModel.updateProperty(
      new ObjectId(_id),
      payload.userId,
      data,
    );
    return result;
  } catch (err) {
    console.error(err);
    if (err instanceof AuthError) {
      throw new MyError(err.message, { cause: err });
    }

    throw new MyError(Errors.NOT_UPDATE_PROPERTY, { cause: err });
  }
}
