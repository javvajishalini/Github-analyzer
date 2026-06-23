package com.githubanalyzer.backend.service;

import com.githubanalyzer.backend.dto.SuggestionDto;
import com.githubanalyzer.backend.dto.ActivityDashboardDto;
import com.githubanalyzer.backend.model.Repository;
import com.githubanalyzer.backend.model.UserProfile;
import com.githubanalyzer.backend.model.AnalysisResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class SuggestionService {

    private final GitHubService gitHubService;

    @Autowired
    public SuggestionService(GitHubService gitHubService) {
        this.gitHubService = gitHubService;
    }

    public List<SuggestionDto> getSuggestions(String username) throws IOException, InterruptedException {
        List<SuggestionDto> suggestions = new ArrayList<>();
        
        AnalysisResult analysis = gitHubService.analyzeUser(username);
        UserProfile profile = analysis.getProfile();
        List<Repository> repositories = analysis.getRepositories();
        ActivityDashboardDto activity = gitHubService.getDashboardEvents(username);

        // 1. Profile Suggestions
        if (profile.getBio() == null || profile.getBio().isEmpty() || "N/A".equals(profile.getBio())) {
            suggestions.add(new SuggestionDto("PROFILE", "Add a bio to improve profile completeness.", "Profile"));
        }
        if (profile.getLocation() == null || profile.getLocation().isEmpty() || "N/A".equals(profile.getLocation())) {
            suggestions.add(new SuggestionDto("PROFILE", "Consider adding your location.", "Profile"));
        }
        if (profile.getBlog() == null || profile.getBlog().isEmpty()) {
            suggestions.add(new SuggestionDto("PROFILE", "Add a portfolio or website link.", "Profile"));
        }
        if (profile.getPublicRepos() < 5) {
            suggestions.add(new SuggestionDto("PROFILE", "Create more public repositories.", "Profile"));
        }

        // 2. Repository Suggestions
        for (Repository repo : repositories) {
            if (repo.isFork()) continue; // We usually care more about original repos

            if (repo.getDescription() == null || repo.getDescription().isEmpty() || "No description provided.".equals(repo.getDescription())) {
                suggestions.add(new SuggestionDto("REPOSITORY", "Add a repository description.", repo.getName()));
            }
            
            if (!repo.isHasWiki()) {
                // Using hasWiki as a proxy or heuristic for missing documentation
                suggestions.add(new SuggestionDto("REPOSITORY", "Add a README file.", repo.getName()));
            }

            if (repo.getLicense() == null) {
                suggestions.add(new SuggestionDto("REPOSITORY", "Add a LICENSE file.", repo.getName()));
            }

            if (repo.getUpdatedAt() != null) {
                try {
                    OffsetDateTime updatedAt = OffsetDateTime.parse(repo.getUpdatedAt());
                    OffsetDateTime sixMonthsAgo = OffsetDateTime.now().minus(6, ChronoUnit.MONTHS);
                    if (updatedAt.isBefore(sixMonthsAgo)) {
                        suggestions.add(new SuggestionDto("REPOSITORY", "Consider maintaining this repository.", repo.getName()));
                    }
                } catch (Exception ignored) {
                    // Ignore parsing errors
                }
            }
        }

        // 3. Activity Suggestions
        if (profile.getPublicRepos() < 10) {
            suggestions.add(new SuggestionDto("ACTIVITY", "Low repository count. Start some new projects!", "Activity"));
        }
        
        if (activity != null && activity.getPushEventsCount() < 5) {
            suggestions.add(new SuggestionDto("ACTIVITY", "Low contribution activity. Make some commits to get that graph green!", "Activity"));
        }

        // Pinned projects proxy: If max stars is 0, they probably haven't highlighted anything
        if (analysis.getMostStarredRepository() == null || analysis.getMostStarredRepository().getStars() == 0) {
            suggestions.add(new SuggestionDto("ACTIVITY", "Few pinned projects or stars. Pin your best work on your profile!", "Activity"));
        }

        return suggestions;
    }
}
