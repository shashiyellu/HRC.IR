export interface MatchResult {
  filename: string;
  candidate_name: string;
  match_percentage: number;
  tier: "Excellent Match" | "Good Match" | "Partial Match" | "Weak Match";
  matched_skills: string[];
  missing_skills: string[];
  strengths: string[];
  concerns: string[];
  experience_fit: string;
  summary: string;
  error?: string | null;
}

export interface MatchResponse {
  results: MatchResult[];
}

export interface StagedResume {
  id: string;
  file: File;
}
