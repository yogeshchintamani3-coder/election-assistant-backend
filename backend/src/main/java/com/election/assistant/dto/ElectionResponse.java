package com.election.assistant.dto;

import java.util.List;

public record ElectionResponse(
        String id,
        String name,
        String electionDay,
        String ocdDivisionId
) {}
