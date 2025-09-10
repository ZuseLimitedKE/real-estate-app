import { ZodError } from "zod";

export function formatZodErrors(error: ZodError): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(error).map(([k, v]) => [
      k,
      (v as { _errors: string[] })._errors,
    ]),
  );
}
