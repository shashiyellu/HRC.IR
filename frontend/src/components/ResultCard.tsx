import { useState } from "react";
import ScoreGauge from "./ScoreGauge";
import TierBadge from "./TierBadge";
import type { MatchResult } from "../types";

function SkillChips({ skills, tone }: { skills: string[]; tone: "matched" | "missing" }) {
  if (skills.length === 0) {
    return <span className="text-xs italic text-ink-muted">None noted</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((skill) => (
        <span
          key={skill}
          className={
            tone === "matched"
              ? "inline-flex items-center gap-1 rounded-full bg-status-good/10 px-2.5 py-1 text-xs font-medium text-status-good"
              : "inline-flex items-center gap-1 rounded-full bg-status-critical/10 px-2.5 py-1 text-xs font-medium text-status-critical"
          }
        >
          <span aria-hidden="true">{tone === "matched" ? "✓" : "✕"}</span>
          {skill}
        </span>
      ))}
    </div>
  );
}

export default function ResultCard({ result, rank }: { result: MatchResult; rank: number }) {
  const [expanded, setExpanded] = useState(false);

  if (result.error) {
    return (
      <div className="rounded-2xl border border-status-critical/30 bg-status-critical/5 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium text-ink-primary-light dark:text-ink-primary-dark">{result.filename}</span>
          <span className="text-xs font-medium text-status-critical">Analysis failed</span>
        </div>
        <p className="mt-1 text-sm text-ink-secondary-light dark:text-ink-secondary-dark">{result.error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-hairline-light bg-surface-light p-5 shadow-sm transition hover:shadow-md dark:border-hairline-dark dark:bg-surface-dark">
      <div className="flex items-start gap-4">
        <span className="mt-1 w-6 shrink-0 text-sm font-semibold text-ink-muted">#{rank}</span>
        <ScoreGauge percentage={result.match_percentage} tier={result.tier} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold text-ink-primary-light dark:text-ink-primary-dark">
              {result.candidate_name}
            </h3>
            <TierBadge tier={result.tier} />
          </div>
          <p className="truncate text-xs text-ink-muted">{result.filename}</p>
          <p className="mt-2 text-sm text-ink-secondary-light dark:text-ink-secondary-dark">{result.summary}</p>
          {result.experience_fit && (
            <p className="mt-1 text-xs italic text-ink-muted">{result.experience_fit}</p>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-hairline-light bg-page-light/60 p-4 dark:border-hairline-dark dark:bg-page-dark/40">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">Skills comparison</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-xs font-semibold text-status-good">
              Matched skills ({result.matched_skills.length})
            </p>
            <SkillChips skills={result.matched_skills} tone="matched" />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold text-status-critical">
              Unmatched skills ({result.missing_skills.length})
            </p>
            <SkillChips skills={result.missing_skills} tone="missing" />
          </div>
        </div>
      </div>

      {(result.strengths.length > 0 || result.concerns.length > 0) && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-xs font-medium text-brand hover:underline"
          >
            {expanded ? "Hide details" : "Show strengths & concerns"}
          </button>
          {expanded && (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {result.strengths.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-status-good">Strengths</p>
                  <ul className="list-inside list-disc text-sm text-ink-secondary-light dark:text-ink-secondary-dark">
                    {result.strengths.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.concerns.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-status-serious">Concerns</p>
                  <ul className="list-inside list-disc text-sm text-ink-secondary-light dark:text-ink-secondary-dark">
                    {result.concerns.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
