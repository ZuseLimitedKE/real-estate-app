"use server";
import database from "@/db";
import type { AddPropertyFormData } from "@/types/zod";
import { MyError, Errors } from "@/constants/errors";
export async function AddProperty(FormData: AddPropertyFormData) {
  //TODO: There has to be an auth check here , not all users should be able to add properties
  try {
    // TODO: Ensure property isn't already listed
    await database.AddProperty(FormData);
  } catch (error) {
    console.error("Error adding property", { cause: error });
    throw new MyError(Errors.NOT_ADD_PROPERTY);
  }
}
