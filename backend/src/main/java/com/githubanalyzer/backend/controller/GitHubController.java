package com.githubanalyzer.backend.controller;

import com.githubanalyzer.backend.dto.UserProfileDto;
import com.githubanalyzer.backend.dto.RepoDto;
import com.githubanalyzer.backend.dto.ActivityDashboardDto;
import com.githubanalyzer.backend.dto.SuggestionDto;
import com.githubanalyzer.backend.exception.UserNotFoundException;
import com.githubanalyzer.backend.model.AnalysisResult;
import com.githubanalyzer.backend.service.GitHubService;
import com.githubanalyzer.backend.service.SuggestionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/github")
@CrossOrigin(origins = "*")
public class GitHubController {

    private final GitHubService gitHubService;
    private final SuggestionService suggestionService;

    public GitHubController(GitHubService gitHubService, SuggestionService suggestionService) {
        this.gitHubService = gitHubService;
        this.suggestionService = suggestionService;
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<UserProfileDto> getUserProfile(@PathVariable String username) throws IOException, InterruptedException {
        return ResponseEntity.ok(gitHubService.getUserProfileDto(username));
    }

    @GetMapping("/repos/{username}")
    public ResponseEntity<List<RepoDto>> getUserRepos(@PathVariable String username) throws IOException, InterruptedException {
        return ResponseEntity.ok(gitHubService.getUserRepositoriesDto(username));
    }

    @GetMapping("/analytics/{username}")
    public ResponseEntity<AnalysisResult> getAnalytics(@PathVariable String username) throws IOException, InterruptedException {
        return ResponseEntity.ok(gitHubService.analyzeUser(username));
    }

    @GetMapping("/languages/{username}")
    public ResponseEntity<Map<String, Long>> getLanguages(@PathVariable String username) throws IOException, InterruptedException {
        AnalysisResult result = gitHubService.analyzeUser(username);
        return ResponseEntity.ok(result.getLanguageDistribution());
    }

    @GetMapping("/activity/{username}")
    public ResponseEntity<Map<String, Object>> getActivity(@PathVariable String username) throws IOException, InterruptedException {
        AnalysisResult result = gitHubService.analyzeUser(username);
        // Return a subset of activity data
        return ResponseEntity.ok(Map.of(
                "newestRepository", result.getNewestRepository(),
                "recentlyUpdatedRepository", result.getRecentlyUpdatedRepository(),
                "oldestRepository", result.getOldestRepository()
        ));
    }

    @GetMapping("/dashboard/{username}")
    public ResponseEntity<ActivityDashboardDto> getDashboardEvents(@PathVariable String username) throws IOException, InterruptedException {
        return ResponseEntity.ok(gitHubService.getDashboardEvents(username));
    }

    @GetMapping("/suggestions/{username}")
    public ResponseEntity<List<SuggestionDto>> getSuggestions(@PathVariable String username) {
        try {
            List<SuggestionDto> suggestions = suggestionService.getSuggestions(username);
            return ResponseEntity.ok(suggestions);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (IOException | InterruptedException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
