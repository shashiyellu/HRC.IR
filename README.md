# Resume ↔ JD Matcher

Paste or upload a job description, drop in candidate resumes (PDF/DOCX/TXT), and
get an AI-scored, ranked shortlist with matched/missing skills, strengths,
concerns, and a recruiter-facing summary per candidate.

- **Backend:** FastAPI (Python) — parses resumes/JDs and scores each resume
  against the JD using the Claude API with structured JSON output.
- **Frontend:** React + Vite + TypeScript + Tailwind CSS.

## 1. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# then edit .env and set your ANTHROPIC_API_KEY
```

Run it:

```bash
uvicorn app.main:app --reload --port 8000
```

The API is now at `http://localhost:8000` (interactive docs at `/docs`).

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open the printed URL (typically `http://localhost:5173`). The dev server proxies
`/api/*` requests to the backend at `http://localhost:8000` (see
`vite.config.ts`), so both servers must be running.

## How it works

1. Paste the JD text directly, or drop a PDF/DOCX/TXT file — the backend
   extracts the text and fills the textbox.
2. Drag and drop any number of candidate resumes (PDF/DOCX/TXT).
3. Click **Analyze matches**. The backend extracts text from each resume and
   sends it, along with the JD, to Claude in parallel (`output_config.format`
   with a JSON schema guarantees structured, parseable output). Each resume
   gets:
   - a 0–100 match percentage
   - a tier (Excellent / Good / Partial / Weak Match)
   - matched vs. missing skills
   - strengths and concerns
   - an experience-level fit note and a short recruiter summary
4. Results are sorted by match percentage, highest first.

## Configuration

Backend `.env` (see `backend/.env.example`):

| Variable | Default | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | — | **Required.** Your Anthropic API key. |
| `CLAUDE_MODEL` | `claude-opus-4-8` | Model used for scoring. Swap to `claude-sonnet-5` for a faster/cheaper option if you're screening large batches. |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated list of allowed frontend origins. |

## Notes

- Scoring runs with up to 5 resumes in parallel per request (see
  `_MAX_CONCURRENCY` in `backend/app/matcher.py`) to keep large batches fast
  without hitting rate limits.
- Scanned/image-only PDFs with no embedded text will fail to parse — the UI
  surfaces this per-resume without failing the whole batch.
