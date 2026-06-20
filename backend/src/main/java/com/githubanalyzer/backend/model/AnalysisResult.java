package com.githubanalyzer.backend.model;

import java.util.List;
import java.util.Map;

public class AnalysisResult {
    private UserProfile profile;
    private List<Repository> repositories;
    
    // Repository Analytics
    private int totalRepos;
    private int totalStars;
    private int totalForks;
    private double avgStars;
    private double avgForks;

    // Repositories of Interest
    private Repository mostStarredRepository;
    private Repository mostForkedRepository;
    private Repository newestRepository;
    private Repository oldestRepository;
    private Repository recentlyUpdatedRepository;

    // Top 5 Repositories
    private List<Repository> top5Repositories;

    // Language Counts
    private Map<String, Long> languageDistribution;

    // Repository Distribution
    private int publicReposCount;
    private int forkedReposCount;
    private int originalReposCount;

    // Getters and Setters
    public UserProfile getProfile() { return profile; }
    public void setProfile(UserProfile profile) { this.profile = profile; }

    public List<Repository> getRepositories() { return repositories; }
    public void setRepositories(List<Repository> repositories) { this.repositories = repositories; }

    public int getTotalRepos() { return totalRepos; }
    public void setTotalRepos(int totalRepos) { this.totalRepos = totalRepos; }

    public int getTotalStars() { return totalStars; }
    public void setTotalStars(int totalStars) { this.totalStars = totalStars; }

    public int getTotalForks() { return totalForks; }
    public void setTotalForks(int totalForks) { this.totalForks = totalForks; }

    public double getAvgStars() { return avgStars; }
    public void setAvgStars(double avgStars) { this.avgStars = avgStars; }

    public double getAvgForks() { return avgForks; }
    public void setAvgForks(double avgForks) { this.avgForks = avgForks; }

    public Repository getMostStarredRepository() { return mostStarredRepository; }
    public void setMostStarredRepository(Repository mostStarredRepository) { this.mostStarredRepository = mostStarredRepository; }

    public Repository getMostForkedRepository() { return mostForkedRepository; }
    public void setMostForkedRepository(Repository mostForkedRepository) { this.mostForkedRepository = mostForkedRepository; }

    public Repository getNewestRepository() { return newestRepository; }
    public void setNewestRepository(Repository newestRepository) { this.newestRepository = newestRepository; }

    public Repository getOldestRepository() { return oldestRepository; }
    public void setOldestRepository(Repository oldestRepository) { this.oldestRepository = oldestRepository; }

    public Repository getRecentlyUpdatedRepository() { return recentlyUpdatedRepository; }
    public void setRecentlyUpdatedRepository(Repository recentlyUpdatedRepository) { this.recentlyUpdatedRepository = recentlyUpdatedRepository; }

    public List<Repository> getTop5Repositories() { return top5Repositories; }
    public void setTop5Repositories(List<Repository> top5Repositories) { this.top5Repositories = top5Repositories; }

    public Map<String, Long> getLanguageDistribution() { return languageDistribution; }
    public void setLanguageDistribution(Map<String, Long> languageDistribution) { this.languageDistribution = languageDistribution; }

    public int getPublicReposCount() { return publicReposCount; }
    public void setPublicReposCount(int publicReposCount) { this.publicReposCount = publicReposCount; }

    public int getForkedReposCount() { return forkedReposCount; }
    public void setForkedReposCount(int forkedReposCount) { this.forkedReposCount = forkedReposCount; }

    public int getOriginalReposCount() { return originalReposCount; }
    public void setOriginalReposCount(int originalReposCount) { this.originalReposCount = originalReposCount; }
}
