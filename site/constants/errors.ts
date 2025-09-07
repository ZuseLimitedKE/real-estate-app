export class MyError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "MyError";
  }
}

export enum Errors {
  NOT_ADD_PROPERTY = "Could not add property",
  NOT_GET_PROPERTIES = "Could not get properties",
  NOT_ADD_AGENCY = "Could not add agency",
  NOT_GET_AGENCIES = "Could not get agencies",
}
