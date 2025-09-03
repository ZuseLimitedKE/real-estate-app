export class MyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MyError";
  }
}

export enum Errors {
  NOT_ADD_PROPERTY = "Could not add property the database",
  NOT_GET_PROPERTIES = "Could not get properties",
  NOT_ADD_AGENCY = "Could not add agency the database",
  NOT_GET_AGENCIES = "Could not get agencies",
}
