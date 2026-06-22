package com.githubanalyzer.backend.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class ActivityDashboardDto {
    private Map<LocalDate, Integer> heatmap;
    private int currentStreak;
    private int longestStreak;
    private int totalEventsLast90Days;
    private int pushEventsCount;
    private int pullRequestsCount;
    private int issuesOpenedCount;
    private List<EventDto> recentEvents;

    // Constructors, Getters, Setters
    public ActivityDashboardDto() {}

    public Map<LocalDate, Integer> getHeatmap() { return heatmap; }
    public void setHeatmap(Map<LocalDate, Integer> heatmap) { this.heatmap = heatmap; }

    public int getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }

    public int getLongestStreak() { return longestStreak; }
    public void setLongestStreak(int longestStreak) { this.longestStreak = longestStreak; }

    public int getTotalEventsLast90Days() { return totalEventsLast90Days; }
    public void setTotalEventsLast90Days(int totalEventsLast90Days) { this.totalEventsLast90Days = totalEventsLast90Days; }

    public int getPushEventsCount() { return pushEventsCount; }
    public void setPushEventsCount(int pushEventsCount) { this.pushEventsCount = pushEventsCount; }

    public int getPullRequestsCount() { return pullRequestsCount; }
    public void setPullRequestsCount(int pullRequestsCount) { this.pullRequestsCount = pullRequestsCount; }

    public int getIssuesOpenedCount() { return issuesOpenedCount; }
    public void setIssuesOpenedCount(int issuesOpenedCount) { this.issuesOpenedCount = issuesOpenedCount; }

    public List<EventDto> getRecentEvents() { return recentEvents; }
    public void setRecentEvents(List<EventDto> recentEvents) { this.recentEvents = recentEvents; }
}
