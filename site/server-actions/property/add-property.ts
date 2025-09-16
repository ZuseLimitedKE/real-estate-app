"use server";
import database from "@/db";
import { MyError, Errors } from "@/constants/errors";
import { Properties } from "@/db/collections";
import { MongoServerError } from "mongodb";
import { requireRole } from "@/auth/utils";

export async function AddProperty(FormData: Properties) {
  try {
    await requireRole("agency");
    await database.AddProperty(FormData);
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      // Duplicate key error from Mongo
      throw new MyError("The property already exists");
    }
    console.error("Error adding property", { cause: error });
    throw new MyError(Errors.NOT_ADD_PROPERTY);
  }
}
