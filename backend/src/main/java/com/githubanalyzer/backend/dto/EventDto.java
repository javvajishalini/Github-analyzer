package com.githubanalyzer.backend.dto;

public class EventDto {
    private String id;
    private String type;
    private String repoName;
    private String createdAt;

    public EventDto() {}

    public EventDto(String id, String type, String repoName, String createdAt) {
        this.id = id;
        this.type = type;
        this.repoName = repoName;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getRepoName() { return repoName; }
    public void setRepoName(String repoName) { this.repoName = repoName; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
