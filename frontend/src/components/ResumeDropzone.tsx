import { useRef, useState } from "react";
import type { StagedResume } from "../types";

interface Props {
  resumes: StagedResume[];
  onChange: (resumes: StagedResume[]) => void;
  hideHeading?: boolean;
}

function idFor(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export default function ResumeDropzone({ resumes, onChange, hideHeading }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList);
    const existingIds = new Set(resumes.map((r) => r.id));
    const added: StagedResume[] = incoming
      .filter((f) => !existingIds.has(idFor(f)))
      .map((f) => ({ id: idFor(f), file: f }));
    onChange([...resumes, ...added]);
  }

  function removeResume(id: string) {
    onChange(resumes.filter((r) => r.id !== id));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        {!hideHeading && (
          <h2 className="text-sm font-semibold text-ink-primary-light dark:text-ink-primary-dark">
            Candidate resumes
          </h2>
        )}
        {resumes.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="ml-auto text-xs font-medium text-ink-muted transition hover:text-status-critical"
          >
            Clear all
          </button>
        )}
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
          if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-4 py-8 text-center transition ${
          isDragging
            ? "border-brand bg-brand/5"
            : "border-hairline-light bg-page-light/60 hover:border-brand/60 dark:border-hairline-dark dark:bg-page-dark/40"
        }`}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="mb-1 text-ink-muted"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16V4m0 0L7 9m5-5l5 5M5 16v2a2 2 0 002 2h10a2 2 0 002-2v-2"
          />
        </svg>
        <span className="text-sm font-medium text-ink-primary-light dark:text-ink-primary-dark">
          Drop resumes here, or click to browse
        </span>
        <span className="text-xs text-ink-muted">PDF, DOCX, or TXT — upload as many as you like</span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.md"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {resumes.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {resumes.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-hairline-light bg-surface-light px-3 py-2 text-sm dark:border-hairline-dark dark:bg-surface-dark"
            >
              <span className="truncate text-ink-primary-light dark:text-ink-primary-dark">{r.file.name}</span>
              <button
                type="button"
                onClick={() => removeResume(r.id)}
                aria-label={`Remove ${r.file.name}`}
                className="shrink-0 text-ink-muted transition hover:text-status-critical"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
