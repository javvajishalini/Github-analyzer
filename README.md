# GitHub Analyzer

A full‑stack application that analyzes GitHub user data.

## Project Structure

```
backend/
├─ src/main/java/com/githubanalyzer/backend/
│  ├─ controller/   # REST controllers (e.g., AnalyzerController)
│  ├─ service/       # Business logic and GitHub API calls
│  ├─ dto/           # Data transfer objects
│  ├─ model/         # Domain models
│  ├─ exception/     # Global exception handling
│  └─ config/        # Spring configuration (WebConfig, SecurityConfig)
│  └─ BackendApplication.java

frontend/
├─ src/
│  ├─ components/   # Reusable UI components
│  ├─ pages/        # Page level components (Dashboard, Search, etc.)
│  ├─ services/     # API call helpers
│  ├─ hooks/        # Custom React hooks
│  ├─ utils/        # Utility functions
│  └─ charts/       # Recharts visualizations
│
├─ pom.xml            # Maven build for backend
├─ package.json       # Node dependencies for frontend
└─ README.md          # Project overview (this file)
```

The backend is a Spring Boot application exposing REST endpoints under `/api`. The frontend is a React app using **Recharts** for visualizations.

## How to Run

1. **Backend**
   ```bash
   cd "C:/Users/Shalini/OneDrive/Desktop/GitHub Analyzer"
   ./apache-maven-3.9.9/bin/mvn.cmd -f backend/pom.xml clean package -DskipTests
   java -jar backend/target/backend-1.0.0.jar
   ```
2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---
*This README was added as part of the initial project setup (Feature 1).*
