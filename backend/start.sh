#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "Resume Matcher - starting up..."
echo

if ! command -v python3 >/dev/null 2>&1; then
    echo "ERROR: Python was not found on this computer."
    echo
    echo "Please install Python 3.11 from https://www.python.org/downloads/"
    echo "After installing, run this script again."
    read -p "Press Enter to exit..."
    exit 1
fi

if [ ! -d venv ]; then
    echo "First-time setup: creating a private Python environment..."
    python3 -m venv venv
    echo "Installing required packages, this can take a minute..."
    venv/bin/python -m pip install --upgrade pip >/dev/null
    venv/bin/pip install -r requirements.txt
fi

if [ ! -f .env ]; then
    cp .env.example .env
fi

echo
echo "Starting the server..."
echo "Keep this window open while you use the app - closing it stops the app."
echo

(sleep 3 && (open http://localhost:8000 2>/dev/null || xdg-open http://localhost:8000 2>/dev/null)) &

venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
