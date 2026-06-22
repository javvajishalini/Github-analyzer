@echo off
echo ===================================================
echo   Starting GitHub Analyzer Backend Server
echo ===================================================
echo.

rem Set the GitHub Token for API authentication to avoid rate limits
set GITHUB_TOKEN=YOUR_PERSONAL_ACCESS_TOKEN_HERE
echo [OK] GITHUB_TOKEN environment variable set.

rem Check if the built jar exists, if not build it
if not exist "backend\target\backend-1.0.0.jar" (
    echo [INFO] Backend JAR not found. Building with Maven...
    call run_maven_build.bat
)

echo [INFO] Starting Spring Boot application...
java -jar backend\target\backend-1.0.0.jar
