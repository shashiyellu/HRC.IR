import os

from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")

APP_USERNAME = os.environ.get("APP_USERNAME", "hr")
APP_PASSWORD = os.environ.get("APP_PASSWORD")
