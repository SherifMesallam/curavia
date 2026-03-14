import { getSession } from "./session";

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function requireAdminOrThrow() {
  const session = await requireAdmin();
  if (!session) {
    throw new Error("Unauthorized: Admin access required");
  }
  return session;
}
