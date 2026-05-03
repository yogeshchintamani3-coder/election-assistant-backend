package com.election.assistant.model;

import java.util.List;

public record Country(
        String code,
        String name,
        String flagEmoji,
        List<String> electionTypes
) {}
