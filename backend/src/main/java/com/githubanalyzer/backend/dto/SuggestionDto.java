package com.githubanalyzer.backend.dto;

public class SuggestionDto {
    private String type; // "PROFILE", "REPOSITORY", "ACTIVITY"
    private String message;
    private String target; // "Profile", repository name, or "Activity"

    public SuggestionDto() {}

    public SuggestionDto(String type, String message, String target) {
        this.type = type;
        this.message = message;
        this.target = target;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }
}
