import "server-only";
import { cookies } from "next/headers";

// Reads admin_token from server-side request cookies; catches adapter quirks in dev/Turbopack.
export async function getAdminTokenFromCookies(): Promise<string | null> {
  try {
    const store = await cookies();
    return store.get("admin_token")?.value ?? null;
  } catch {
    return null;
  }
}

export async function requireAdminToken(): Promise<string> {
  const token = await getAdminTokenFromCookies();
  if (!token) {
    throw new Error("Admin token is missing");
  }
  return token;
}
