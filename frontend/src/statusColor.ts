import type { MatchResult } from "./types";

export const STATUS_COLORS = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
} as const;

export function tierColor(tier: MatchResult["tier"]): string {
  switch (tier) {
    case "Excellent Match":
      return STATUS_COLORS.good;
    case "Good Match":
      return STATUS_COLORS.warning;
    case "Partial Match":
      return STATUS_COLORS.serious;
    case "Weak Match":
    default:
      return STATUS_COLORS.critical;
  }
}

export function tierIcon(tier: MatchResult["tier"]): string {
  switch (tier) {
    case "Excellent Match":
      return "✓"; // check
    case "Good Match":
      return "●"; // filled dot
    case "Partial Match":
      return "◐"; // half dot
    case "Weak Match":
    default:
      return "✕"; // cross
  }
}
