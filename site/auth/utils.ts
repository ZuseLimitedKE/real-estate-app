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
// helper for checking specific role combinations
export async function requireAnyRole(...roles: UserRole[]) {
  return requireRole(roles);
}
//gives you granular control over user permissions
// STILL WORKING ON THIS
export async function requirePermission(permission: string) {
  const user = await requireAuth();

  const rolePermissions = {
    admin: ["*"], // Admin has all permissions
    agency: [
      "property:create",
      "property:update",
      "property:delete",
      "property:read",
    ],
    investor: ["property:read", "investment:create", "investment:read"],
  };

  const userRole = user.role.toLowerCase() as keyof typeof rolePermissions;
  const permissions = rolePermissions[userRole] || [];

  if (!permissions.includes("*") && !permissions.includes(permission)) {
    throw new AuthError(
      `Missing required permission: ${permission}`,
      "INSUFFICIENT_PERMISSIONS",
    );
  }

  return user;
}
export async function isAuthenticated() {
  return !!(await tokenMaker.getCurrentUser());
}
