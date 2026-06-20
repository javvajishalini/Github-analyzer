package com.githubanalyzer.model;

import com.google.gson.annotations.SerializedName;

/**
 * Model class representing a GitHub User Profile.
 */
public class UserProfile {
    @SerializedName("login")
    private String username;

    @SerializedName("name")
    private String name;

    @SerializedName("bio")
    private String bio;

    @SerializedName("followers")
    private int followers;

    @SerializedName("following")
    private int following;

    @SerializedName("public_repos")
    private int publicRepos;

    @SerializedName("created_at")
    private String createdAt;

    // Getters
    public String getUsername() {
        return username;
    }

    public String getName() {
        return name != null ? name : "N/A";
    }

    public String getBio() {
        return bio != null ? bio : "N/A";
    }

    public int getFollowers() {
        return followers;
    }

    public int getFollowing() {
        return following;
    }

    public int getPublicRepos() {
        return publicRepos;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    @Override
    public String toString() {
        return "UserProfile{" +
                "username='" + username + '\'' +
                ", name='" + name + '\'' +
                ", bio='" + bio + '\'' +
                ", followers=" + followers +
                ", following=" + following +
                ", publicRepos=" + publicRepos +
                ", createdAt='" + createdAt + '\'' +
                '}';
    }
}
