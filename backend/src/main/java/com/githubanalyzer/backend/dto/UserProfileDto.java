package com.githubanalyzer.backend.dto;

public class UserProfileDto {
    private String avatarUrl;
    private String name;
    private String login;
    private String bio;
    private String location;
    private String createdAt;
    private int followers;
    private int following;
    private int publicRepos;

    public UserProfileDto() {}

    public UserProfileDto(String avatarUrl, String name, String login, String bio, String location, String createdAt, int followers, int following, int publicRepos) {
        this.avatarUrl = avatarUrl;
        this.name = name;
        this.login = login;
        this.bio = bio;
        this.location = location;
        this.createdAt = createdAt;
        this.followers = followers;
        this.following = following;
        this.publicRepos = publicRepos;
    }

    // Getters and Setters
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getLogin() { return login; }
    public void setLogin(String login) { this.login = login; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public int getFollowers() { return followers; }
    public void setFollowers(int followers) { this.followers = followers; }
    public int getFollowing() { return following; }
    public void setFollowing(int following) { this.following = following; }
    public int getPublicRepos() { return publicRepos; }
    public void setPublicRepos(int publicRepos) { this.publicRepos = publicRepos; }
}
