@echo off
echo ========================================================
echo Starting AI Resume Analyzer FastAPI Backend Server...
echo ========================================================
cd /d "%~dp0backend"
"..\backend\.venv\Scripts\python.exe" -m uvicorn main:app --app-dir "app" --host 127.0.0.1 --port 8001 --reload
pause
