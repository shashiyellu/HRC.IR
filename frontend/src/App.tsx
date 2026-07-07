import { useState } from "react";
import JDInput from "./components/JDInput";
import ResumeDropzone from "./components/ResumeDropzone";
import ResultCard from "./components/ResultCard";
import ThemeToggle from "./components/ThemeToggle";
import { matchResumes } from "./api";
import type { MatchResult, StagedResume } from "./types";

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-hairline-light bg-surface-light px-5 py-4 shadow-sm dark:border-hairline-dark dark:bg-surface-dark">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mt-1.5 text-3xl font-bold tracking-tight text-ink-primary-light dark:text-ink-primary-dark">
        {value}
      </p>
    </div>
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
      {n}
    </span>
  );
}

export default function App() {
  const [jdText, setJdText] = useState("");
  const [resumes, setResumes] = useState<StagedResume[]>([]);
  const [results, setResults] = useState<MatchResult[] | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAnalyze = jdText.trim().length > 0 && resumes.length > 0 && !isMatching;

  async function handleAnalyze() {
    setIsMatching(true);
    setError(null);
    setResults(null);
    try {
      const response = await matchResumes(
        jdText,
        resumes.map((r) => r.file),
      );
      setResults(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while analyzing resumes.");
    } finally {
      setIsMatching(false);
    }
  }

  const successfulResults = results?.filter((r) => !r.error) ?? [];
  const avgScore =
    successfulResults.length > 0
      ? Math.round(successfulResults.reduce((sum, r) => sum + r.match_percentage, 0) / successfulResults.length)
      : null;
  const topScore = successfulResults[0]?.match_percentage ?? null;

  return (
    <div className="min-h-screen bg-page-light dark:bg-page-dark">
      <header className="sticky top-0 z-10 border-b border-hairline-light bg-surface-light/90 backdrop-blur dark:border-hairline-dark dark:bg-surface-dark/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
              R
            </div>
            <span className="text-base font-semibold text-ink-primary-light dark:text-ink-primary-dark">
              Resume Matcher
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-ink-primary-light dark:text-ink-primary-dark">
            Match candidates to your job description
          </h1>
          <p className="mt-1.5 text-sm text-ink-secondary-light dark:text-ink-secondary-dark">
            Paste or upload a job description, drop in candidate resumes, and get a ranked, AI-scored shortlist.
          </p>
        </div>

        <section className="rounded-2xl border border-hairline-light bg-surface-light p-6 shadow-sm dark:border-hairline-dark dark:bg-surface-dark">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <StepBadge n={1} />
                <h2 className="text-sm font-semibold text-ink-primary-light dark:text-ink-primary-dark">
                  Job description
                </h2>
              </div>
              <JDInput value={jdText} onChange={setJdText} hideHeading />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <StepBadge n={2} />
                <h2 className="text-sm font-semibold text-ink-primary-light dark:text-ink-primary-dark">
                  Candidate resumes
                </h2>
              </div>
              <ResumeDropzone resumes={resumes} onChange={setResumes} hideHeading />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 border-t border-hairline-light pt-6 dark:border-hairline-dark">
            <button
              type="button"
              disabled={!canAnalyze}
              onClick={handleAnalyze}
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-brand"
            >
              {isMatching && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {isMatching ? "Analyzing…" : "Analyze matches"}
            </button>
            {resumes.length > 0 && (
              <span className="text-sm text-ink-muted">
                {resumes.length} resume{resumes.length === 1 ? "" : "s"} staged
              </span>
            )}
          </div>
        </section>

        {error && (
          <div className="mt-4 rounded-lg border border-status-critical/30 bg-status-critical/5 px-4 py-3 text-sm text-status-critical">
            {error}
          </div>
        )}

        {isMatching && (
          <div className="mt-10 flex flex-col items-center gap-3 py-16 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-hairline-light border-t-brand dark:border-hairline-dark" />
            <p className="text-sm text-ink-muted">
              Scoring {resumes.length} resume{resumes.length === 1 ? "" : "s"} against the job description…
            </p>
          </div>
        )}

        {results && !isMatching && (
          <section className="mt-10">
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile label="Candidates" value={String(results.length)} />
              <StatTile label="Top match" value={topScore !== null ? `${topScore}%` : "—"} />
              <StatTile label="Average match" value={avgScore !== null ? `${avgScore}%` : "—"} />
              <StatTile
                label="Excellent matches"
                value={String(successfulResults.filter((r) => r.tier === "Excellent Match").length)}
              />
            </div>

            <div className="flex flex-col gap-4">
              {results.map((result, i) => (
                <ResultCard key={result.filename + i} result={result} rank={i + 1} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
