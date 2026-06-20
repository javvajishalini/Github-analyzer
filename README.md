# GitHub User Analyzer

An advanced, real-time full-stack web application designed to fetch, analyze, and display a user's public profile and repository statistics from the GitHub REST API.

## Tech Stack

- **Frontend**: React (Vite, custom SVG charts for language & stars analytics, and interactive tables).
- **Backend**: Spring Boot, Java 17, Maven (standard `HttpClient` for API requests, `Gson` for JSON parsing).
- **API**: GitHub REST API.

---

## Directory Structure

```
├── backend/
│   ├── src/main/java/com/githubanalyzer/backend/
│   │   ├── BackendApplication.java
│   │   ├── controller/
│   │   │   └── AnalyzerController.java
│   │   ├── model/
│   │   │   ├── UserProfile.java
│   │   │   ├── Repository.java
│   │   │   └── AnalysisResult.java
│   │   └── service/
│   │       └── GitHubService.java
│   ├── src/main/resources/application.properties
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Features

1. **User Profile Section**:
   - Avatar picture, Username, Name, Bio, Location, Followers, Following, Public Repos, and Account Creation Date.
2. **Repository Analytics**:
   - Total repositories, total stars, total forks, average stars, and average forks.
3. **Most Starred Repository**:
   - Detail card including description, stars, forks, and programming language.
4. **Visual Analytics Charts**:
   - **Language Distribution**: Custom SVG Donut Chart showing usage percentages.
   - **Stars Analytics**: Horizontal relative bar chart of the top 5 starred repositories.
   - **Repository Distribution**: Graphical ratio of original vs. forked repositories.
5. **Repository Activity**:
   - Spotlights the newest repository, oldest repository, and recently updated repository.
6. **All Repositories Table**:
   - Complete grid showing name, language, stars, forks, and dates, with real-time text filter and sortable headers.
7. **Search History**:
   - Remembers the last 8 searched users in LocalStorage.

---

## Running the Application

### 1. Backend (Spring Boot)
Open a terminal in the `backend/` directory:
```bash
mvn spring-boot:run
```
The REST API will run on `http://localhost:8080/api/analyze?username={username}`.

### 2. Frontend (React)
Open a terminal in the `frontend/` directory:
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start Vite development server:
   ```bash
   npm run dev
   ```
Open the browser at the URL shown in your console (usually `http://localhost:5173`).

---

## Git Commit Walkthrough

To commit the new full-stack codebase structure to your repository one-by-one, run the following commands in your command prompt / terminal:

```bash
# 1. Add and commit backend Maven config
git add backend/pom.xml
git commit -m "feat(backend): configure Spring Boot pom.xml with Gson dependency"

# 2. Add and commit backend models
git add backend/src/main/java/com/githubanalyzer/backend/model/
git commit -m "feat(backend): add UserProfile, Repository, and AnalysisResult models"

# 3. Add and commit backend service
git add backend/src/main/java/com/githubanalyzer/backend/service/
git commit -m "feat(backend): add GitHubService for REST API calls and analytics"

# 4. Add and commit backend entrypoint & controller
git add backend/src/main/java/com/githubanalyzer/backend/BackendApplication.java backend/src/main/java/com/githubanalyzer/backend/controller/ backend/src/main/resources/
git commit -m "feat(backend): add main entrypoint, REST Controller, and properties"

# 5. Add and commit frontend configuration
git add frontend/package.json frontend/index.html frontend/vite.config.js
git commit -m "feat(frontend): configure Vite React project metadata and settings"

# 6. Add and commit frontend sources
git add frontend/src/
git commit -m "feat(frontend): implement dashboard page, interactive tables, and custom SVG charts"

# 7. Add and commit updated project documentation
git add README.md .gitignore
git commit -m "docs: update project README and root gitignore for mono-repo structure"

# 8. Push to your GitHub repository
git push origin main
```
