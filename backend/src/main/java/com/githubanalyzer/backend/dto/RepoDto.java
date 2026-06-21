package com.githubanalyzer.backend.dto;

import java.time.OffsetDateTime;

public class RepoDto {
    private String name;
    private String description;
    private String htmlUrl;
    private String language;
    private int stars;
    private int forks;
    private boolean fork;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public RepoDto() {}

    public RepoDto(String name, String description, String htmlUrl, String language, int stars, int forks, boolean fork, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.name = name;
        this.description = description;
        this.htmlUrl = htmlUrl;
        this.language = language;
        this.stars = stars;
        this.forks = forks;
        this.fork = fork;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getHtmlUrl() { return htmlUrl; }
    public void setHtmlUrl(String htmlUrl) { this.htmlUrl = htmlUrl; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public int getStars() { return stars; }
    public void setStars(int stars) { this.stars = stars; }
    public int getForks() { return forks; }
    public void setForks(int forks) { this.forks = forks; }
    public boolean isFork() { return fork; }
    public void setFork(boolean fork) { this.fork = fork; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
