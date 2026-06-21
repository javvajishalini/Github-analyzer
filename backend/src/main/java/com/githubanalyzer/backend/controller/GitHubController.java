package com.githubanalyzer.backend.controller;

import com.githubanalyzer.backend.dto.UserProfileDto;
import com.githubanalyzer.backend.dto.RepoDto;
import com.githubanalyzer.backend.exception.UserNotFoundException;
import com.githubanalyzer.backend.model.AnalysisResult;
import com.githubanalyzer.backend.service.GitHubService;
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

    public GitHubController(GitHubService gitHubService) {
        this.gitHubService = gitHubService;
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
}
