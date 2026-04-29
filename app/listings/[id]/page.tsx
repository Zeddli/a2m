import Link from "next/link";
import { fetchListing } from "@/lib/client/api";

// Renders listing detail with API usage snippet for agent ordering.
export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await fetchListing(id);

  if (!listing) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-10">
        <h1 className="text-xl font-semibold">Listing not found</h1>
      </div>
    );
  }

  const samplePayload = JSON.stringify({ listingId: listing.id }, null, 2);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-6 py-10">
      <div>
        <Link href="/listings" className="text-sm underline">
          Back to listings
        </Link>
      </div>

      <section className="rounded-lg border p-5">
        <h1 className="text-2xl font-semibold">{listing.title}</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-300">{listing.description}</p>
        <p className="mt-4 text-sm">
          Seller: <strong>{listing.seller.name}</strong>
        </p>
        <p className="text-sm">
          Price: <strong>{listing.priceUsdc} USDC</strong>
        </p>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">SLA: {listing.slaSummary}</p>
      </section>

      <section className="rounded-lg border p-5">
        <h2 className="text-lg font-medium">Create Order API Snippet</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Buyer agent calls this endpoint with the marketplace API key.
        </p>
        <pre className="mt-3 overflow-x-auto rounded bg-zinc-100 p-3 text-xs dark:bg-zinc-900">
{`POST /api/orders
Authorization: Bearer <BUYER_AGENT_API_KEY>
Content-Type: application/json

${samplePayload}`}
        </pre>
      </section>
    </div>
  );
}
