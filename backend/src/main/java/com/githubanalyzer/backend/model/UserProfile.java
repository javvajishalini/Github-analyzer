package com.githubanalyzer.backend.model;

import com.google.gson.annotations.SerializedName;

public class UserProfile {
    @SerializedName("login")
    private String username;

    @SerializedName("name")
    private String name;

    @SerializedName("avatar_url")
    private String avatarUrl;

    @SerializedName("blog")
    private String blog;

    @SerializedName("bio")
    private String bio;

    @SerializedName("location")
    private String location;

    @SerializedName("followers")
    private int followers;

    @SerializedName("following")
    private int following;

    @SerializedName("public_repos")
    private int publicRepos;

    @SerializedName("created_at")
    private String createdAt;

    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getName() { return name != null ? name : "N/A"; }
    public void setName(String name) { this.name = name; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getBlog() { return blog; }
    public void setBlog(String blog) { this.blog = blog; }

    public String getBio() { return bio != null ? bio : "N/A"; }
    public void setBio(String bio) { this.bio = bio; }

    public String getLocation() { return location != null ? location : "N/A"; }
    public void setLocation(String location) { this.location = location; }

    public int getFollowers() { return followers; }
    public void setFollowers(int followers) { this.followers = followers; }

    public int getFollowing() { return following; }
    public void setFollowing(int following) { this.following = following; }

    public int getPublicRepos() { return publicRepos; }
    public void setPublicRepos(int publicRepos) { this.publicRepos = publicRepos; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
