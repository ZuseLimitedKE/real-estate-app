"use server";
import { AuthError, requireRole } from "@/auth/utils";
import { Errors, MyError } from "@/constants/errors";
import { AgencyModel } from "@/db/models/agency";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

export async function DeleteAgencyProperty(_id: string) {
  try {
    const payload = await requireRole("agency");
    if (!ObjectId.isValid(_id)) {
      throw new MyError("Invalid property id");
    }
    const isDeleted = await AgencyModel.deleteAgencyProperty(
      new ObjectId(_id),
      payload.userId,
    );
    if (!isDeleted) {
      throw new MyError("Property not found or already deleted");
    }
    revalidatePath("/agencies/dashboard");
    return isDeleted;
  } catch (err) {
    console.error(err);
    if (err instanceof AuthError) {
      throw new MyError(err.message, { cause: err });
    }
    throw new MyError(Errors.NOT_DELETE_PROPERTY, { cause: err });
  }
}
