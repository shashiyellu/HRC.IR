import type { MatchResponse } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function parseErrorDetail(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    return body?.detail ?? fallback;
  } catch {
    return fallback;
  }
}

export async function extractTextFromFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE}/extract-text`, { method: "POST", body: form });
  if (!res.ok) {
    throw new Error(await parseErrorDetail(res, `Failed to read "${file.name}"`));
  }
  const data = await res.json();
  return data.text as string;
}

export async function matchResumes(jdText: string, files: File[]): Promise<MatchResponse> {
  const form = new FormData();
  form.append("jd_text", jdText);
  for (const file of files) {
    form.append("files", file);
  }

  const res = await fetch(`${API_BASE}/match`, { method: "POST", body: form });
  if (!res.ok) {
    throw new Error(await parseErrorDetail(res, "Failed to analyze resumes"));
  }
  return (await res.json()) as MatchResponse;
}

export async function checkHealth(): Promise<{ status: string; api_key_configured: boolean; model: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Backend not reachable");
  return res.json();
}
