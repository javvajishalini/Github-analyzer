package com.githubanalyzer.backend.controller;

import com.githubanalyzer.backend.dto.UserProfileDto;
import com.githubanalyzer.backend.service.GitHubService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.io.IOException;

@RestController
@RequestMapping("/api/github")
public class GitHubController {

    private final GitHubService gitHubService;

    public GitHubController(GitHubService gitHubService) {
        this.gitHubService = gitHubService;
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<UserProfileDto> getUserProfile(@PathVariable String username) throws IOException, InterruptedException {
        UserProfileDto profile = gitHubService.getUserProfileDto(username);
        return ResponseEntity.ok(profile);
    }
}
