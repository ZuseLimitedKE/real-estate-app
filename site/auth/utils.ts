import { tokenMaker } from "@/auth/token-maker";
export type UserRole = "admin" | "agency" | "investor";

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string = "AUTH_ERROR",
  ) {
    super(message);
    this.name = "AuthError";
  }
}
export async function requireAuth() {
  const user = await tokenMaker.getCurrentUser();
  if (!user) {
    throw new AuthError("User is not authenticated", "UNAUTHENTICATED");
  }
  return user;
}

export async function requireRole(requiredRoles: UserRole | UserRole[]) {
  const user = await requireAuth();

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  const userRole = user.role.toLowerCase() as UserRole;
  if (!roles.map((role) => role.toLowerCase()).includes(userRole)) {
    const roleList =
      roles.length > 1
        ? `one of: ${roles.join(", ")}`
        : (requiredRoles as string);
    throw new AuthError(
      `Requires ${roleList} role`,
      "INSUFFICIENT_PERMISSIONS",
    );
  }
  return user;
}

export async function isAuthenticated() {
  return !!(await tokenMaker.getCurrentUser());
}
