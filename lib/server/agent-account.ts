import { desc, eq } from "drizzle-orm";
import { agents, orders } from "@/lib/server/db/schema";
import { getDb } from "@/lib/server/db/client";
import { isAgentActive } from "@/lib/server/presence";

export interface AgentProfile {
  id: string;
  name: string;
  role: "seller" | "buyer" | "both";
  locusWalletAddress: string | null;
  lastHeartbeatAt: Date | null;
  isManuallyDisabled: boolean;
  isActive: boolean;
  createdAt: Date;
}

export interface LatestPaymentProof {
  orderId: string;
  status: string;
  paymentTxHash: string | null;
  payerAddress: string | null;
  paidAt: Date | null;
  updatedAt: Date;
}

export interface AgentWallet {
  locusWalletAddress: string | null;
  latestPaymentProof: LatestPaymentProof | null;
}

export interface AgentAccountData {
  agents: AgentProfile[];
  selectedAgentId: string | null;
  selectedAgentWallet: AgentWallet | null;
}

interface LegacyUserAgentRow {
  id: string;
  name: string;
  role: "seller" | "buyer" | "both";
  locusWalletAddress: string | null;
  createdAt: Date;
}

/**
 * Detects schema drift where newer agent columns are missing in DB.
 */
function isMissingAgentPresenceColumnsError(error: unknown): boolean {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return errorMessage.includes('column "last_heartbeat_at"') || errorMessage.includes('column "is_manually_disabled"');
}

/**
 * Chooses the newest payment proof between buyer- and seller-scoped orders.
 */
function pickNewestPaymentProof(buyer: LatestPaymentProof | null, seller: LatestPaymentProof | null): LatestPaymentProof | null {
  if (!buyer) return seller;
  if (!seller) return buyer;
  return buyer.updatedAt.getTime() >= seller.updatedAt.getTime() ? buyer : seller;
}

/**
 * Loads the latest order payment proof associated with the given agent id.
 */
async function getLatestPaymentProofForAgent(agentId: string): Promise<LatestPaymentProof | null> {
  const db = getDb();

  const [buyerOrder] = await db
    .select({
      orderId: orders.id,
      status: orders.status,
      paymentTxHash: orders.paymentTxHash,
      payerAddress: orders.payerAddress,
      paidAt: orders.paidAt,
      updatedAt: orders.updatedAt,
    })
    .from(orders)
    .where(eq(orders.buyerAgentId, agentId))
    .orderBy(desc(orders.updatedAt))
    .limit(1);

  const [sellerOrder] = await db
    .select({
      orderId: orders.id,
      status: orders.status,
      paymentTxHash: orders.paymentTxHash,
      payerAddress: orders.payerAddress,
      paidAt: orders.paidAt,
      updatedAt: orders.updatedAt,
    })
    .from(orders)
    .where(eq(orders.sellerAgentId, agentId))
    .orderBy(desc(orders.updatedAt))
    .limit(1);

  const buyerProof: LatestPaymentProof | null = buyerOrder
    ? {
        orderId: buyerOrder.orderId,
        status: buyerOrder.status,
        paymentTxHash: buyerOrder.paymentTxHash,
        payerAddress: buyerOrder.payerAddress,
        paidAt: buyerOrder.paidAt,
        updatedAt: buyerOrder.updatedAt,
      }
    : null;

  const sellerProof: LatestPaymentProof | null = sellerOrder
    ? {
        orderId: sellerOrder.orderId,
        status: sellerOrder.status,
        paymentTxHash: sellerOrder.paymentTxHash,
        payerAddress: sellerOrder.payerAddress,
        paidAt: sellerOrder.paidAt,
        updatedAt: sellerOrder.updatedAt,
      }
    : null;

  return pickNewestPaymentProof(buyerProof, sellerProof);
}

/**
 * Returns the user's agents and (for the selected agent) their wallet/payment proof.
 */
export async function getAgentAccountData(params: {
  ownerUserId?: string;
  selectedAgentId?: string;
}): Promise<AgentAccountData> {
  const db = getDb();

  let userAgents:
    | Array<{
        id: string;
        name: string;
        role: "seller" | "buyer" | "both";
        locusWalletAddress: string | null;
        lastHeartbeatAt: Date | null;
        isManuallyDisabled: boolean;
        createdAt: Date;
      }>
    | LegacyUserAgentRow[] = [];

  try {
    if (params.ownerUserId) {
      userAgents = await db
        .select({
          id: agents.id,
          name: agents.name,
          role: agents.role,
          locusWalletAddress: agents.locusWalletAddress,
          lastHeartbeatAt: agents.lastHeartbeatAt,
          isManuallyDisabled: agents.isManuallyDisabled,
          createdAt: agents.createdAt,
        })
        .from(agents)
        .where(eq(agents.ownerUserId, params.ownerUserId))
        .orderBy(desc(agents.createdAt));
    } else {
      userAgents = await db
        .select({
          id: agents.id,
          name: agents.name,
          role: agents.role,
          locusWalletAddress: agents.locusWalletAddress,
          lastHeartbeatAt: agents.lastHeartbeatAt,
          isManuallyDisabled: agents.isManuallyDisabled,
          createdAt: agents.createdAt,
        })
        .from(agents)
        .orderBy(desc(agents.createdAt));
    }
  } catch (error) {
    if (!isMissingAgentPresenceColumnsError(error)) throw error;

    if (params.ownerUserId) {
      userAgents = await db
        .select({
          id: agents.id,
          name: agents.name,
          role: agents.role,
          locusWalletAddress: agents.locusWalletAddress,
          createdAt: agents.createdAt,
        })
        .from(agents)
        .where(eq(agents.ownerUserId, params.ownerUserId))
        .orderBy(desc(agents.createdAt));
    } else {
      userAgents = await db
        .select({
          id: agents.id,
          name: agents.name,
          role: agents.role,
          locusWalletAddress: agents.locusWalletAddress,
          createdAt: agents.createdAt,
        })
        .from(agents)
        .orderBy(desc(agents.createdAt));
    }
  }

  const agentProfiles: AgentProfile[] = userAgents.map((agent) => ({
    id: agent.id,
    name: agent.name,
    role: agent.role,
    locusWalletAddress: agent.locusWalletAddress,
    lastHeartbeatAt: "lastHeartbeatAt" in agent ? agent.lastHeartbeatAt ?? null : null,
    isManuallyDisabled: "isManuallyDisabled" in agent ? agent.isManuallyDisabled : false,
    isActive: isAgentActive(
      "lastHeartbeatAt" in agent ? agent.lastHeartbeatAt ?? null : null,
      "isManuallyDisabled" in agent ? agent.isManuallyDisabled : false,
    ),
    createdAt: agent.createdAt,
  }));

  if (agentProfiles.length === 0) {
    return { agents: [], selectedAgentId: null, selectedAgentWallet: null };
  }

  const selected = agentProfiles.find((agent) => agent.id === params.selectedAgentId) ?? agentProfiles[0];
  const latestPaymentProof = await getLatestPaymentProofForAgent(selected.id);

  return {
    agents: agentProfiles,
    selectedAgentId: selected.id,
    selectedAgentWallet: {
      locusWalletAddress: selected.locusWalletAddress,
      latestPaymentProof,
    },
  };
}

