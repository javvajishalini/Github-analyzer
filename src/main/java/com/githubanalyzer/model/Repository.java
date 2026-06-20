package com.githubanalyzer.model;

import com.google.gson.annotations.SerializedName;

/**
 * Model class representing a GitHub Repository.
 */
public class Repository {
    @SerializedName("name")
    private String name;

    @SerializedName("html_url")
    private String htmlUrl;

    @SerializedName("stargazers_count")
    private int stars;

    @SerializedName("language")
    private String language;

    @SerializedName("forks_count")
    private int forks;

    // Getters
    public String getName() {
        return name;
    }

    public String getHtmlUrl() {
        return htmlUrl;
    }

    public int getStars() {
        return stars;
    }

    public String getLanguage() {
        return language != null ? language : "Unknown";
    }

    public int getForks() {
        return forks;
    }

    @Override
    public String toString() {
        return "Repository{" +
                "name='" + name + '\'' +
                ", htmlUrl='" + htmlUrl + '\'' +
                ", stars=" + stars +
                ", language='" + language + '\'' +
                ", forks=" + forks +
                '}';
    }
}
