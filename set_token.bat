@echo off
echo ===================================================
echo   GitHub Analyzer - Secure Token Setup
echo ===================================================
echo.
echo This script saves your GitHub Personal Access Token
echo to a local .env file that is NEVER pushed to GitHub.
echo.
set /p TOKEN=Paste your GitHub Personal Access Token here: 
echo GITHUB_TOKEN=%TOKEN%> .env
echo.
echo [OK] Token saved to .env file (gitignored, safe from GitHub push protection).
echo      Run start_backend.bat to start the server.
echo.
pause
