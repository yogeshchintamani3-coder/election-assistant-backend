package com.election.assistant.model;

public record ElectionStep(
        int order,
        String title,
        String description,
        String duration,
        String icon
) {}
