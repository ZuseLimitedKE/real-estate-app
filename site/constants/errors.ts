export class MyError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "MyError";
  }
}

export enum Errors {
  UNAUTHORIZED = "Unauthorized",
  NOT_ADD_PROPERTY = "Could not add property",
  NOT_GET_PROPERTIES = "Could not get properties",
  NOT_ADD_AGENCY = "Could not add agency",
  NOT_GET_AGENCIES = "Could not get agencies",
  NOT_GET_AGENCY_PROPERTIES = "Could not get the properties for this agency",
  NOT_GET_AGENCY_TENANTS = "Could not get tenants living in agent's properties",
  NOT_DELETE_PROPERTY = "Could not delete the listed property",
  NOT_GET_PROPERTY = "Could not get property",
  NOT_GET_AGENT_DASHBOARD_STATISTICS = "Could not get dashboard statistics for agency dashboard",
  NOT_AUTHORIZED = "You are not authorized to perform this action"
}
