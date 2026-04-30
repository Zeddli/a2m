"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

interface RegisterAgentApiResponse {
  success: boolean;
  data?: {
    agent: {
      id: string;
      name: string;
      role: "seller" | "buyer" | "both";
      locusWalletAddress: string | null;
      createdAt: string;
    };
    apiKey: string;
  };
  error?: string;
}

// Renders an agent registration form for local operator usage.
export default function AgentRegisterPage() {
  const [name, setName] = useState("");
  const [role, setRole] = useState<"seller" | "buyer" | "both">("both");
  const [locusWalletAddress, setLocusWalletAddress] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<{
    agentName: string;
    role: "seller" | "buyer" | "both";
    locusWalletAddress: string | null;
    apiKey: string;
  } | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setErrorMessage(null);
    setResult(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/agents/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          role,
          locusWalletAddress: locusWalletAddress.trim() || undefined,
        }),
      });

      const json = (await response.json()) as RegisterAgentApiResponse;
      if (!json.success || !json.data) {
        setErrorMessage(json.error || "Failed to register agent");
        return;
      }

      setResult({
        agentName: json.data.agent.name,
        role: json.data.agent.role,
        locusWalletAddress: json.data.agent.locusWalletAddress,
        apiKey: json.data.apiKey,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to register agent");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-6 py-10">
      <section className="rounded-lg border p-5">
        <h1 className="text-2xl font-semibold">Register an Agent</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Create an agent record and receive a marketplace API key for your external agent scripts.
        </p>
      </section>

      <section className="rounded-lg border p-5">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="agentName">
              Agent name
            </label>
            <input
              id="agentName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. seller-agent-1"
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="agentRole">
              Role
            </label>
            <select
              id="agentRole"
              value={role}
              onChange={(event) => setRole(event.target.value as "seller" | "buyer" | "both")}
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="seller">seller</option>
              <option value="buyer">buyer</option>
              <option value="both">both</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="locusWalletAddress">
              Locus wallet address (optional)
            </label>
            <input
              id="locusWalletAddress"
              value={locusWalletAddress}
              onChange={(event) => setLocusWalletAddress(event.target.value)}
              placeholder="e.g. 0x... (if you have one)"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>

          {errorMessage && (
            <p className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
              {errorMessage}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-60 dark:bg-white dark:text-black"
            >
              {isSubmitting ? "Registering..." : "Register agent"}
            </button>
            <Link href="/agent/dashboard" className="text-sm underline">
              Back to dashboard
            </Link>
          </div>
        </form>
      </section>

      {result && (
        <section className="rounded-lg border p-5 text-sm">
          <h2 className="text-lg font-semibold">Marketplace API Key</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-300">
            Provide this key to your external agent scripts. It is used for the marketplace endpoints (bearer auth).
          </p>

          <div className="mt-4 space-y-2">
            <p>
              <strong>Agent:</strong> {result.agentName} ({result.role})
            </p>
            {result.locusWalletAddress ? (
              <p className="break-all">
                <strong>Locus wallet:</strong> {result.locusWalletAddress}
              </p>
            ) : (
              <p className="text-zinc-600 dark:text-zinc-300">No Locus wallet provided.</p>
            )}
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium" htmlFor="apiKeyOutput">
              apiKey
            </label>
            <input
              id="apiKeyOutput"
              value={result.apiKey}
              readOnly
              className="mt-2 w-full rounded-md border px-3 py-2 text-xs"
            />
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(result.apiKey);
                }}
                className="rounded-md border px-4 py-2 text-xs"
              >
                Copy
              </button>
              <Link href="/agent/dashboard" className="rounded-md border px-4 py-2 text-xs">
                View dashboard
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

