package com.githubanalyzer.backend.service;

import com.githubanalyzer.backend.model.AnalysisResult;
import com.githubanalyzer.backend.model.Repository;
import com.githubanalyzer.backend.dto.UserProfileDto;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Comparator;
import java.time.OffsetDateTime;
import java.util.stream.Collectors;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Collections;
import com.githubanalyzer.backend.dto.RepoDto;
import com.githubanalyzer.backend.dto.ActivityDashboardDto;
import com.githubanalyzer.backend.dto.EventDto;




@Service
public class GitHubService {
    private static final String BASE_URL = "https://api.github.com";
    private final HttpClient httpClient;
    private final Gson gson;
    
    // Simple memory cache to prevent rate limit triggers on page navigation
    private final Map<String, AnalysisResult> analysisCache = new ConcurrentHashMap<>();
    private final Map<String, List<Repository>> reposCache = new ConcurrentHashMap<>();
    private final Map<String, Long> cacheTimestamps = new ConcurrentHashMap<>();
    private static final long CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

    public GitHubService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.gson = new Gson();
    }

    private boolean isCacheValid(String username) {
        Long timestamp = cacheTimestamps.get(username);
        return timestamp != null && (System.currentTimeMillis() - timestamp) < CACHE_DURATION_MS;
    }

    /**
     * Performs API calls and calculates analytics.
     */
    public AnalysisResult analyzeUser(String username) throws IOException, InterruptedException {
        if (isCacheValid(username) && analysisCache.containsKey(username)) {
            return analysisCache.get(username);
        }

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

        // Language Distribution – exclude repos with no detected language
        Map<String, Long> languages = repositories.stream()
                .filter(r -> r.getLanguage() != null
                          && !r.getLanguage().isEmpty()
                          && !r.getLanguage().equals("Unknown"))
                .collect(Collectors.groupingBy(Repository::getLanguage, Collectors.counting()));

        // Sort by count descending (LinkedHashMap preserves order)
        Map<String, Long> sortedLanguages = languages.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        java.util.LinkedHashMap::new));
        result.setLanguageDistribution(sortedLanguages);

        // Distribution of repos (Forked vs Original)
        int forkedCount = (int) repositories.stream().filter(Repository::isFork).count();
        result.setForkedReposCount(forkedCount);
        result.setOriginalReposCount(totalRepos - forkedCount);
        result.setPublicReposCount(totalRepos);

        analysisCache.put(username, result);
        cacheTimestamps.put(username, System.currentTimeMillis());
        return result;
    }

    public UserProfileDto getUserProfileDto(String username) throws IOException, InterruptedException {
        UserProfile profile = fetchUserProfile(username);
        return new UserProfileDto(
                profile.getAvatarUrl(),
                profile.getName(),
                profile.getUsername(),
                profile.getBlog(),
                profile.getBio(),
                profile.getLocation(),
                profile.getCreatedAt(),
                profile.getFollowers(),
                profile.getFollowing(),
                profile.getPublicRepos()
        );
    }

    // ---------------------------------------------------------------------
    // Public API for controller – returns a list of RepoDto for a user
    // ---------------------------------------------------------------------
    public List<RepoDto> getUserRepositoriesDto(String username) throws IOException, InterruptedException {
        List<Repository> repos;
        if (isCacheValid(username) && reposCache.containsKey(username)) {
            repos = reposCache.get(username);
        } else {
            repos = fetchRepositories(username);
            reposCache.put(username, repos);
        }
        
        return repos.stream()
                .map(r -> new RepoDto(
                        r.getName(),
                        r.getDescription(),
                        r.getHtmlUrl(),
                        r.getLanguage(),
                        r.getStars(),
                        r.getForks(),
                        r.isFork(),
                        parseOffsetDateTime(r.getCreatedAt()),
                        parseOffsetDateTime(r.getUpdatedAt())))
                .collect(Collectors.toList());
    }

    public ActivityDashboardDto getDashboardEvents(String username) throws IOException, InterruptedException {
        String url = BASE_URL + "/users/" + encodeValue(username) + "/events?per_page=100";
        String token = System.getenv("GITHUB_TOKEN");

        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("User-Agent", "Java-Spring-GitHub-User-Analyzer")
                .header("Accept", "application/vnd.github+json")
                .GET();

        if (token != null && !token.isEmpty()) {
            builder.header("Authorization", "Bearer " + token);
        }
        HttpRequest request = builder.build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        ActivityDashboardDto dto = new ActivityDashboardDto();
        if (response.statusCode() != 200) {
            // Return empty dto if no events or error (could be 404, etc.)
            return dto;
        }

        Type listType = new TypeToken<List<Map<String, Object>>>() {}.getType();
        List<Map<String, Object>> events = gson.fromJson(response.body(), listType);
        
        if (events == null) {
            return dto;
        }

        Map<LocalDate, Integer> heatmap = new HashMap<>();
        int pushCount = 0;
        int prCount = 0;
        int issuesCount = 0;
        List<EventDto> recentEvents = new ArrayList<>();

        DateTimeFormatter formatter = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

        for (Map<String, Object> event : events) {
            String type = (String) event.get("type");
            String createdAtStr = (String) event.get("created_at");
            
            if (createdAtStr != null) {
                LocalDate date = OffsetDateTime.parse(createdAtStr, formatter).toLocalDate();
                heatmap.put(date, heatmap.getOrDefault(date, 0) + 1);
            }

            if ("PushEvent".equals(type)) pushCount++;
            else if ("PullRequestEvent".equals(type)) prCount++;
            else if ("IssuesEvent".equals(type)) issuesCount++;

            // Grab top 10 recent events
            if (recentEvents.size() < 10) {
                String id = (String) event.get("id");
                Map<String, Object> repoObj = (Map<String, Object>) event.get("repo");
                String repoName = repoObj != null ? (String) repoObj.get("name") : "Unknown";
                recentEvents.add(new EventDto(id, type, repoName, createdAtStr));
            }
        }

        // Calculate Streak
        List<LocalDate> activeDays = new ArrayList<>(heatmap.keySet());
        Collections.sort(activeDays);
        int currentStreak = 0;
        int maxStreak = 0;
        int tempStreak = 0;
        LocalDate prevDate = null;

        for (LocalDate date : activeDays) {
            if (prevDate == null || prevDate.plusDays(1).equals(date)) {
                tempStreak++;
            } else if (!prevDate.equals(date)) {
                tempStreak = 1;
            }
            if (tempStreak > maxStreak) {
                maxStreak = tempStreak;
            }
            prevDate = date;
        }
        
        // Calculate current streak from today
        LocalDate today = LocalDate.now();
        if (heatmap.containsKey(today)) {
            currentStreak = 1;
            LocalDate checkDate = today.minusDays(1);
            while (heatmap.containsKey(checkDate)) {
                currentStreak++;
                checkDate = checkDate.minusDays(1);
            }
        } else if (heatmap.containsKey(today.minusDays(1))) {
            currentStreak = 1;
            LocalDate checkDate = today.minusDays(2);
            while (heatmap.containsKey(checkDate)) {
                currentStreak++;
                checkDate = checkDate.minusDays(1);
            }
        }

        dto.setHeatmap(heatmap);
        dto.setCurrentStreak(currentStreak);
        dto.setLongestStreak(maxStreak);
        dto.setTotalEventsLast90Days(events.size());
        dto.setPushEventsCount(pushCount);
        dto.setPullRequestsCount(prCount);
        dto.setIssuesOpenedCount(issuesCount);
        dto.setRecentEvents(recentEvents);

        return dto;
    }

    private UserProfile fetchUserProfile(String username) throws IOException, InterruptedException {
        String url = BASE_URL + "/users/" + encodeValue(username);
        String token = System.getenv("GITHUB_TOKEN");

        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("User-Agent", "Java-Spring-GitHub-User-Analyzer")
                .header("Accept", "application/vnd.github+json")
                .GET();

        if (token != null && !token.isEmpty()) {
            builder.header("Authorization", "Bearer " + token);
        }
        HttpRequest request = builder.build();

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
            String token = System.getenv("GITHUB_TOKEN");

            HttpRequest.Builder builder = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", "Java-Spring-GitHub-User-Analyzer")
                    .header("Accept", "application/vnd.github+json")
                    .GET();

            if (token != null && !token.isEmpty()) {
                builder.header("Authorization", "Bearer " + token);
            }
            HttpRequest request = builder.build();

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

    /**
     * Parses an ISO-8601 date string returned by GitHub API into {@link OffsetDateTime}.
     * Returns {@code null} if the input is {@code null} or cannot be parsed.
     */
    private OffsetDateTime parseOffsetDateTime(String dateStr) {
        if (dateStr == null) return null;
        try {
            return OffsetDateTime.parse(dateStr);
        } catch (Exception e) {
            // Fallback: return null if parsing fails
            return null;
        }
    }

    private String encodeValue(String value) {
        return value.replace(" ", "%20");
    }
}
