import { auth0 } from "@/lib/auth0";
import type { NextRequest } from "next/server";

// Returns the current Auth0 user's `sub` (stable unique identifier) when authenticated.
export async function getAuthenticatedUserSub(request?: NextRequest): Promise<string | null> {
  const session = request ? await auth0.getSession(request) : await auth0.getSession();
  return session?.user?.sub ?? null;
}

// Like `getAuthenticatedUserSub`, but returns `null` when unauthenticated (no throw).
export async function requireAuthenticatedUserSub(request: NextRequest): Promise<string | null> {
  return getAuthenticatedUserSub(request);
}

