import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthenticatedUserSub } from "@/lib/server/auth0";
import { getAgentAccountData } from "@/lib/server/agent-account";

export default async function AgentAccountPage({
  searchParams,
}: {
  searchParams?: { agentId?: string };
}) {
  const ownerUserId = await getAuthenticatedUserSub();
  if (!ownerUserId) redirect(`/auth/login?returnTo=/agent/account`);

  const accountData = await getAgentAccountData({
    ownerUserId,
    selectedAgentId: searchParams?.agentId,
  });

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-6 py-10">
      <section className="rounded-lg border p-5">
        <h1 className="text-2xl font-semibold">Agent Account</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Manage your registered agents and view their wallet/payment proof.
        </p>
      </section>

      {accountData.agents.length === 0 && (
        <section className="rounded-lg border border-blue-200 bg-blue-50 p-5 text-sm dark:border-blue-900 dark:bg-blue-950">
          <p className="font-medium">No registered agents yet.</p>
          <p className="mt-2 text-zinc-700 dark:text-zinc-200">
            Register your agent first, then it will appear here.
          </p>
          <div className="mt-4">
            <Link
              href="/agent/register"
              className="inline-block rounded-md bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
            >
              Register an agent
            </Link>
          </div>
        </section>
      )}

      {accountData.agents.length > 0 && (
        <>
          <section className="rounded-lg border p-5">
            <h2 className="text-lg font-semibold">Your Agents</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              Select an agent to view its profile and wallet.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {accountData.agents.map((agent) => {
                const isSelected = agent.id === accountData.selectedAgentId;
                return (
                  <Link
                    key={agent.id}
                    href={`/agent/account?agentId=${agent.id}`}
                    className={[
                      "inline-flex items-center rounded-md border px-3 py-2 text-sm",
                      isSelected
                        ? "border-black bg-black text-white dark:bg-white dark:text-black"
                        : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100",
                    ].join(" ")}
                    aria-current={isSelected ? "page" : undefined}
                  >
                    {agent.name}
                    {agent.isActive ? (
                      <span className="ml-2 rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                        active
                      </span>
                    ) : (
                      <span className="ml-2 rounded bg-zinc-200 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                        inactive
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="mt-4">
              <Link href="/agent/register" className="text-sm underline">
                Register another agent
              </Link>
            </div>
          </section>

          {accountData.selectedAgentWallet && accountData.selectedAgentId && (
            <section className="grid gap-5 md:grid-cols-2">
              <div className="rounded-lg border p-5 text-sm">
                {(() => {
                  const selectedProfile = accountData.agents.find((a) => a.id === accountData.selectedAgentId);
                  if (!selectedProfile) return null;

                  return (
                    <>
                      <h2 className="text-lg font-semibold">Profile</h2>
                      <p className="mt-2">
                        <strong>Name:</strong> {selectedProfile.name}
                      </p>
                      <p className="mt-1">
                        <strong>Role:</strong> {selectedProfile.role}
                      </p>
                      <p className="mt-1">
                        <strong>Status:</strong>{" "}
                        {selectedProfile.isActive ? "active" : "inactive"}
                      </p>
                      <p className="mt-1">
                        <strong>Last heartbeat:</strong>{" "}
                        {selectedProfile.lastHeartbeatAt
                          ? selectedProfile.lastHeartbeatAt.toLocaleString()
                          : "never"}
                      </p>
                      {selectedProfile.isManuallyDisabled && (
                        <p className="mt-2 rounded bg-zinc-100 p-2 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                          This agent is manually disabled.
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>

              <div className="rounded-lg border p-5 text-sm">
                <h2 className="text-lg font-semibold">Wallet</h2>
                {accountData.selectedAgentWallet.locusWalletAddress ? (
                  <p className="mt-2 break-all">
                    <strong>Locus wallet:</strong> {accountData.selectedAgentWallet.locusWalletAddress}
                  </p>
                ) : (
                  <p className="mt-2 text-zinc-600 dark:text-zinc-300">No Locus wallet registered.</p>
                )}

                <div className="mt-4 rounded-md border bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="font-medium">Latest payment proof</p>
                  {accountData.selectedAgentWallet.latestPaymentProof ? (
                    <>
                      <p className="mt-2 break-all text-xs text-zinc-700 dark:text-zinc-200">
                        <strong>Order:</strong> {accountData.selectedAgentWallet.latestPaymentProof.orderId}
                      </p>
                      <p className="mt-1 break-all text-xs text-zinc-700 dark:text-zinc-200">
                        <strong>Status:</strong> {accountData.selectedAgentWallet.latestPaymentProof.status}
                      </p>
                      <p className="mt-1 break-all text-xs text-zinc-700 dark:text-zinc-200">
                        <strong>Tx hash:</strong>{" "}
                        {accountData.selectedAgentWallet.latestPaymentProof.paymentTxHash ?? "N/A"}
                      </p>
                      <p className="mt-1 break-all text-xs text-zinc-700 dark:text-zinc-200">
                        <strong>Payer:</strong>{" "}
                        {accountData.selectedAgentWallet.latestPaymentProof.payerAddress ?? "N/A"}
                      </p>
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                        <strong>Paid at:</strong>{" "}
                        {accountData.selectedAgentWallet.latestPaymentProof.paidAt
                          ? accountData.selectedAgentWallet.latestPaymentProof.paidAt.toLocaleString()
                          : "N/A"}
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">No payments yet.</p>
                  )}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

