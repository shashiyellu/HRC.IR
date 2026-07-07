import { useRef, useState } from "react";
import { extractTextFromFile } from "../api";

interface Props {
  value: string;
  onChange: (text: string) => void;
  hideHeading?: boolean;
}

export default function JDInput({ value, onChange, hideHeading }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceFilename, setSourceFilename] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setIsExtracting(true);
    try {
      const text = await extractTextFromFile(file);
      onChange(text);
      setSourceFilename(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read file");
    } finally {
      setIsExtracting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        {!hideHeading && (
          <h2 className="text-sm font-semibold text-ink-primary-light dark:text-ink-primary-dark">
            Job description
          </h2>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`rounded-lg border border-hairline-light px-3 py-1.5 text-xs font-medium text-ink-secondary-light transition hover:border-brand hover:text-brand dark:border-hairline-dark dark:text-ink-secondary-dark ${
            hideHeading ? "" : "ml-auto"
          }`}
        >
          Upload file (PDF / DOCX / TXT)
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        className={`rounded-lg border transition ${
          isDragging
            ? "border-brand bg-brand/5"
            : "border-hairline-light bg-page-light/60 dark:border-hairline-dark dark:bg-page-dark/40"
        }`}
      >
        <textarea
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setSourceFilename(null);
          }}
          placeholder="Paste the job description here, or drag a PDF/DOCX/TXT file onto this box…"
          rows={10}
          className="w-full resize-y rounded-lg bg-transparent p-3.5 text-sm leading-relaxed text-ink-primary-light outline-none placeholder:text-ink-muted dark:text-ink-primary-dark"
        />
      </div>

      <div className="flex min-h-[1.25rem] items-center gap-2 text-xs">
        {isExtracting && <span className="text-ink-muted">Extracting text…</span>}
        {!isExtracting && sourceFilename && (
          <span className="text-ink-muted">Loaded from {sourceFilename}</span>
        )}
        {error && <span className="text-status-critical">{error}</span>}
        {!isExtracting && value && (
          <span className="ml-auto text-ink-muted">{value.trim().split(/\s+/).length} words</span>
        )}
      </div>
    </div>
  );
}
