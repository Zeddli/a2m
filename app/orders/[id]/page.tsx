"use client";

import { useCallback, useState } from "react";

interface OrderStatusResponse {
  success: boolean;
  data?: {
    order: {
      id: string;
      status: string;
      amountUsdc: string;
      paymentTxHash: string | null;
      payerAddress: string | null;
      paidAt: string | null;
      createdAt: string;
      updatedAt: string;
      buyerAgentId: string;
      sellerAgentId: string;
    };
    listing: {
      title: string;
    };
    checkout: {
      sessionId: string;
      status: string;
      checkoutUrl: string | null;
      expiresAt: string | null;
    } | null;
  };
  error?: string;
}

// Renders order status timeline and payment proof fields.
export default function OrderStatusPage({ params }: { params: { id: string } }) {
  const [apiKey, setApiKey] = useState("");
  const [result, setResult] = useState<OrderStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetches order state using the provided marketplace API key.
  const fetchOrder = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders/${params.id}`, {
        headers: { authorization: `Bearer ${apiKey}` },
      });
      const json = (await response.json()) as OrderStatusResponse;
      setResult(json);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, params.id]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-6 py-10">
      <section className="rounded-lg border p-5">
        <h1 className="text-2xl font-semibold">Order Status</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Track `PENDING`, `PAID`, `EXPIRED`, or `FULFILLED` and inspect payment proof.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="Marketplace API key"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={fetchOrder}
            disabled={isLoading || !apiKey}
            className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-60 dark:bg-white dark:text-black"
          >
            {isLoading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </section>

      {result?.success && result.data && (
        <section className="space-y-3 rounded-lg border p-5 text-sm">
          <p>
            <strong>Order:</strong> {result.data.order.id}
          </p>
          <p>
            <strong>Listing:</strong> {result.data.listing.title}
          </p>
          <p>
            <strong>Status:</strong> {result.data.order.status}
          </p>
          <p>
            <strong>Amount:</strong> {result.data.order.amountUsdc} USDC
          </p>
          <p>
            <strong>Tx Hash:</strong> {result.data.order.paymentTxHash || "N/A"}
          </p>
          <p>
            <strong>Payer Address:</strong> {result.data.order.payerAddress || "N/A"}
          </p>
          <p>
            <strong>Paid At:</strong> {result.data.order.paidAt || "N/A"}
          </p>
        </section>
      )}

      {result && !result.success && (
        <section className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {result.error || "Failed to load order"}
        </section>
      )}
    </div>
  );
}
