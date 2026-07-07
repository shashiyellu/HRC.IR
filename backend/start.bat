@echo off
setlocal
cd /d "%~dp0"

echo Resume Matcher - starting up...
echo.

where python >nul 2>nul
if errorlevel 1 (
    echo ERROR: Python was not found on this computer.
    echo.
    echo Please install Python 3.11 from https://www.python.org/downloads/
    echo IMPORTANT: on the first install screen, check the box that says
    echo "Add python.exe to PATH" before clicking Install.
    echo.
    echo After installing Python, double-click this file again.
    pause
    exit /b 1
)

if not exist venv (
    echo First-time setup: creating a private Python environment...
    python -m venv venv
    echo Installing required packages, this can take a minute...
    venv\Scripts\python -m pip install --upgrade pip >nul
    venv\Scripts\pip install -r requirements.txt
)

if not exist .env (
    copy .env.example .env >nul
)

echo.
echo Starting the server in a separate window named "Resume Matcher Server".
echo Keep that window open while you use the app - closing it stops the app.
echo.

start "Resume Matcher Server" /min cmd /c "venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

echo Waiting for the server to be ready...
timeout /t 4 /nobreak >nul

start "" http://localhost:8000

echo.
echo Done. The app should now be open in your browser at http://localhost:8000
echo If it shows an error, wait a few seconds and refresh the page.
echo You can close THIS window now - just keep "Resume Matcher Server" open.
pause
