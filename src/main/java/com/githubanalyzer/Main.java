package com.githubanalyzer;

import com.githubanalyzer.analyzer.Analyzer;
import com.githubanalyzer.model.Repository;
import com.githubanalyzer.model.UserProfile;
import com.githubanalyzer.service.GitHubService;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Scanner;

/**
 * Entry point for the GitHub User Analyzer console application.
 */
public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        GitHubService gitHubService = new GitHubService();

        System.out.println("====================================================");
        System.out.println("          WELCOME TO GITHUB USER ANALYZER           ");
        System.out.println("====================================================");

        while (true) {
            System.out.print("\nEnter a GitHub username (or type 'exit' to quit): ");
            String username = scanner.nextLine().trim();

            if (username.equalsIgnoreCase("exit")) {
                System.out.println("\nThank you for using GitHub User Analyzer. Goodbye!");
                break;
            }

            if (username.isEmpty()) {
                System.out.println("[Error] Username cannot be empty. Please try again.");
                continue;
            }

            System.out.println("\nFetching data from GitHub API... Please wait...");

            try {
                // 1. Fetch user profile
                UserProfile profile = gitHubService.fetchUserProfile(username);

                // 2. Fetch user repositories
                List<Repository> repositories = gitHubService.fetchRepositories(username);

                // 3. Print Profile Information
                printProfile(profile);

                // 4. Run analysis and print Repository Statistics
                Analyzer analyzer = new Analyzer(repositories);
                printAnalysis(analyzer);

            } catch (IllegalArgumentException e) {
                System.err.println("\n[Error] " + e.getMessage());
            } catch (IOException e) {
                System.err.println("\n[Network/API Error] " + e.getMessage());
                System.err.println("Please check your internet connection or try again later.");
            } catch (InterruptedException e) {
                System.err.println("\n[Error] Request was interrupted.");
                Thread.currentThread().interrupt();
            } catch (Exception e) {
                System.err.println("\n[Unexpected Error] An unexpected error occurred: " + e.getMessage());
                e.printStackTrace();
            }
        }
        scanner.close();
    }

    /**
     * Prints user profile information in a clean, formatted block.
     */
    private static void printProfile(UserProfile profile) {
        System.out.println("\n====================================================");
        System.out.println("                GITHUB USER PROFILE                 ");
        System.out.println("====================================================");
        System.out.printf("%-20s : %s\n", "Username", profile.getUsername());
        System.out.printf("%-20s : %s\n", "Full Name", profile.getName());
        System.out.printf("%-20s : %s\n", "Bio", profile.getBio().replace("\n", " "));
        System.out.printf("%-20s : %d\n", "Followers", profile.getFollowers());
        System.out.printf("%-20s : %d\n", "Following", profile.getFollowing());
        System.out.printf("%-20s : %d\n", "Public Repositories", profile.getPublicRepos());
        System.out.printf("%-20s : %s\n", "Created At", profile.getCreatedAt());
        System.out.println("====================================================");
    }

    /**
     * Prints the repository analytics report.
     */
    private static void printAnalysis(Analyzer analyzer) {
        System.out.println("\n====================================================");
        System.out.println("               REPOSITORY ANALYTICS                 ");
        System.out.println("====================================================");
        System.out.printf("%-25s : %d\n", "Total Repositories Fetched", analyzer.getTotalRepositories());
        System.out.printf("%-25s : %d\n", "Total Stars Received", analyzer.getTotalStars());

        Repository mostStarred = analyzer.getMostStarredRepository();
        if (mostStarred != null) {
            System.out.printf("%-25s : %s (%d stars)\n", "Most Starred Repo", mostStarred.getName(), mostStarred.getStars());
        } else {
            System.out.printf("%-25s : N/A\n", "Most Starred Repo");
        }

        Repository highestForks = analyzer.getHighestForkedRepository();
        if (highestForks != null) {
            System.out.printf("%-25s : %s (%d forks)\n", "Highest Forked Repo", highestForks.getName(), highestForks.getForks());
        } else {
            System.out.printf("%-25s : N/A\n", "Highest Forked Repo");
        }

        System.out.println("----------------------------------------------------");
        System.out.println("Most Used Programming Languages (by repo count):");
        List<Map.Entry<String, Long>> topLanguages = analyzer.getMostUsedLanguages();
        if (topLanguages.isEmpty()) {
            System.out.println("  N/A");
        } else {
            // Display top 5 most used languages
            int count = 0;
            for (Map.Entry<String, Long> entry : topLanguages) {
                if (count >= 5) break;
                System.out.printf("  - %-15s : %d repo(s)\n", entry.getKey(), entry.getValue());
                count++;
            }
        }
        System.out.println("====================================================");
    }
}
