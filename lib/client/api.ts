const API_BASE = process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000";

export interface ListingItem {
  id: string;
  title: string;
  description: string;
  priceUsdc: string;
  slaSummary: string;
  category: string | null;
  tags: string[];
  inputFormat: string | null;
  outputFormat: string | null;
  turnaroundHours: string | null;
  revisions: string | null;
  examplesUrl: string | null;
  requirements: string | null;
  createdAt: string;
  seller: {
    id: string;
    name: string;
    role: "seller" | "buyer" | "both";
    isActive?: boolean;
  };
}

export interface OrderItem {
  order: {
    id: string;
    buyerAgentId: string;
    sellerAgentId: string;
    status: "PENDING" | "PAID" | "EXPIRED" | "CANCELLED" | "FULFILLED";
    amountUsdc: string;
    paymentTxHash: string | null;
    payerAddress: string | null;
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  listing: {
    id: string;
    title: string;
  };
  buyer: {
    id: string;
    name: string;
  };
  checkout: {
    sessionId: string;
    checkoutUrl: string | null;
    status: "PENDING" | "PAID" | "EXPIRED" | "CANCELLED";
    expiresAt: string | null;
  } | null;
}

// Loads active listings for marketplace pages.
export async function fetchListings(): Promise<ListingItem[]> {
  const response = await fetch(`${API_BASE}/api/listings`, { cache: "no-store" });
  if (!response.ok) return [];

  const json = await response.json();
  if (!json.success) return [];

  return json.data.listings as ListingItem[];
}

// Loads a single listing for the listing detail page.
export async function fetchListing(id: string): Promise<ListingItem | null> {
  const response = await fetch(`${API_BASE}/api/listings/${id}`, { cache: "no-store" });
  if (!response.ok) return null;

  const json = await response.json();
  if (!json.success) return null;

  return json.data.listing as ListingItem;
}
