package com.githubanalyzer.backend.controller;

import com.githubanalyzer.backend.dto.UserProfileDto;

import com.githubanalyzer.backend.service.GitHubService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/github")
public class GitHubController {

    private final GitHubService gitHubService;

    public GitHubController(GitHubService gitHubService) {
        this.gitHubService = gitHubService;
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<UserProfileDto> getUserProfile(@PathVariable String username) {
        UserProfileDto profile = gitHubService.getUserProfileDto(username);
        return ResponseEntity.ok(profile);
    }
}
