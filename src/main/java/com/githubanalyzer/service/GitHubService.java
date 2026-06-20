package com.githubanalyzer.service;

import com.githubanalyzer.model.Repository;
import com.githubanalyzer.model.UserProfile;
import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.lang.reflect.Type;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * Service to interact with the GitHub REST API.
 * Uses Java HttpClient for requests and Gson for JSON parsing.
 */
public class GitHubService {
    private static final String BASE_URL = "https://api.github.com";
    private final HttpClient httpClient;
    private final Gson gson;

    public GitHubService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.gson = new Gson();
    }

    /**
     * Fetches user profile information from GitHub.
     *
     * @param username The GitHub username to search for.
     * @return UserProfile containing user details.
     * @throws IOException          If a network/communication error occurs.
     * @throws InterruptedException If the request is interrupted.
     * @throws IllegalArgumentException If the username is invalid or user is not found.
     */
    public UserProfile fetchUserProfile(String username) throws IOException, InterruptedException {
        String url = BASE_URL + "/users/" + encodeValue(username);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("User-Agent", "Java-GitHub-User-Analyzer")
                .header("Accept", "application/vnd.github+json")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 404) {
            throw new IllegalArgumentException("GitHub user '" + username + "' not found (404).");
        } else if (response.statusCode() == 403) {
            throw new IOException("API rate limit exceeded or forbidden access (403).");
        } else if (response.statusCode() != 200) {
            throw new IOException("Failed to fetch user profile. HTTP Status: " + response.statusCode());
        }

        try {
            return gson.fromJson(response.body(), UserProfile.class);
        } catch (JsonSyntaxException e) {
            throw new IOException("Failed to parse user profile JSON response.", e);
        }
    }

    /**
     * Fetches all public repositories of a user.
     * Handles pagination iteratively.
     *
     * @param username The GitHub username.
     * @return List of Repository objects.
     * @throws IOException          If a network/communication error occurs.
     * @throws InterruptedException If the request is interrupted.
     */
    public List<Repository> fetchRepositories(String username) throws IOException, InterruptedException {
        List<Repository> allRepos = new ArrayList<>();
        int page = 1;
        int perPage = 100;
        boolean hasMore = true;

        while (hasMore) {
            String url = BASE_URL + "/users/" + encodeValue(username) + "/repos?per_page=" + perPage + "&page=" + page;
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", "Java-GitHub-User-Analyzer")
                    .header("Accept", "application/vnd.github+json")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 404) {
                throw new IllegalArgumentException("GitHub user '" + username + "' not found while fetching repositories.");
            } else if (response.statusCode() == 403) {
                throw new IOException("API rate limit exceeded or forbidden access (403).");
            } else if (response.statusCode() != 200) {
                throw new IOException("Failed to fetch repositories. HTTP Status: " + response.statusCode());
            }

            Type listType = new TypeToken<List<Repository>>() {}.getType();
            List<Repository> pageRepos;
            try {
                pageRepos = gson.fromJson(response.body(), listType);
            } catch (JsonSyntaxException e) {
                throw new IOException("Failed to parse repositories JSON response.", e);
            }

            if (pageRepos == null || pageRepos.isEmpty()) {
                hasMore = false;
            } else {
                allRepos.addAll(pageRepos);
                if (pageRepos.size() < perPage) {
                    hasMore = false;
                } else {
                    page++;
                }
            }
        }

        return allRepos;
    }

    private String encodeValue(String value) {
        // Basic URL encoding for spaces and special characters
        return value.replace(" ", "%20");
    }
}
