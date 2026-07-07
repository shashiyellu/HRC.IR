import { tierColor, tierIcon } from "../statusColor";
import type { MatchResult } from "../types";

export default function TierBadge({ tier }: { tier: MatchResult["tier"] }) {
  const color = tierColor(tier);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
      style={{ borderColor: color, color }}
    >
      <span aria-hidden="true">{tierIcon(tier)}</span>
      {tier}
    </span>
  );
}
