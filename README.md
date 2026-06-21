# 📊 GitHub User Analyzer

A premium, full-stack diagnostics and analytics dashboard for GitHub profiles. Built with a high-performance **Spring Boot** API gateway and a responsive, glassmorphic **React + Vite** single-page routed frontend.

---

## ✨ Features

*   **🔒 Secure GitHub Sign-In:** Authenticate seamlessly using GitHub OAuth2.
*   **📈 Visual Analytics:** Render language distributions (Recharts Pie charts) and repository statistics.
*   **🌱 Developer Milestones:** Easily view oldest, newest, and recently updated project metadata.
*   **📋 Interactive Repository Grid:** Filter, sort (by name, language, stars, and forks), and paginate repository listings.
*   **📄 PDF Report Export:** Save a beautifully-rendered developer summary report as a PDF using `jsPDF` and `html2canvas`.
*   **☀️ Dynamic Theme Swapper:** Toggle between a futuristic dark slate mode and a clean, high-contrast light mode.

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
