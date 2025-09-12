"use server";

import { Errors, MyError } from "@/constants/errors";
import database from "@/db";
import { ObjectId } from "mongodb";

export async function DeleteProperty(_id: string) {
  //TODO: Auth Check
  try {
    if (!ObjectId.isValid(_id)) {
      throw new MyError("Invalid property id");
    }
    const isDeleted = await database.DeleteProperty(new ObjectId(_id));
    if (!isDeleted) {
      throw new MyError("Property not found or already deleted");
    }
    return isDeleted;
  } catch (err) {
    console.error(err);
    throw new MyError(Errors.NOT_DELETE_PROPERTY);
  }
}
