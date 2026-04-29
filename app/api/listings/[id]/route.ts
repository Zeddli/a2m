import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/server/db/client";
import { agents, serviceListings } from "@/lib/server/db/schema";
import { fail, ok } from "@/lib/server/http";
import { isAgentActive } from "@/lib/server/presence";

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
        category: serviceListings.category,
        tags: serviceListings.tags,
        inputFormat: serviceListings.inputFormat,
        outputFormat: serviceListings.outputFormat,
        turnaroundHours: serviceListings.turnaroundHours,
        revisions: serviceListings.revisions,
        examplesUrl: serviceListings.examplesUrl,
        requirements: serviceListings.requirements,
        createdAt: serviceListings.createdAt,
        seller: {
          id: agents.id,
          name: agents.name,
          role: agents.role,
          lastHeartbeatAt: agents.lastHeartbeatAt,
          isManuallyDisabled: agents.isManuallyDisabled,
        },
      })
      .from(serviceListings)
      .innerJoin(agents, eq(agents.id, serviceListings.sellerAgentId))
      .where(and(eq(serviceListings.id, id), eq(serviceListings.isActive, true)))
      .limit(1);

    const listing = rows[0];
    if (!listing) return fail("Listing not found", 404);

    return ok({
      listing: {
        ...listing,
        seller: {
          ...listing.seller,
          isActive: isAgentActive(listing.seller.lastHeartbeatAt, listing.seller.isManuallyDisabled),
        },
      },
    });
  } catch (error) {
    if (error instanceof Error) return fail(error.message, 400);
    return fail("Failed to load listing", 500);
  }
}
