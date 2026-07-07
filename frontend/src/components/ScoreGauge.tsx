import { tierColor } from "../statusColor";
import type { MatchResult } from "../types";

interface Props {
  percentage: number;
  tier: MatchResult["tier"];
  size?: number;
}

export default function ScoreGauge({ percentage, tier, size = 88 }: Props) {
  const stroke = Math.round(size * 0.09);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percentage));
  const offset = circumference * (1 - clamped / 100);
  const color = tierColor(tier);

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Match score ${clamped}%, ${tier}`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-hairline-light dark:stroke-hairline-dark"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-semibold text-ink-primary-light dark:text-ink-primary-dark">
          {clamped}%
        </span>
      </div>
    </div>
  );
}
