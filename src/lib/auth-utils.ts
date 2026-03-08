import type { UserRole } from "@prisma/client";
import { auth } from "./auth";

const ROLE_HIERARCHY: Record<UserRole, number> = {
  OWNER: 4,
  BARBER: 3,
  RECEPTIONIST: 2,
  STAFF: 1,
};

export async function getSession() {
  return auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireRole(minimumRole: UserRole) {
  const session = await requireAuth();
  const userLevel = ROLE_HIERARCHY[session.user.role];
  const requiredLevel = ROLE_HIERARCHY[minimumRole];

  if (userLevel < requiredLevel) {
    throw new Error("Forbidden");
  }
  return session;
}

export function hasRole(userRole: UserRole, minimumRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
}
