import base64
import secrets
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles

from . import config
from .matcher import score_resumes
from .parser import extract_text
from .schemas import ExtractTextResponse, MatchResponse, MatchResult

app = FastAPI(title="Resume Matcher API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def require_password(request: Request, call_next):
    # Only enforced when APP_PASSWORD is set (e.g. on a hosted deployment).
    # Local/offline use (no APP_PASSWORD configured) skips this entirely.
    if not config.APP_PASSWORD:
        return await call_next(request)

    auth = request.headers.get("authorization")
    if auth and auth.startswith("Basic "):
        try:
            decoded = base64.b64decode(auth[len("Basic "):]).decode("utf-8")
            username, _, password = decoded.partition(":")
        except Exception:
            username, password = "", ""

        valid = secrets.compare_digest(username, config.APP_USERNAME) and secrets.compare_digest(
            password, config.APP_PASSWORD
        )
        if valid:
            return await call_next(request)

    return Response(
        status_code=401,
        headers={"WWW-Authenticate": 'Basic realm="Resume Matcher"'},
        content="Authentication required.",
    )


@app.get("/api/health")
async def health():
    return {"status": "ok", "model": config.CLAUDE_MODEL, "api_key_configured": bool(config.ANTHROPIC_API_KEY)}


@app.post("/api/extract-text", response_model=ExtractTextResponse)
async def extract_text_endpoint(file: UploadFile = File(...)):
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail=f"'{file.filename}' is empty.")
    text = extract_text(file.filename, content)
    return ExtractTextResponse(filename=file.filename, text=text)


@app.post("/api/match", response_model=MatchResponse)
async def match_endpoint(
    jd_text: str = Form(...),
    files: list[UploadFile] = File(...),
):
    if not jd_text.strip():
        raise HTTPException(status_code=400, detail="Job description text is empty.")
    if not files:
        raise HTTPException(status_code=400, detail="Upload at least one resume.")
    if not config.ANTHROPIC_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="ANTHROPIC_API_KEY is not configured on the server. Set it in backend/.env.",
        )

    resumes: list[tuple[str, str]] = []
    for f in files:
        content = await f.read()
        if not content:
            continue
        try:
            text = extract_text(f.filename, content)
        except HTTPException as exc:
            resumes.append((f.filename, f"__PARSE_ERROR__:{exc.detail}"))
            continue
        resumes.append((f.filename, text))

    # Separate resumes that failed to parse so we don't send garbage to the model
    parse_errors = {fn: txt[len("__PARSE_ERROR__:"):] for fn, txt in resumes if txt.startswith("__PARSE_ERROR__:")}
    scoreable = [(fn, txt) for fn, txt in resumes if not txt.startswith("__PARSE_ERROR__:")]

    raw_results = await score_resumes(jd_text, scoreable) if scoreable else []

    results = [MatchResult(**r) for r in raw_results]
    for filename, error in parse_errors.items():
        results.append(
            MatchResult(
                filename=filename,
                candidate_name=filename,
                match_percentage=0,
                tier="Weak Match",
                matched_skills=[],
                missing_skills=[],
                strengths=[],
                concerns=[],
                experience_fit="",
                summary="",
                error=error,
            )
        )

    results.sort(key=lambda r: r.match_percentage, reverse=True)
    return MatchResponse(results=results)


# Serve the pre-built frontend (frontend/dist copied here as static/) so the
# whole app runs from a single server: `uvicorn app.main:app` + open one URL.
# Falls back to API-only mode if the build hasn't been copied in (dev mode,
# where the Vite dev server handles the frontend instead).
_static_dir = Path(__file__).resolve().parent.parent / "static"
if _static_dir.is_dir():
    app.mount("/", StaticFiles(directory=str(_static_dir), html=True), name="static")
# 