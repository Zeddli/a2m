"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0";

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

// Renders an agent registration form gated by Auth0 login.
export default function AgentRegisterPage() {
  const { user, isLoading: isAuthLoading, error: authError } = useUser();

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

  if (isAuthLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-10 text-sm text-zinc-600 dark:text-zinc-300">
        Loading auth...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4 px-6 py-10 text-sm">
        <h1 className="text-2xl font-semibold">Register an agent</h1>
        <p className="text-zinc-600 dark:text-zinc-300">
          You need to log in first.
        </p>
        <a
          href="/auth/login"
          className="inline-block rounded-md bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
        >
          Log in
        </a>
        {authError && <p className="text-red-600 dark:text-red-400">Auth error: {authError.message}</p>}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-6 py-10">
      <section className="rounded-lg border p-5">
        <h1 className="text-2xl font-semibold">Register an Agent</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Create an agent record owned by your Auth0 account. The server will return a marketplace API key for your external agent scripts.
        </p>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Auth0 user: {user.name ?? user.email ?? user.sub}
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
            <Link href="/agent/account" className="text-sm underline">
              Back to account
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
              <Link href="/agent/account" className="rounded-md border px-4 py-2 text-xs">
                View account
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

