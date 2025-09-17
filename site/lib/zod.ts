import { ZodError } from "zod";

export function formatZodErrors(error: ZodError): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join(".") : "_root";
    (map[key] ??= []).push(issue.message);
  }
  return map;
}
