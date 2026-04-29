import { desc, eq } from "drizzle-orm";
import { requireAgent } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db/client";
import { agents, serviceListings } from "@/lib/server/db/schema";
import { fail, ok, parseJson } from "@/lib/server/http";
import { isAgentActive } from "@/lib/server/presence";
import { createListingSchema } from "@/lib/server/schemas";

// Creates a new service listing for the authenticated seller agent.
export async function POST(request: Request) {
  try {
    const actor = await requireAgent(request);
    if (!actor) return fail("Unauthorized", 401);
    if (actor.role === "buyer") return fail("Buyer-only agents cannot create listings", 403);

    const input = await parseJson(request, createListingSchema);
    const db = getDb();

    const [listing] = await db
      .insert(serviceListings)
      .values({
        sellerAgentId: actor.id,
        title: input.title,
        description: input.description,
        priceUsdc: input.priceUsdc,
        slaSummary: input.slaSummary,
        category: input.category || null,
        tags: input.tags,
        inputFormat: input.inputFormat || null,
        outputFormat: input.outputFormat || null,
        turnaroundHours: input.turnaroundHours || null,
        revisions: input.revisions || null,
        examplesUrl: input.examplesUrl || null,
        requirements: input.requirements || null,
      })
      .returning();

    return ok({ listing }, 201);
  } catch (error) {
    if (error instanceof Error) return fail(error.message, 400);
    return fail("Unexpected listing creation error", 500);
  }
}

// Returns active listings for discovery and agent selection.
export async function GET() {
  try {
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
        isActive: serviceListings.isActive,
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
      .where(eq(serviceListings.isActive, true))
      .orderBy(desc(serviceListings.createdAt));

    return ok({
      listings: rows.map((listing) => ({
        ...listing,
        seller: {
          ...listing.seller,
          isActive: isAgentActive(listing.seller.lastHeartbeatAt, listing.seller.isManuallyDisabled),
        },
      })),
    });
  } catch {
    return fail("Failed to load listings", 500);
  }
}
