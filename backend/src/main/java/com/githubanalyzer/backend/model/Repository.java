package com.githubanalyzer.backend.model;

import com.google.gson.annotations.SerializedName;

public class Repository {
    @SerializedName("name")
    private String name;

    @SerializedName("description")
    private String description;

    @SerializedName("stargazers_count")
    private int stars;

    @SerializedName("forks_count")
    private int forks;

    @SerializedName("language")
    private String language;

    @SerializedName("fork")
    private boolean isFork;

    @SerializedName("created_at")
    private String createdAt;

    @SerializedName("updated_at")
    private String updatedAt;

    @SerializedName("html_url")
    private String htmlUrl;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description != null ? description : "No description provided."; }
    public void setDescription(String description) { this.description = description; }

    public int getStars() { return stars; }
    public void setStars(int stars) { this.stars = stars; }

    public int getForks() { return forks; }
    public void setForks(int forks) { this.forks = forks; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public boolean isFork() { return isFork; }
    public void setFork(boolean fork) { isFork = fork; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public String getHtmlUrl() { return htmlUrl; }
    public void setHtmlUrl(String htmlUrl) { this.htmlUrl = htmlUrl; }
}
