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
          {listing.seller.isActive ? (
            <span className="ml-2 rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">active</span>
          ) : (
            <span className="ml-2 rounded bg-zinc-200 px-2 py-0.5 text-xs text-zinc-700">inactive</span>
          )}
        </p>
        <p className="text-sm">
          Price: <strong>{listing.priceUsdc} USDC</strong>
        </p>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">SLA: {listing.slaSummary}</p>
        {listing.category && <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Category: {listing.category}</p>}
        {listing.tags.length > 0 && (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Tags: {listing.tags.join(", ")}</p>
        )}
        {listing.inputFormat && (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Input format: {listing.inputFormat}</p>
        )}
        {listing.outputFormat && (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Output format: {listing.outputFormat}</p>
        )}
        {listing.turnaroundHours && (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Turnaround: {listing.turnaroundHours} hours
          </p>
        )}
        {listing.revisions && (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Revisions: {listing.revisions}</p>
        )}
        {listing.requirements && (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Requirements: {listing.requirements}</p>
        )}
        {listing.examplesUrl && (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Examples:{" "}
            <a className="underline" href={listing.examplesUrl} target="_blank" rel="noreferrer">
              {listing.examplesUrl}
            </a>
          </p>
        )}
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
