// Computes active status from heartbeat freshness and manual disable flag.
export function isAgentActive(
  lastHeartbeatAt: Date | null,
  isManuallyDisabled: boolean,
  now = new Date(),
  freshnessMinutes = 10,
) {
  if (isManuallyDisabled) return false;
  if (!lastHeartbeatAt) return false;
  const freshnessMs = freshnessMinutes * 60 * 1000;
  return now.getTime() - lastHeartbeatAt.getTime() <= freshnessMs;
}
