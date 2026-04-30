import Link from "next/link";
import { getAgentAccountData } from "@/lib/server/agent-account";

// Returns visual style classes for active and inactive agent status.
function getAgentStatusClass(isActive: boolean): string {
  if (isActive) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200";
  return "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200";
}

// Renders a seller-focused dashboard with heartbeat, wallet, and quick actions.
export default async function SellerDashboardPage({
  searchParams,
}: {
  searchParams?: { agentId?: string };
}) {
  const accountData = await getAgentAccountData({
    selectedAgentId: searchParams?.agentId,
  });

  if (accountData.agents.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-6 px-6 py-10">
        <section className="rounded-lg border p-5">
          <h1 className="text-2xl font-semibold">Seller Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Track your agent activity and delivery readiness.
          </p>
        </section>
        <section className="rounded-lg border border-blue-200 bg-blue-50 p-5 text-sm dark:border-blue-900 dark:bg-blue-950">
          <p className="font-medium">No agents are currently registered in the marketplace.</p>
        </section>
      </div>
    );
  }

  const selectedAgent = accountData.agents.find((agent) => agent.id === accountData.selectedAgentId) ?? accountData.agents[0];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-10">
      <section className="rounded-lg border p-5">
        <h1 className="text-2xl font-semibold">Seller Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          View heartbeat status, wallet profile, and payment proof for your seller agents.
        </p>
      </section>

      <section className="rounded-lg border p-5">
        <h2 className="text-lg font-semibold">Marketplace Agents</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {accountData.agents.map((agent) => {
            const isSelected = agent.id === selectedAgent.id;
            return (
              <Link
                key={agent.id}
                href={`/agent/dashboard?agentId=${agent.id}`}
                className={[
                  "inline-flex items-center rounded-md border px-3 py-2 text-sm",
                  isSelected
                    ? "border-black bg-black text-white dark:bg-white dark:text-black"
                    : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100",
                ].join(" ")}
                aria-current={isSelected ? "page" : undefined}
              >
                {agent.name}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <article className="rounded-lg border p-5 text-sm">
          <h3 className="text-base font-semibold">Agent Status</h3>
          <p className="mt-2">
            <strong>Role:</strong> {selectedAgent.role}
          </p>
          <p className="mt-2">
            <strong>Heartbeat:</strong>{" "}
            {selectedAgent.lastHeartbeatAt ? selectedAgent.lastHeartbeatAt.toLocaleString() : "never"}
          </p>
          <p className="mt-2">
            <strong>State:</strong>{" "}
            <span className={`rounded px-2 py-0.5 text-xs ${getAgentStatusClass(selectedAgent.isActive)}`}>
              {selectedAgent.isActive ? "active" : "inactive"}
            </span>
          </p>
        </article>

        <article className="rounded-lg border p-5 text-sm">
          <h3 className="text-base font-semibold">Wallet</h3>
          <p className="mt-2 break-all">
            <strong>Locus wallet:</strong> {accountData.selectedAgentWallet?.locusWalletAddress || "Not configured"}
          </p>
        </article>

        <article className="rounded-lg border p-5 text-sm">
          <h3 className="text-base font-semibold">Latest Payment Proof</h3>
          {accountData.selectedAgentWallet?.latestPaymentProof ? (
            <>
              <p className="mt-2 break-all">
                <strong>Order:</strong> {accountData.selectedAgentWallet.latestPaymentProof.orderId}
              </p>
              <p className="mt-1">
                <strong>Status:</strong> {accountData.selectedAgentWallet.latestPaymentProof.status}
              </p>
              <p className="mt-1 break-all">
                <strong>Tx hash:</strong> {accountData.selectedAgentWallet.latestPaymentProof.paymentTxHash || "N/A"}
              </p>
            </>
          ) : (
            <p className="mt-2 text-zinc-600 dark:text-zinc-300">No payments yet.</p>
          )}
        </article>
      </section>

      <section className="rounded-lg border p-5">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href="/listings" className="rounded-md border px-3 py-2">
            Open listings
          </Link>
          <Link href="/agent/account" className="rounded-md border px-3 py-2">
            Open account
          </Link>
          <Link href="/docs/agent-quickstart" className="rounded-md border px-3 py-2">
            View docs
          </Link>
        </div>
      </section>
    </div>
  );
}
