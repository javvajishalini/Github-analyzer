package com.githubanalyzer.analyzer;

import com.githubanalyzer.model.Repository;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Class responsible for analyzing GitHub repository data.
 */
public class Analyzer {
    private final List<Repository> repositories;

    public Analyzer(List<Repository> repositories) {
        this.repositories = repositories != null ? repositories : Collections.emptyList();
    }

    /**
     * Gets the total count of repositories.
     */
    public int getTotalRepositories() {
        return repositories.size();
    }

    /**
     * Calculates total stars received across all repositories.
     */
    public int getTotalStars() {
        return repositories.stream()
                .mapToInt(Repository::getStars)
                .sum();
    }

    /**
     * Finds the repository with the maximum number of stars.
     * Returns null if the user has no repositories.
     */
    public Repository getMostStarredRepository() {
        return repositories.stream()
                .max((r1, r2) -> Integer.compare(r1.getStars(), r2.getStars()))
                .orElse(null);
    }

    /**
     * Finds the repository with the maximum number of forks.
     * Returns null if the user has no repositories.
     */
    public Repository getHighestForkedRepository() {
        return repositories.stream()
                .max((r1, r2) -> Integer.compare(r1.getForks(), r2.getForks()))
                .orElse(null);
    }

    /**
     * Aggregates and returns a sorted map of programming languages and their usage frequency (count of repos).
     * The map is sorted in descending order of popularity.
     */
    public List<Map.Entry<String, Long>> getMostUsedLanguages() {
        Map<String, Long> languageCounts = repositories.stream()
                // Filter out "Unknown" or not, let's include but keep clean
                .collect(Collectors.groupingBy(Repository::getLanguage, Collectors.counting()));

        return languageCounts.entrySet().stream()
                .sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
                .collect(Collectors.toList());
    }
}
