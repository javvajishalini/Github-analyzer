# GitHub User Analyzer

A professional, interactive Java console application that fetches, displays, and analyzes a GitHub user's profile and public repositories using the GitHub REST API.

## Features

- **Profile Retrieval**: Fetch and display key details of any GitHub user profile:
  - Username
  - Full Name
  - Bio
  - Followers & Following counts
  - Public Repository count
  - Account Creation Date
- **Repository Analysis**: Aggregates all public repositories (handling pagination automatically) and provides analytics:
  - Total public repositories fetched
  - Total stars received across all repositories
  - Most starred repository details
  - Repository with the highest forks count
  - Top 5 most used programming languages (sorted by repository frequency count)
- **Robust Exception Handling**: Clean error handling for invalid/non-existent usernames (404), API rate limits (403), and network connectivity issues.
- **Clean Output Formatting**: Structured, aligned console tables for easy viewing.

## Technologies Used

- **Java 17**: Leverages modern Java features and the built-in HTTP Client (`java.net.http.HttpClient`).
- **Google Gson (2.10.1)**: Used to parse the JSON responses from GitHub API.
- **Maven**: Dependency management and build tool.

## Directory Structure

```
├── src
│   └── main
│       └── java
│           └── com
│               └── githubanalyzer
│                   ├── Main.java
│                   ├── analyzer
│                   │   └── Analyzer.java
│                   ├── model
│                   │   ├── Repository.java
│                   │   └── UserProfile.java
│                   └── service
│                       └── GitHubService.java
├── pom.xml
└── README.md
```

## Installation Steps

1. **Prerequisites**: Ensure you have Java 17 (or later) and Maven installed.
2. **Clone / Navigate**: Open a terminal in the project directory:
   ```bash
   cd "c:\Users\Shalini\OneDrive\Desktop\GitHub Analyzer"
   ```
3. **Build the Project**:
   ```bash
   mvn clean package
   ```

## Usage Instructions

To run the application from the command line:

```bash
mvn compile exec:java -Dexec.mainClass="com.githubanalyzer.Main"
```

Once running, enter a GitHub username when prompted, or type `exit` to close the application.

## Sample Output

```
====================================================
          WELCOME TO GITHUB USER ANALYZER           
====================================================

Enter a GitHub username (or type 'exit' to quit): octocat

Fetching data from GitHub API... Please wait...

====================================================
                GITHUB USER PROFILE                 
====================================================
Username             : octocat
Full Name            : The Octocat
Bio                  : N/A
Followers            : 16500
Following            : 9
Public Repositories  : 8
Created At           : 2011-01-25T18:44:36Z
====================================================

====================================================
               REPOSITORY ANALYTICS                 
====================================================
Total Repositories Fetched : 8
Total Stars Received       : 1200
Most Starred Repo          : Spoon-Knife (800 stars)
Highest Forked Repo        : Spoon-Knife (300 forks)
----------------------------------------------------
Most Used Programming Languages (by repo count):
  - HTML            : 3 repo(s)
  - CSS             : 2 repo(s)
  - Ruby            : 1 repo(s)
====================================================

Enter a GitHub username (or type 'exit' to quit): exit

Thank you for using GitHub User Analyzer. Goodbye!
```
