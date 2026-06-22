@echo off
echo ===================================================
echo   GitHub Analyzer Backend - Smart Start
echo ===================================================
echo.

rem ── Step 1: Free port 8080 if already in use ──────────────────────────────
echo [INFO] Checking if port 8080 is already in use...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"
echo [OK]  Port 8080 is now free.
echo.

rem ── Step 2: Load all secrets from .env file ───────────────────────────────
if exist .env (
    for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
        if "%%a"=="GITHUB_TOKEN"         set "GITHUB_TOKEN=%%b"
        if "%%a"=="GITHUB_CLIENT_ID"     set "GITHUB_CLIENT_ID=%%b"
        if "%%a"=="GITHUB_CLIENT_SECRET" set "GITHUB_CLIENT_SECRET=%%b"
    )
    echo [OK]  Secrets loaded from .env file.
) else (
    echo [WARN] No .env file found. Run set_token.bat to create it.
    echo        OAuth login and API calls may not work.
)
echo.

rem ── Step 3: Build if JAR is missing ───────────────────────────────────────
if not exist "backend\target\backend-1.0.0.jar" (
    echo [INFO] Backend JAR not found. Building now...
    call run_maven_build.bat
    echo.
)

rem ── Step 4: Launch Spring Boot ────────────────────────────────────────────
echo [INFO] Starting Spring Boot on http://localhost:8080 ...
echo ===================================================
java -jar backend\target\backend-1.0.0.jar
