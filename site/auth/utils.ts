import { tokenMaker } from "@/auth/token-maker";

export async function requireAuth() {
  const user = await tokenMaker.getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: user is not authenticated");
  }
  return user;
}

export async function requireRole(
  requiredRole: "admin" | "agency" | "investor",
) {
  const user = await requireAuth();
  if (user.role.toLowerCase() !== requiredRole.toLowerCase()) {
    throw new Error(`Unauthorized: requires ${requiredRole} role`);
  }
  return user;
}

export async function isAuthenticated() {
  return !!(await tokenMaker.getCurrentUser());
}
