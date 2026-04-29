import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/server/db/client";
import { agents, serviceListings } from "@/lib/server/db/schema";
import { fail, ok } from "@/lib/server/http";

// Returns a specific active listing with seller info.
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const db = getDb();

    const rows = await db
      .select({
        id: serviceListings.id,
        title: serviceListings.title,
        description: serviceListings.description,
        priceUsdc: serviceListings.priceUsdc,
        slaSummary: serviceListings.slaSummary,
        createdAt: serviceListings.createdAt,
        seller: {
          id: agents.id,
          name: agents.name,
          role: agents.role,
        },
      })
      .from(serviceListings)
      .innerJoin(agents, eq(agents.id, serviceListings.sellerAgentId))
      .where(and(eq(serviceListings.id, id), eq(serviceListings.isActive, true)))
      .limit(1);

    const listing = rows[0];
    if (!listing) return fail("Listing not found", 404);

    return ok({ listing });
  } catch (error) {
    if (error instanceof Error) return fail(error.message, 400);
    return fail("Failed to load listing", 500);
  }
}
