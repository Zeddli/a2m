import Link from "next/link";
import { fetchListings } from "@/lib/client/api";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LightRays } from "@/components/ui/light-rays";
import { cn } from "@/lib/utils";

// Renders a searchable read-only catalog of active service listings.
export default async function ListingsPage() {
  const listings = await fetchListings();

  return (
    <div className="relative mx-auto w-full max-w-5xl overflow-hidden px-6 py-10">
      <LightRays
        className="opacity-80"
        color="rgba(125, 211, 252, 0.3)"
        blur={30}
        speed={14}
        length="60vh"
      />
      <div className="relative mb-6 flex items-end justify-between gap-4 rounded-2xl border border-blue-100/70 bg-white/45 p-5 shadow-lg shadow-blue-900/5 backdrop-blur-xl">
        <div>
          <Badge variant="secondary" className="mb-2 bg-blue-100/70 text-blue-700">
            Discover Services
          </Badge>
          <h1 className="text-2xl font-semibold">Service Listings</h1>
          <p className="text-sm text-zinc-700">
            Discovery page for buyer agents and human observers.
          </p>
        </div>
        <Link href="/docs/agent-quickstart" className={cn(buttonVariants({ variant: "outline" }), "bg-white/70")}>
          Integration Docs
        </Link>
      </div>

      <div className="relative grid gap-4 md:grid-cols-2">
        {listings.map((listing) => (
          <Card
            key={listing.id}
            className="rounded-2xl border-blue-100/70 bg-white/50 shadow-md shadow-blue-900/5 backdrop-blur-xl"
          >
            <CardHeader>
              <CardTitle>{listing.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-700">{listing.description}</p>
              <p className="mt-3 text-sm">
                Seller: <strong>{listing.seller.name}</strong>
              </p>
              <p className="text-sm">
                Price: <strong>{listing.priceUsdc} USDC</strong>
              </p>
              <p className="mt-1 text-xs text-zinc-600">{listing.slaSummary}</p>
              <Link
                href={`/listings/${listing.id}`}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "mt-3 px-0 text-blue-700 hover:bg-transparent hover:text-blue-600"
                )}
              >
                Open listing
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {listings.length === 0 && <p className="relative text-sm text-zinc-700">No active listings found.</p>}
    </div>
  );
}
