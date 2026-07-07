import asyncio
import json

from google import genai
from google.genai import types

from . import config

_client = genai.Client(api_key=config.GEMINI_API_KEY)

_MAX_CONCURRENCY = 3

_RESULT_SCHEMA = {
    "type": "object",
    "properties": {
        "candidate_name": {
            "type": "string",
            "description": "The candidate's full name as it appears on the resume. If not findable, use the filename without extension.",
        },
        "match_percentage": {
            "type": "integer",
            "description": "Overall match score from 0 to 100, weighing required skills, experience level, and domain relevance.",
        },
        "tier": {
            "type": "string",
            "enum": ["Excellent Match", "Good Match", "Partial Match", "Weak Match"],
        },
        "matched_skills": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Key skills/requirements from the JD that this resume clearly demonstrates.",
        },
        "missing_skills": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Key skills/requirements from the JD that are absent or unclear in this resume.",
        },
        "strengths": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Notable strengths of this candidate relative to the role, beyond simple keyword matches.",
        },
        "concerns": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Gaps, risks, or red flags relative to the role (e.g. seniority mismatch, employment gaps, no domain experience).",
        },
        "experience_fit": {
            "type": "string",
            "description": "One sentence on whether years of experience and seniority level fit the JD's requirements.",
        },
        "summary": {
            "type": "string",
            "description": "A 2-3 sentence recruiter-facing summary explaining the overall recommendation.",
        },
    },
    "required": [
        "candidate_name",
        "match_percentage",
        "tier",
        "matched_skills",
        "missing_skills",
        "strengths",
        "concerns",
        "experience_fit",
        "summary",
    ],
}

_SYSTEM_PROMPT = """You are an expert technical recruiter with deep experience screening resumes against job descriptions across many industries.

Given a job description and a single candidate resume, evaluate how well the candidate matches the role. Be rigorous and honest — do not inflate scores. Consider:
- Required vs. nice-to-have skills and whether they are genuinely demonstrated (not just keyword-present)
- Years of experience and seniority level relative to what the role requires
- Domain/industry relevance
- Career trajectory and stability
- Any explicit disqualifiers stated in the JD (e.g. required certifications, location, clearance)

Score conservatively: reserve 85-100 for candidates who are a strong, near-complete match; 65-84 for solid candidates with some gaps; 40-64 for partial matches with real gaps in required areas; below 40 for candidates who do not fit the role."""


def _build_user_prompt(jd_text: str, resume_text: str) -> str:
    return f"""<job_description>
{jd_text}
</job_description>

<candidate_resume>
{resume_text}
</candidate_resume>

Evaluate this candidate's resume against the job description above."""


async def score_resume(jd_text: str, resume_text: str) -> dict:
    response = await _client.aio.models.generate_content(
        model=config.GEMINI_MODEL,
        contents=_build_user_prompt(jd_text, resume_text),
        config=types.GenerateContentConfig(
            system_instruction=_SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_json_schema=_RESULT_SCHEMA,
        ),
    )

    if not response.text:
        raise ValueError("Model returned no text content (possible safety block)")

    return json.loads(response.text)


async def score_resumes(jd_text: str, resumes: list[tuple[str, str]]) -> list[dict]:
    """resumes: list of (filename, resume_text). Returns list of result dicts, same order."""
    semaphore = asyncio.Semaphore(_MAX_CONCURRENCY)

    async def _run(filename: str, resume_text: str) -> dict:
        async with semaphore:
            try:
                result = await score_resume(jd_text, resume_text)
                result["filename"] = filename
                result["error"] = None
                return result
            except Exception as exc:  # noqa: BLE001 - surface per-resume failures without aborting the batch
                return {
                    "filename": filename,
                    "candidate_name": filename,
                    "match_percentage": 0,
                    "tier": "Weak Match",
                    "matched_skills": [],
                    "missing_skills": [],
                    "strengths": [],
                    "concerns": [],
                    "experience_fit": "",
                    "summary": "",
                    "error": f"Failed to analyze this resume: {exc}",
                }

    return await asyncio.gather(*(_run(filename, text) for filename, text in resumes))
