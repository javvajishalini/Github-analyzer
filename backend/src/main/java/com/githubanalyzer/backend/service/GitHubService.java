package com.githubanalyzer.backend.service;

import com.githubanalyzer.backend.model.AnalysisResult;
import com.githubanalyzer.backend.model.Repository;
import com.githubanalyzer.backend.model.UserProfile;
import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.lang.reflect.Type;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
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
     * Performs API calls and calculates analytics.
     */
    public AnalysisResult analyzeUser(String username) throws IOException, InterruptedException {
        UserProfile profile = fetchUserProfile(username);
        List<Repository> repositories = fetchRepositories(username);

        AnalysisResult result = new AnalysisResult();
        result.setProfile(profile);
        result.setRepositories(repositories);

        int totalRepos = repositories.size();
        result.setTotalRepos(totalRepos);

        int totalStars = repositories.stream().mapToInt(Repository::getStars).sum();
        result.setTotalStars(totalStars);

        int totalForks = repositories.stream().mapToInt(Repository::getForks).sum();
        result.setTotalForks(totalForks);

        double avgStars = totalRepos > 0 ? (double) totalStars / totalRepos : 0.0;
        result.setAvgStars(Math.round(avgStars * 10.0) / 10.0);

        double avgForks = totalRepos > 0 ? (double) totalForks / totalRepos : 0.0;
        result.setAvgForks(Math.round(avgForks * 10.0) / 10.0);

        // Repositories of Interest
        Repository mostStarred = repositories.stream()
                .max(Comparator.comparingInt(Repository::getStars))
                .orElse(null);
        result.setMostStarredRepository(mostStarred);

        Repository mostForked = repositories.stream()
                .max(Comparator.comparingInt(Repository::getForks))
                .orElse(null);
        result.setMostForkedRepository(mostForked);

        Repository newest = repositories.stream()
                .filter(r -> r.getCreatedAt() != null)
                .max(Comparator.comparing(Repository::getCreatedAt))
                .orElse(null);
        result.setNewestRepository(newest);

        Repository oldest = repositories.stream()
                .filter(r -> r.getCreatedAt() != null)
                .min(Comparator.comparing(Repository::getCreatedAt))
                .orElse(null);
        result.setOldestRepository(oldest);

        Repository recentlyUpdated = repositories.stream()
                .filter(r -> r.getUpdatedAt() != null)
                .max(Comparator.comparing(Repository::getUpdatedAt))
                .orElse(null);
        result.setRecentlyUpdatedRepository(recentlyUpdated);

        // Top 5 Repositories sorted by Stars
        List<Repository> top5 = repositories.stream()
                .sorted(Comparator.comparingInt(Repository::getStars).reversed())
                .limit(5)
                .collect(Collectors.toList());
        result.setTop5Repositories(top5);

        // Language Distribution
        Map<String, Long> languages = repositories.stream()
                .collect(Collectors.groupingBy(Repository::getLanguage, Collectors.counting()));
        result.setLanguageDistribution(languages);

        // Distribution of repos (Forked vs Original)
        int forkedCount = (int) repositories.stream().filter(Repository::isFork).count();
        result.setForkedReposCount(forkedCount);
        result.setOriginalReposCount(totalRepos - forkedCount);
        result.setPublicReposCount(totalRepos);

        return result;
    }

    private UserProfile fetchUserProfile(String username) throws IOException, InterruptedException {
        String url = BASE_URL + "/users/" + encodeValue(username);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("User-Agent", "Java-Spring-GitHub-User-Analyzer")
                .header("Accept", "application/vnd.github+json")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 404) {
            throw new IllegalArgumentException("GitHub user '" + username + "' not found.");
        } else if (response.statusCode() == 403) {
            throw new IOException("API rate limit exceeded (403).");
        } else if (response.statusCode() != 200) {
            throw new IOException("Failed to fetch user. HTTP Status: " + response.statusCode());
        }

        return gson.fromJson(response.body(), UserProfile.class);
    }

    private List<Repository> fetchRepositories(String username) throws IOException, InterruptedException {
        List<Repository> allRepos = new ArrayList<>();
        int page = 1;
        int perPage = 100;
        boolean hasMore = true;

        while (hasMore) {
            String url = BASE_URL + "/users/" + encodeValue(username) + "/repos?per_page=" + perPage + "&page=" + page;
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", "Java-Spring-GitHub-User-Analyzer")
                    .header("Accept", "application/vnd.github+json")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 404) {
                throw new IllegalArgumentException("GitHub user not found.");
            } else if (response.statusCode() == 403) {
                throw new IOException("API rate limit exceeded (403).");
            } else if (response.statusCode() != 200) {
                throw new IOException("Failed to fetch repositories. Status: " + response.statusCode());
            }

            Type listType = new TypeToken<List<Repository>>() {}.getType();
            List<Repository> pageRepos = gson.fromJson(response.body(), listType);

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
        return value.replace(" ", "%20");
    }
}
