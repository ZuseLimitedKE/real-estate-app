"use server";
import database from "@/db";
import { MyError, Errors } from "@/constants/errors";
import { Properties } from "@/db/collections";
import { MongoServerError } from "mongodb";
import { AuthError, requireAnyRole } from "@/auth/utils";
import { UserModel } from "@/db/models/user";

export async function AddProperty(FormData: Properties) {
  try {
    const payload = await requireAnyRole("admin", "agency");
    if (payload.role === "agency") {
      const agency = await UserModel.findById(payload.userId);
      if (agency?.status !== "APPROVED") {
        throw new AuthError("Your agency has not been approved yet");
      }
    }
    await database.AddProperty(FormData);
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      // Duplicate key error from Mongo
      throw new MyError("The property already exists");
    }
    if (error instanceof AuthError) {
      throw new MyError(error.message, { cause: error });
    }
    console.error("Error adding property", { cause: error });
    throw new MyError(Errors.NOT_ADD_PROPERTY);
  }
}
