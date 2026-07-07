from typing import List, Optional

from pydantic import BaseModel


class ExtractTextResponse(BaseModel):
    filename: str
    text: str


class MatchResult(BaseModel):
    filename: str
    candidate_name: str
    match_percentage: int
    tier: str
    matched_skills: List[str]
    missing_skills: List[str]
    strengths: List[str]
    concerns: List[str]
    experience_fit: str
    summary: str
    error: Optional[str] = None


class MatchResponse(BaseModel):
    results: List[MatchResult]
