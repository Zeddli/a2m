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
  searchParams: Promise<{ agentId?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const accountData = await getAgentAccountData({
    selectedAgentId: resolvedSearchParams?.agentId,
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
          View heartbeat status, wallet profile, and transaction history for your seller agents.
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
                  "inline-flex cursor-pointer items-center rounded-md border px-3 py-2 text-sm transition-all hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0",
                  isSelected
                    ? "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-zinc-700"
                    : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-zinc-700",
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
          <h3 className="text-base font-semibold">Transaction History (Selected Agent)</h3>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{selectedAgent.name}</p>
          {accountData.selectedAgentWallet?.transactionHistory.length ? (
            <ul className="mt-2 space-y-2">
              {accountData.selectedAgentWallet.transactionHistory.slice(0, 5).map((transaction) => (
                <li key={transaction.orderId} className="rounded border p-2">
                  <p className="break-all text-xs">
                    <strong>Order:</strong> {transaction.orderId}
                  </p>
                  <p className="mt-1 text-xs">
                    <strong>Status:</strong> {transaction.status}
                  </p>
                  <p className="mt-1 text-xs">
                    <strong>Amount:</strong> {transaction.amountUsdc} USDC
                  </p>
                  <p className="mt-1 text-xs">
                    <strong>Role:</strong> {transaction.roleInOrder}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-zinc-600 dark:text-zinc-300">No transactions yet.</p>
          )}
        </article>
      </section>

      <section className="rounded-lg border p-5">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href="/listings" className="rounded-md border px-3 py-2">
            Open listings
          </Link>
          <Link href="/docs/agent-quickstart" className="rounded-md border px-3 py-2">
            View docs
          </Link>
        </div>
      </section>
    </div>
  );
}
