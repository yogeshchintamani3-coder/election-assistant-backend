package com.election.assistant.model;

import java.util.List;

public record ElectionProcess(
        String countryCode,
        String countryName,
        String electionType,
        String description,
        List<ElectionStep> steps,
        List<String> keyDates,
        List<String> eligibilityCriteria
) {}
