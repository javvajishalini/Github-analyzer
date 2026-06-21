Write-Host "Starting one-by-one Git commits..." -ForegroundColor Cyan

# 1. Commit backend pom.xml
if (Test-Path "backend/pom.xml") {
    git add backend/pom.xml
    git commit -m "feat(backend): configure Spring Boot pom.xml with Gson dependency"
}

# 2. Commit backend models
if (Test-Path "backend/src/main/java/com/githubanalyzer/backend/model") {
    git add backend/src/main/java/com/githubanalyzer/backend/model/*
    git commit -m "feat(backend): add UserProfile, Repository, and AnalysisResult models"
}

# 3. Commit backend service
if (Test-Path "backend/src/main/java/com/githubanalyzer/backend/service") {
    git add backend/src/main/java/com/githubanalyzer/backend/service/*
    git commit -m "feat(backend): add GitHubService for REST API calls and analytics"
}

# 4. Commit backend main & controller
if (Test-Path "backend/src/main/java/com/githubanalyzer/backend/BackendApplication.java") {
    git add backend/src/main/java/com/githubanalyzer/backend/BackendApplication.java
    git add backend/src/main/java/com/githubanalyzer/backend/controller/*
    git add backend/src/main/resources/application.properties
    git commit -m "feat(backend): add entrypoint, REST Controller, and properties"
}

# 5. Commit frontend config
if (Test-Path "frontend/package.json") {
    git add frontend/package.json frontend/index.html
    if (Test-Path "frontend/vite.config.js") { git add frontend/vite.config.js }
    if (Test-Path "frontend/vite.config.ts") { git add frontend/vite.config.ts }
    git commit -m "feat(frontend): configure Vite React project configuration files"
}

# 6. Commit frontend source code
if (Test-Path "frontend/src") {
    git add frontend/src/*
    git commit -m "feat(frontend): implement dashboard page, interactive tables, and custom SVG charts"
}

# 7. Commit docs and gitignore
git add README.md .gitignore
git commit -m "docs: update project README and root gitignore for mono-repo structure"

# 8. Push to GitHub
Write-Host "Pushing to remote repository..." -ForegroundColor Yellow
git push origin main

Write-Host "All commits pushed successfully!" -ForegroundColor Green
