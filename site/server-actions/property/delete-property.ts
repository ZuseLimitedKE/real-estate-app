"use server";

import { Errors, MyError } from "@/constants/errors";
import database from "@/db";
import { ObjectId } from "mongodb";

export async function DeleteProperty(_id: ObjectId) {
  //TODO: Auth Check
  try {
    const isDeleted = await database.DeleteProperty(_id);
    if (!isDeleted) {
      throw new MyError(
        "A database error was encountered when deleting the property",
      );
    }
    return isDeleted;
  } catch (err) {
    console.error(err);
    throw new MyError(Errors.NOT_DELETE_PROPERTY);
  }
}
