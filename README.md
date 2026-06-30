# 📊 GitHub Analyzer

> A premium, full-stack developer analytics dashboard for GitHub profiles — built with **Spring Boot** and **React + Vite**.

GitHub Analyzer lets you sign in with your GitHub account and instantly explore deep insights about any public GitHub profile: repository breakdowns, language distributions, activity timelines, developer achievements, profile comparisons, and PDF report exports — all in one beautiful, glassmorphic dashboard.

---

## 🖼️ Screenshots

| Overview | Repositories |
|----------|-------------|
| ![Overview](screenshots/overview_page.png) | ![Repositories](screenshots/repositories_page.png) |

| Languages | Activity |
|-----------|----------|
| ![Languages](screenshots/languages_page.png) | ![Activity](screenshots/activity_page.png) |

| Search | Compare |
|--------|---------|
| ![Search](screenshots/search_page.png) | ![Compare](screenshots/compare_page.png) |

| Achievements | Export |
|-------------|--------|
| ![Achievements](screenshots/achievements_page.png) | ![Export](screenshots/export_page.png) |

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔒 **GitHub OAuth2 Login** | Secure, one-click sign in using GitHub OAuth — no passwords needed |
| 📊 **Developer Overview** | Profile stats, total repos/stars/forks, language pie chart, top repos, and smart recommendations |
| 🗂️ **Repository Browser** | Sortable, filterable, paginated grid of all public repositories |
| 🌐 **Language Analytics** | Breakdown of programming languages across all repositories with interactive charts |
| 📅 **Activity Timeline** | Visual commit history and GitHub event activity feed |
| 🔍 **Profile Search** | Search and instantly preview any public GitHub user's stats |
| ⚖️ **Profile Comparison** | Side-by-side comparison of two GitHub developer profiles |
| 🏆 **Achievements** | Gamified badge system (Bronze, Silver, Gold, Platinum) based on GitHub activity milestones |
| 📄 **PDF Export** | Download a beautifully-rendered developer summary report as a PDF |
| 🌓 **Dark / Light Mode** | Seamless theme toggle with glassmorphic design |

---

## ⚙️ How It Works (Architecture & Data Flow)

The application operates as a decoupled client-server system communicating over REST endpoints with Vite proxy forwarding.

```mermaid
sequenceDiagram
    participant User as Browser / Frontend (5173)
    participant Server as Spring Boot Backend (8080)
    participant GitHub as GitHub API
    
    User->>Server: Click "Sign in with GitHub" (/oauth2/authorization/github)
    Server->>GitHub: Redirect to GitHub Authorization Page
    GitHub-->>Server: Callback with Auth Code (/login/oauth2/code/github)
    Server-->>User: Redirect to Frontend success route (/login-success?username={login})
    Note over User: Saves username to localStorage
    
    User->>Server: Request Diagnostics /api/github/analytics/{username} (Proxied)
    Server->>GitHub: Fetch Profile stats (/users/{username})
    Server->>GitHub: Fetch Repositories list (/users/{username}/repos)
    Note over Server: Calculates total stars, avg forks,<br/>newest/oldest repo, & language counts
    Server-->>User: Returns serialized AnalysisResult JSON
    Note over User: Renders charts & interactive data tables
```

### 1. The OAuth2 Authentication Pipeline
1. The user visits the frontend at `http://localhost:5173/` and clicks **Continue with GitHub**.
2. The browser is directed to `http://localhost:8080/oauth2/authorization/github`, triggering Spring Security's OAuth2 workflow.
3. Upon authorization, GitHub redirects back to the backend callback (`/login/oauth2/code/github`) with an auth code.
4. The backend exchanges the code for an access token and the `OAuth2LoginSuccessHandler` redirects to: `http://localhost:5173/login-success?username={login}`.
5. The frontend saves the session to `localStorage` and routes to the Overview dashboard.

### 2. The Diagnostics & Analytics Engine
1. The frontend calls `/api/github/analytics/{username}` (proxied to the backend via Vite).
2. The backend's `GitHubService` fetches user metadata and paginates through all public repositories.
3. It computes: total stars, forks, language counts, oldest/newest repos, and top repos.
4. A `SuggestionService` generates rule-based profile improvement recommendations.
5. Results are returned as an `AnalysisResult` JSON payload.

### 3. Data Representation & Reporting
1. Language counts are rendered in a responsive `Recharts` SVG pie chart.
2. Repositories are displayed in a client-side sortable, filterable, paginated table.
3. The PDF export uses `html2canvas` + `jsPDF` to capture the dashboard and generate a downloadable report.

---

## 📂 Project Structure

```text
Github-analyzer/
├── backend/
│   ├── src/main/java/com/githubanalyzer/backend/
│   │   ├── config/          # Spring Security and OAuth2 configurations
│   │   ├── controller/      # REST API controllers (GitHub statistics)
│   │   ├── dto/             # API data transfer objects
│   │   ├── model/           # Diagnostic schemas
│   │   ├── service/         # GitHub API & suggestion logic
│   │   └── BackendApplication.java
│   └── pom.xml              # Maven dependencies & build config
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Sidebar, Header, Logo, DarkModeToggle
│   │   ├── pages/           # Overview, Repositories, Languages, Activity,
│   │   │                    # Search, Compare, Achievements, Export
│   │   ├── App.jsx          # Main Router, protected session guard & login
│   │   ├── App.css          # Theme variables & glassmorphic layouts
│   │   └── main.jsx         # App mounting point
│   ├── package.json
│   └── vite.config.js       # Vite config with local API proxy
│
├── screenshots/             # App screenshots for this README
├── start_backend.bat        # One-click backend launcher (Windows)
├── run_maven_build.bat      # Maven build helper script
└── set_token.bat            # Helper to create .env credentials file
```

---

## 🛠️ Prerequisites

Before running the application, make sure you have:

| Tool | Version | Download |
|------|---------|----------|
| Java JDK | 17 or newer | [adoptium.net](https://adoptium.net) |
| Node.js | 18.0.0 or newer | [nodejs.org](https://nodejs.org) |

---

## ⚙️ Configuration & Setup

### 1. Register GitHub OAuth App
To enable the **Continue with GitHub** login, register an OAuth application on GitHub:
1. Go to **Settings → Developer Settings → OAuth Apps → New OAuth App**
2. Fill in the fields:
   - **Application name:** `GitHub Analyzer`
   - **Homepage URL:** `http://localhost:5173`
   - **Authorization callback URL:** `http://localhost:8080/login/oauth2/code/github`
3. Click **Register application** and copy your **Client ID** and **Client Secret**

### 2. Configure Backend Credentials
Open `backend/src/main/resources/application.properties` and update:
```properties
spring.security.oauth2.client.registration.github.client-id=YOUR_CLIENT_ID
spring.security.oauth2.client.registration.github.client-secret=YOUR_CLIENT_SECRET
```

> **Tip:** You can also run `set_token.bat` to interactively create a `.env` file with your credentials instead.

---

## 🚀 How to Run

You need **two terminal windows** open simultaneously.

### Terminal 1 — Start the Backend (Port 8080)

Open a terminal in the **project root directory** and run:

```powershell
.\start_backend.bat
```

This script automatically:
- Frees port 8080 if it's already in use
- Loads credentials from `.env` if present
- Builds the Spring Boot JAR (first run only, using bundled Maven)
- Starts the server at `http://localhost:8080`

✅ Wait for this message: `Started BackendApplication in X.XXX seconds`

---

### Terminal 2 — Start the Frontend (Port 5173)

Open a second terminal, navigate to the `frontend` folder, and run:

```powershell
cd frontend
npm install     # Only needed on the first run
npm run dev
```

✅ Wait for: `Local: http://localhost:5173/`

---

### Open the App

Open your browser and navigate to:
```
http://localhost:5173
```

Click **"Continue with GitHub"** to sign in and start exploring your developer analytics! 🎉

---

## 💻 Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Java 17 | Core language |
| Spring Boot 3.2 | Web framework |
| Spring Security | Authentication & authorization |
| Spring OAuth2 Client | GitHub OAuth2 integration |
| Gson | JSON serialization |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 19 | UI framework |
| Vite 8 | Build tool & dev server with API proxy |
| React Router 7 | Client-side routing |
| Recharts 3 | Interactive SVG charts |
| jsPDF + html2canvas | PDF report generation |
| Vanilla CSS | Styling with CSS custom properties |

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## ✨ Features

*   **🔒 Secure GitHub Sign-In:** Authenticate seamlessly using GitHub OAuth2 protocols.
*   **💡 Smart Developer Suggestions:** Rule-based recommendation engine offering actionable profile, repository, and activity heuristics.
*   **📈 Visual Analytics:** Render language distributions (custom Recharts Pie charts) and repository metrics.
*   **🌱 Developer Milestones:** Easily view oldest, newest, and recently updated project metadata.
*   **📋 Interactive Repository Grid:** Filter, sort (by name, language, stars, and forks), and paginate repository listings.
*   **📄 PDF Report Export:** Save a beautifully-rendered developer summary report as a PDF using `jsPDF` and `html2canvas`.
*   **☀️ Dynamic Theme Swapper:** Toggle between a futuristic dark slate mode and a clean, high-contrast light mode.

---

## ⚙️ How It Works (Architecture & Data Flow)

The application operates as a decoupled client-server system communicating over REST endpoints with Vite proxy forwarding.

```mermaid
sequenceDiagram
    participant User as Browser / Frontend (5173)
    participant Server as Spring Boot Backend (8080)
    participant GitHub as GitHub API
    
    User->>Server: Click "Sign in with GitHub" (/oauth2/authorization/github)
    Server->>GitHub: Redirect to GitHub Authorization Page
    GitHub-->>Server: Callback with Auth Code (/login/oauth2/code/github)
    Server-->>User: Redirect to Frontend success route (/login-success?username={login})
    Note over User: Saves username to localStorage
    
    User->>Server: Request Diagnostics /api/github/analytics/{username} (Proxied)
    Server->>GitHub: Fetch Profile stats (/users/{username})
    Server->>GitHub: Fetch Repositories list (/users/{username}/repos)
    Note over Server: Calculates total stars, avg forks,<br/>newest/oldest repo, & language counts
    Server-->>User: Returns serialized AnalysisResult JSON
    Note over User: Renders charts & interactive data tables
```

### 1. The OAuth2 Authentication Pipeline
1. The user visits the frontend dashboard at `http://localhost:5173/` and clicks **Sign in with GitHub**.
2. The browser is directed to `http://localhost:8080/oauth2/authorization/github`, triggering Spring Security’s OAuth2 workflow.
3. Upon authorization on GitHub's secure page, GitHub redirects back to the backend callback (`/login/oauth2/code/github`) with an authorization code.
4. The backend exchanges the code for an access token, instantiates an authentication context, and handles success via the `OAuth2LoginSuccessHandler`.
5. The handler redirects the user back to the React app: `http://localhost:5173/login-success?username={login}`.
6. The frontend captures the username parameter, saves the active session context in `localStorage`, and routes the client to the Overview diagnostics view.

### 2. The Diagnostics & Analytics Engine
1. When loading statistics for a developer, the frontend calls the relative path `/api/github/analytics/{username}`.
2. The local Vite dev server proxies `/api` requests same-origin to the Spring Boot backend (`http://localhost:8080/api`), preventing CORS blockages.
3. The backend’s `GitHubService` performs asynchronous network calls to GitHub's REST API (`https://api.github.com/users/{username}`) to grab user metadata, and recursively paginates through `/users/{username}/repos` to fetch all public repositories.
4. The backend filters out fork details, sums up stargazers and forks counts, compares creation dates to determine oldest/newest projects, sorts repositories by stars to find top repositories, and maps programming language distribution counts.
5. A dedicated `SuggestionService` evaluates the data and generates rule-based recommendations for improving profile completeness, repository documentation, and activity engagement.
6. The computed metrics are packaged into an `AnalysisResult` data structure and returned as a JSON payload, while suggestions are fetched via a dedicated endpoint.

### 3. Data Representation & Reporting
1. The frontend parses the `AnalysisResult` and feeds the language count array to a responsive `Recharts` SVG pie chart.
2. Repositories are mapped into a client-side sorted, filtered, and paginated custom HTML table.
3. When the user selects **Export PDF Report**, the `html2canvas` parser grabs the DOM layout container, constructs a canvas image frame, and pushes it into a structured high-resolution vector PDF using `jsPDF` for downloads.

---

## 📂 Project Structure

```text
GitHub Analyzer/
├── backend/
│   ├── src/main/java/com/githubanalyzer/backend/
│   │   ├── config/          # Spring Security and OAuth2 configurations
│   │   ├── controller/      # REST API controllers (GitHub statistics)
│   │   ├── dto/             # API data transfer objects
│   │   ├── exception/       # Global HTTP exception handlers
│   │   ├── model/           # Diagnostic schemas
│   │   └── BackendApplication.java
│   └── pom.xml              # Maven dependencies & build configurations
│
└── frontend/
    ├── src/
    │   ├── components/      # Global Layout UI (Sidebar, Header, Theme Toggle)
    │   ├── pages/           # Pages (Overview, Repositories, Languages, Activity, Search)
    │   ├── App.jsx          # Main Router, protected session guard, & login screen
    │   ├── App.css          # Theme variables & glassmorphic layouts
    │   └── main.jsx         # App mounting point
    ├── package.json         # Node.js dependencies
    └── vite.config.js       # Vite configuration with local API proxy
```

---

## 🛠️ Prerequisites

Before running the application, make sure you have:
*   **Java Development Kit (JDK) 17** (or newer)
*   **Node.js** (v18.0.0 or newer)
*   An active internet connection (to retrieve diagnostic data from GitHub's REST API)

---

## ⚙️ Configuration & Setup

### 1. Register GitHub OAuth App
To enable the **Sign in with GitHub** functionality, register an OAuth application on GitHub:
1. Go to **Settings > Developer Settings > OAuth Apps > Register a new application**.
2. Set the **Homepage URL** to: `http://localhost:5173/`
3. Set the **Authorization callback URL** to: `http://localhost:8080/login/oauth2/code/github`
4. Copy the generated **Client ID** and **Client Secret**.

### 2. Configure Backend Credentials
Open [backend/src/main/resources/application.properties](file:///c:/Users/Shalini/OneDrive/Desktop/GitHub%20Analyzer/backend/src/main/resources/application.properties) and update the credentials:
```properties
spring.security.oauth2.client.registration.github.client-id=YOUR_CLIENT_ID
spring.security.oauth2.client.registration.github.client-secret=YOUR_CLIENT_SECRET
```

---

## 🚀 How to Run

To run the application locally, you must keep **two terminal windows** open:

### Step 1: Start the Backend (Port 8080)
Open a terminal in the root directory and build/launch the Spring Boot service:
```powershell
# Build the JAR package
.\run_maven_build.bat

# Start the server
java -jar backend/target/backend-1.0.0.jar
```
*Verify that the log shows `Started BackendApplication in X.XXX seconds` on port `8080`.*

### Step 2: Start the Frontend (Port 5173)
Open a second terminal, navigate into the `frontend` folder, and launch Vite:
```powershell
cd frontend
npm install
npm run dev
```
*Open `http://localhost:5173` in your browser to launch the dashboard.*

---

## 💻 Tech Stack
*   **Backend:** Java 17, Spring Boot, Spring Security (OAuth2 Client), Gson
*   **Frontend:** React 19, Vite, React Router 7, Recharts 3, jsPDF, html2canvas
*   **Theme Engine:** Vanilla CSS custom variables (supporting seamless dark/light modes)
